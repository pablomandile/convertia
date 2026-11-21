<?php
/**
 * Convertia — actualiza las cotizaciones y las publica como JSON estático.
 *
 * Uso (cron de hPanel, SIN "cd ... &&", que el ejecutor no soporta):
 *   /usr/bin/php /home/<usuario>/convertia/rates/fetch.php --out=/home/<usuario>/domains/<dominio>/public_html/api/v1
 *
 * En local:
 *   php rates/fetch.php --out=apps/web/public/api/v1
 *
 * Escribe:
 *   <out>/rates.json               cotizaciones actuales (unidades por 1 USD) + dólares AR
 *   <out>/history/AAAA-MM-DD.json  la última foto de cada día (para gráficos)
 *   <out>/.htaccess                CORS abierto y caché corta (API pública)
 *
 * Si una fuente falla, conserva lo último que tenía de esa fuente: nunca publica un archivo vacío.
 */

declare(strict_types=1);

const TIMEOUT = 20;
const MIN_FIAT_CURRENCIES = 100;

$options = getopt('', ['out::', 'quiet']);
$outDir = rtrim((string) ($options['out'] ?? __DIR__ . '/out'), '/\\');
$quiet = isset($options['quiet']);

function logLine(string $message): void
{
    fwrite(STDERR, '[' . gmdate('c') . "] $message\n");
}

function fetchJson(string $url): ?array
{
    $body = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => TIMEOUT,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT => 'convertia-rates/1.0',
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $result = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        if ($result !== false && $status >= 200 && $status < 300) {
            $body = $result;
        } else {
            logLine("HTTP $status en $url: " . curl_error($ch));
        }
    } else {
        $context = stream_context_create(['http' => [
            'timeout' => TIMEOUT,
            'header' => "Accept: application/json\r\nUser-Agent: convertia-rates/1.0\r\n",
        ]]);
        $result = @file_get_contents($url, false, $context);
        if ($result !== false) {
            $body = $result;
        } else {
            logLine("No se pudo leer $url");
        }
    }
    if ($body === null) {
        return null;
    }
    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

/** Monedas fiat (unidades por 1 USD) — ExchangeRate-API, actualiza una vez por día. */
function fetchFiat(): ?array
{
    $data = fetchJson('https://open.er-api.com/v6/latest/USD');
    if (($data['result'] ?? '') !== 'success' || !is_array($data['rates'] ?? null)) {
        return null;
    }
    $rates = array_filter($data['rates'], fn ($v) => is_numeric($v) && $v > 0);
    if (count($rates) < MIN_FIAT_CURRENCIES || !isset($rates['ARS'], $rates['EUR'])) {
        logLine('Respuesta de monedas fiat incompleta');
        return null;
    }
    return [
        'rates' => array_map('floatval', $rates),
        'source' => [
            'provider' => 'ExchangeRate-API',
            'url' => 'https://www.exchangerate-api.com',
            'updatedAt' => gmdate('c', (int) ($data['time_last_update_unix'] ?? time())),
        ],
    ];
}

/** Cripto — CoinGecko. Se guarda como unidades por 1 USD (1 / precio). */
function fetchCrypto(): ?array
{
    $ids = ['bitcoin' => 'BTC', 'ethereum' => 'ETH', 'tether' => 'USDT', 'solana' => 'SOL', 'usd-coin' => 'USDC'];
    $data = fetchJson('https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=' . implode(',', array_keys($ids)));
    if (!$data) {
        return null;
    }
    $rates = [];
    foreach ($ids as $id => $code) {
        $price = $data[$id]['usd'] ?? null;
        if (is_numeric($price) && $price > 0) {
            $rates[$code] = 1 / (float) $price;
        }
    }
    if (!isset($rates['BTC'])) {
        return null;
    }
    return [
        'rates' => $rates,
        'source' => ['provider' => 'CoinGecko', 'url' => 'https://www.coingecko.com', 'updatedAt' => gmdate('c')],
    ];
}

