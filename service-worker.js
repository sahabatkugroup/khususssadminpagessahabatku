/* Service worker Sahabatku (PWA). Semua file di satu level, tanpa folder. */
const VERSI = 'sahabatku-v1';
const INTI = [
  './', 'index.html', 'manifest.json', 'install.js', 'icon-192.png', 'icon-512.png',
  'styles.css', 'tailwind-built.css', 'ui-modern.css', 'sd.css', 'dm-sans-latin-400-normal.woff2',
  'dm-sans-latin-500-normal.woff2', 'dm-sans-latin-700-normal.woff2', 'lucide-lite.js', 'native.js',
  'rolegate.js', 'fb8-app.js', 'fb8-database.js', 'fb8-storage.js', 'fb.js', 'script.js', 'sd.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(INTI.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Data Firebase / API / peta tidak di-cache: selalu langsung ke jaringan
  if (url.origin !== location.origin && !/unpkg\.com|cdn\.jsdelivr\.net/.test(url.hostname)) return;

  // Halaman: jaringan dulu, cadangan dari cache (agar update langsung terlihat)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(VERSI).then(c => c.put('index.html', k)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // File lain: cache dulu, perbarui di latar belakang
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const k = r.clone(); caches.open(VERSI).then(c => c.put(req, k)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
