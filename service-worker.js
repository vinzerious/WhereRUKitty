/**
 * MeowMeow-BokBok app-shell service worker.
 *
 * Classic (non-module) worker so it runs without a build step. It precaches
 * the complete local shell, serves it cache-first, refreshes cached responses
 * in the background, and normalizes query strings so `app.js?v=...` matches
 * the clean `app.js` cache entry.
 */

const CACHE_NAME = 'meowmeow-bokbok-shell';

const PRECACHE_URLS = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./audio-engine.js",
  "./torch-controller.js",
  "./tuning-store.js",
  "./wake-lock-controller.js",
  "./found-recap.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

const PRECACHE_KEYS = new Set(PRECACHE_URLS.map((url) => normalizedCacheKey(url)));
const ENTRY_PATHS = new Set([
  new URL('./', self.location.href).pathname,
  new URL('./index.html', self.location.href).pathname
]);

function normalizedCacheKey(input) {
  const url = new URL(input, self.location.href);
  url.search = '';
  url.hash = '';
  return url.href;
}

async function refreshCache(target, cacheKey) {
  let response;
  try {
    response = await fetch(target, { cache: 'no-cache' });
  } catch (_) {
    return null;
  }

  if (response.ok && response.type === 'basic') {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey, response.clone());
    } catch (_) {
      // A cache write failure must not change what the page receives.
    }
  }

  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const fetched = await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          const response = await fetch(url, { cache: 'reload' });
          if (!response.ok) {
            throw new Error(`Precache failed for ${url}: ${response.status}`);
          }
          return { url, response };
        })
      );

      // Fetch everything successfully before touching the active cache, so a
      // failed install cannot leave a partially updated shell.
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(fetched.map(({ url, response }) => cache.put(url, response)));

      const expected = new Set(PRECACHE_URLS.map((url) => normalizedCacheKey(url)));
      const keys = await cache.keys();
      await Promise.all(
        keys.map((request) => (expected.has(request.url) ? undefined : cache.delete(request)))
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) =>
          name.startsWith('meowmeow-bokbok-') && name !== CACHE_NAME
            ? caches.delete(name)
            : undefined
        )
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.headers.has('range')) return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isEntryNavigation =
    request.mode === 'navigate' && ENTRY_PATHS.has(requestUrl.pathname);

  let cacheKey;
  let refreshTarget;

  if (isEntryNavigation) {
    cacheKey = normalizedCacheKey('./index.html');
    refreshTarget = new URL('./index.html', self.location.href).href;
  } else if (PRECACHE_KEYS.has(normalizedCacheKey(request.url))) {
    cacheKey = normalizedCacheKey(request.url);
    refreshTarget = request;
  } else {
    // Unknown paths and docs keep their normal network behavior.
    return;
  }

  const refreshPromise = refreshCache(refreshTarget, cacheKey);
  event.waitUntil(refreshPromise);

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(cacheKey);
        if (cached) return cached;
      } catch (_) {}

      const fresh = await refreshPromise;
      if (fresh) return fresh;
      return Response.error();
    })()
  );
});