/** Dólares de Argentina (oficial, blue, MEP, CCL, tarjeta, cripto…) — DolarApi. */
function fetchArgentina(): ?array
{
    $data = fetchJson('https://dolarapi.com/v1/dolares');
    if (!$data || !array_is_list($data)) {
        return null;
    }
    $dolares = [];
    foreach ($data as $row) {
        if (!isset($row['casa'])) {
            continue;
        }
        $dolares[(string) $row['casa']] = [
            'nombre' => (string) ($row['nombre'] ?? $row['casa']),
            'compra' => is_numeric($row['compra'] ?? null) ? (float) $row['compra'] : null,
            'venta' => is_numeric($row['venta'] ?? null) ? (float) $row['venta'] : null,
            'actualizado' => (string) ($row['fechaActualizacion'] ?? ''),
        ];
    }
    if (!isset($dolares['oficial'])) {
        return null;
    }
    return [
        'dolares' => $dolares,
        'source' => ['provider' => 'DolarApi', 'url' => 'https://dolarapi.com', 'updatedAt' => gmdate('c')],
    ];
}

function writeAtomic(string $path, string $contents): void
{
    $tmp = $path . '.tmp-' . getmypid();
    if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
        throw new RuntimeException("No se pudo escribir $tmp");
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException("No se pudo reemplazar $path");
    }
}

// --- main ---------------------------------------------------------------

if (!is_dir("$outDir/history") && !mkdir("$outDir/history", 0755, true)) {
    logLine("No se pudo crear $outDir/history");
    exit(1);
}

$ratesPath = "$outDir/rates.json";
$previous = is_file($ratesPath) ? (json_decode((string) file_get_contents($ratesPath), true) ?: []) : [];

$fiat = fetchFiat();
$crypto = fetchCrypto();
$argentina = fetchArgentina();

$sources = $previous['sources'] ?? [];
$fiatRates = $previous['fiat'] ?? [];
$cryptoRates = $previous['crypto'] ?? [];
$dolares = $previous['ar']['dolares'] ?? [];

if ($fiat) {
    $fiatRates = $fiat['rates'];
    $sources['fiat'] = $fiat['source'];
}
if ($crypto) {
    $cryptoRates = $crypto['rates'];
    $sources['crypto'] = $crypto['source'];
}
if ($argentina) {
    $dolares = $argentina['dolares'];
    $sources['ar'] = $argentina['source'];
}

if (!$fiatRates) {
    logLine('Sin cotizaciones fiat (ni nuevas ni anteriores): no se publica nada.');
    exit(1);
}

$output = [
    'updatedAt' => gmdate('c'),
    'base' => 'USD',
    // Unidades de cada moneda por 1 USD. Es lo que usa la app para convertir.
    'rates' => $fiatRates + $cryptoRates,
    // Las mismas, separadas por origen, para conservarlas si una fuente falla.
    'fiat' => $fiatRates,
    'crypto' => $cryptoRates,
    'ar' => ['dolares' => $dolares],
    'sources' => $sources,
    'attribution' => 'Rates By Exchange Rate API (https://www.exchangerate-api.com), CoinGecko, DolarApi',
];

$json = json_encode($output, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);

try {
    writeAtomic($ratesPath, $json);
    writeAtomic("$outDir/history/" . gmdate('Y-m-d') . '.json', $json);

    if (!is_file("$outDir/.htaccess")) {
        writeAtomic("$outDir/.htaccess", <<<HTACCESS
        # API pública de Convertia: cualquiera puede leer estos JSON.
        <IfModule mod_headers.c>
            Header set Access-Control-Allow-Origin "*"
            Header set Cache-Control "public, max-age=600"
        </IfModule>
        Options -Indexes

        HTACCESS);
    }
} catch (RuntimeException $e) {
    logLine($e->getMessage());
    exit(1);
}

$failed = array_keys(array_filter(['fiat' => $fiat, 'crypto' => $crypto, 'ar' => $argentina], fn ($v) => $v === null));
if ($failed) {
    logLine('Fuentes con error (se conservó lo anterior): ' . implode(', ', $failed));
    exit(2);
}
if (!$quiet) {
    logLine(sprintf('OK: %d monedas, %d dólares AR → %s', count($output['rates']), count($dolares), $ratesPath));
}
exit(0);
