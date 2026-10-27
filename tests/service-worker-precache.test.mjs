import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const INDEX = path.join(ROOT, 'index.html');
const STYLES = path.join(ROOT, 'styles.css');
const WORKER = path.join(ROOT, 'service-worker.js');
const APP = path.join(ROOT, 'app.js');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function localAssetPath(value) {
  if (!value) return null;
  if (/^(?:https?:)?\/\//i.test(value)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  if (value.startsWith('#')) return null;

  const clean = value.split(/[?#]/)[0];
  if (!clean) return null;

  const normalized = path.posix.normalize(clean).replace(/^\/+/, '');
  return `./${normalized}`;
}

function htmlShellAssets(html) {
  const assets = new Set();
  const re = /<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*"([^"]+)"/gi;
  let match;

  while ((match = re.exec(html))) {
    const asset = localAssetPath(match[1]);
    if (asset) assets.add(asset);
  }

  return assets;
}

function jsModuleImports(source) {
  const patterns = [
    /^import\s*\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/gm,
    /^import\s+[^'"{]+\s+from\s*['"]([^'"]+)['"]/gm,
    /^import\s*['"]([^'"]+)['"]/gm,
    /^export\s*\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/gm,
    /^export\s+\*\s+from\s*['"]([^'"]+)['"]/gm
  ];
  const specs = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const spec = match[1].split(/[?#]/)[0];
      if (spec.startsWith('.')) specs.push(spec);
    }
  }

  return specs;
}

function collectModuleGraph(entryFile) {
  const files = new Set();
  const seen = new Set();
  const queue = [entryFile];

  while (queue.length > 0) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);

    for (const spec of jsModuleImports(read(file))) {
      const target = path.resolve(path.dirname(file), spec);
      if (!target.startsWith(ROOT)) continue;

      const relative = `./${path.relative(ROOT, target).split(path.sep).join('/')}`;
      files.add(relative);
      queue.push(target);
    }
  }

  return files;
}

function deriveShellSet() {
  const html = read(INDEX);
  const assets = htmlShellAssets(html);
  const modules = collectModuleGraph(APP);
  return {
    html,
    set: new Set(['./index.html', ...assets, ...modules])
  };
}

function parsePrecache(source) {
  const match = source.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
  assert.ok(match, 'service-worker.js must declare a literal PRECACHE_URLS array');
  return new Set([...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
}

test('precache list matches the actual shell graph', () => {
  const { set: expected } = deriveShellSet();
  const actual = parsePrecache(read(WORKER));

  assert.deepEqual([...actual].sort(), [...expected].sort());
  assert.equal(actual.has('./'), false);
  assert.equal(actual.has('./service-worker.js'), false);
  assert.equal(actual.has('./package.json'), false);
  assert.equal(actual.has('./PRODUCT.md'), false);
  assert.equal(actual.has('./DESIGN.md'), false);

  for (const url of actual) {
    assert.match(url, /^\.\//, `${url} must stay relative`);
    assert.equal(url.includes('?'), false, `${url} must not include a query`);
  }
});

test('service worker parses as a classic script', () => {
  execFileSync(process.execPath, ['--check', WORKER], { stdio: 'pipe' });
});

test('registration is guarded, relative, and update-checked', () => {
  const app = read(APP);

  assert.match(app, /navigator\.serviceWorker\.register\(\s*['"]\.\/service-worker\.js['"]/);
  assert.match(app, /scope:\s*['"]\.\/['"]/);
  assert.match(app, /updateViaCache:\s*['"]none['"]/);
  assert.match(app, /['"]serviceWorker['"]\s+in\s+navigator/);
  assert.match(app, /isSecureContext/);
  assert.match(app, /try\s*{\s*registerServiceWorker\(\);/);
});

test('cache lifecycle waits, claims, and cleans only this app', () => {
  const sw = read(WORKER);

  assert.match(sw, /const CACHE_NAME = ['"]meowmeow-bokbok-shell['"]/);
  assert.match(sw, /name\.startsWith\(['"]meowmeow-bokbok-['"]\)/);
  assert.match(sw, /name !== CACHE_NAME/);
  assert.match(sw, /caches\.keys\(\)/);
  assert.match(sw, /caches\.delete\(/);
  assert.match(sw, /cache\.keys\(\)/);
  assert.match(sw, /cache\.delete\(/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  assert.equal(sw.includes('skipWaiting'), false);
});

test('install and refresh use the required cache modes', () => {
  const sw = read(WORKER);

  assert.match(sw, /cache:\s*['"]reload['"]/);
  assert.match(sw, /cache:\s*['"]no-cache['"]/);
  assert.match(sw, /event\.waitUntil\(/);
  assert.match(sw, /response\.ok/);
  assert.match(sw, /response\.type === ['"]basic['"]/);
});

test('query keys are normalized and only entry navigations are mapped', () => {
  const sw = read(WORKER);

  assert.match(sw, /url\.search = ['"]{2}/);
  assert.match(sw, /url\.hash = ['"]{2}/);
  assert.match(sw, /request\.mode === ['"]navigate['"]/);
  assert.match(sw, /index\.html/);
  assert.match(sw, /ENTRY_PATHS/);
  assert.match(sw, /PRECACHE_KEYS/);
});

test('the version query stays in the page while the worker caches a clean URL', () => {
  const html = read(INDEX);
  const actual = parsePrecache(read(WORKER));

  assert.match(html, /app\.js\?v=[^"']+/);
  assert.equal(actual.has('./app.js?v=20261024-3'), false);
  assert.equal(actual.has('./app.js'), true);
});

test('the shell has no external assets or runtime network calls', () => {
  const html = read(INDEX);
  const htmlAssets = [
    ...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*"([^"]+)"/gi)
  ].map((match) => match[1]);

  for (const asset of htmlAssets) {
    assert.doesNotMatch(asset, /^(?:https?:)?\/\//i, `${asset} must be a local asset`);
  }

  const css = read(STYLES);
  assert.doesNotMatch(css, /url\(\s*['"]?https?:/i);
  assert.doesNotMatch(css, /@import\s+(?:url\()?['"]?https?:/i);

  const runtimeFiles = [...deriveShellSet().set].filter(
    (asset) => asset.endsWith('.js') && !asset.endsWith('service-worker.js')
  );

  for (const asset of runtimeFiles) {
    const source = read(path.join(ROOT, asset));
    assert.doesNotMatch(source, /\bfetch\s*\(/, `${asset} must not fetch`);
    assert.doesNotMatch(source, /\bXMLHttpRequest\b/, `${asset} must not use XHR`);
    assert.doesNotMatch(source, /\bsendBeacon\b/, `${asset} must not use sendBeacon`);
  }
});
