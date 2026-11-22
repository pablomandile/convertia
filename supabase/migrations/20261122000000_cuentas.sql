-- Convertia: cuentas. Favoritos, recientes y ajustes sincronizados entre dispositivos.
--
-- Todo se lee y escribe desde el navegador con la anon key: la seguridad está en las políticas RLS
-- (cada persona ve y toca solo sus filas) y en los CHECK (tamaños acotados, href internos).

-- ---------------------------------------------------------------------------
-- Perfil: la constancia de aceptación de los términos.
-- No tiene políticas de escritura: solo se escribe por accept_terms(), que pone la fecha del servidor.
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  terms_version text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leer el propio"
  on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));

-- Cada cuenta nueva nace con su perfil (sin términos aceptados).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.accept_terms(version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Hace falta iniciar sesión';
  end if;
  if version is null or char_length(version) > 20 then
    raise exception 'Versión inválida';
  end if;
  insert into public.profiles (user_id, terms_version, terms_accepted_at)
  values (auth.uid(), version, now())
  on conflict (user_id) do update
    set terms_version = excluded.terms_version,
        terms_accepted_at = excluded.terms_accepted_at;
end;
$$;

revoke execute on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Favoritos y recientes. Sincronización "local-first": cada ítem lleva su fecha de cambio y
-- los borrados viajan como lápidas (deleted = true) para que no resuciten desde otro dispositivo.
-- ---------------------------------------------------------------------------
create table public.user_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  list text not null check (list in ('favorites', 'recent')),
  key text not null check (char_length(key) between 1 and 200),
  label text not null check (char_length(label) between 1 and 200),
  -- Solo rutas internas: "/longitud/pies-a-metros". Nunca "//otro-sitio" ni "https://…".
  href text not null check (char_length(href) <= 300 and href ~ '^/[^/\\]' ),
  deleted boolean not null default false,
  updated_at timestamptz not null,
  primary key (user_id, list, key)
);

alter table public.user_items enable row level security;

create policy "user_items: leer los propios"
  on public.user_items for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_items: crear propios"
  on public.user_items for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "user_items: modificar propios"
  on public.user_items for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_items: borrar propios"
  on public.user_items for delete to authenticated
  using (user_id = (select auth.uid()));

-- Tope por persona, para que nadie use la base como depósito.
create function public.user_items_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.user_items where user_id = new.user_id) >= 500 then
    raise exception 'Se alcanzó el máximo de elementos guardados';
  end if;
  return new;
end;
$$;

create trigger user_items_limit
  before insert on public.user_items
  for each row execute function public.user_items_limit();

-- ---------------------------------------------------------------------------
-- Ajustes (tema, ciudades de husos horarios…): un JSON chico por persona.
-- ---------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 4096),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: leer los propios"
  on public.user_settings for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_settings: crear propios"
  on public.user_settings for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "user_settings: modificar propios"
  on public.user_settings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Eliminar la cuenta: borra el usuario de auth y, en cascada, todo lo suyo. Inmediato y definitivo.
-- ---------------------------------------------------------------------------
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Hace falta iniciar sesión';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Las funciones de los triggers no se llaman a mano.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.user_items_limit() from public, anon, authenticated;
