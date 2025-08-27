const STATIC_CACHE = 'static-v1';
const STATIC_ASSETS = [
  '/',               // 루트(단일 페이지면 포함)
  '/index.html',
  '/main.css',
  '/main.js',        // 네가 쓰는 스크립트들로 교체
  '/register-sw.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png'
];

// 설치: 필수 에셋 프리캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 정리
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 가로채기
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // 정적 자원: 캐시 우선
  if (STATIC_ASSETS.some(path => req.url.includes(path))) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // 그 외: 네트워크 우선, 실패하면 캐시
  e.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
