importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
);

const {
  cacheableResponse: { CacheableResponsePlugin },
  expiration: { ExpirationPlugin },
  strategies: { CacheFirst, StaleWhileRevalidate },
} = workbox;

let staticCacheName = "wittr-static-v2"; // we use this cache to store static files of our app

const WITTR_CONTENT_IMAGES = "wittr-content-imgs"; // we store images of wittr in  different cache because we want the images to live in between versions of our wittr app. Remember that static files versions can change

const FILES_TO_CACHE = [
  "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
  "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff",
  "/",
  "/manifest.json",
  "/imgs/icon.png",
];

const addResourcesToCache = async (resources) => {
  const res = await fetch(new Request("/asset-manifest.json"));
  const { files } = await res.json();
  const manifest = Object.values(files).concat(resources);
  const cache = await caches.open(staticCacheName);
  await cache.addAll(manifest);
};

//precaching static files
self.addEventListener("install", (event) => {
  //we pass a promise to the  event.waitUntil
  //if and when the promise resolves, the browser know the install completed
  // if the promise fails, the browser knows the install failed and this service worker should be discarded
  event.waitUntil(addResourcesToCache(FILES_TO_CACHE));
});

const servePhotoPlugin = {
  cacheKeyWillBeUsed: ({ request, mode }) => {
    // Photo urls look like:
    // /photos/9-8028-7527734776-e1d2bda28e-800px.jpg
    //Notice te photos have width information at the end
    // But storageUrl has the -800px.jpg bit missing.
    // Use this url to store & match the image in the cache.
    // This means you only store one copy of each photo.
    const storageUrl = request.url.replace(/-\d+px\.jpg$/, ""); //we replaced the size at the end of the urls with nothing as our sw cache the image key

    /**
     * We store one version of the image(storageUrl will be used as the cache key) and return that cached image regardless of the different image size the user requests to have
     * This is more performant for offline purposes
     */
    return storageUrl;
  },
};

const serverAvatarPlugin = {
  cacheKeyWillBeUsed: ({ request }) => {
    // Avatar urls look like:
    // avatars/sam-2x.jpg
    // But storageUrl has the -2x.jpg bit missing.
    // Use this url to store & match the image in the cache.
    // This means you only store one copy of each avatar.
    const storageUrl = request.url.replace(/-\dx\.jpg$/, "");

    return storageUrl;
  },
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  //we want cache first for the page skeleton (index)
  if (requestUrl.host === self.location.origin && url.pathname === "/") {
    event.respondWith(
      new CacheFirst({
        cacheName: staticCacheName,
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200, 206],
          }),
        ],
      }).handle({ event, request })
    );
  }

  //caching backend APIs
  if (["http://localhost:3001"].includes(requestUrl.origin)) {
    // we listen for image request and store the response in the cache

    // serve photo
    if (requestUrl.pathname.startsWith("/photos/")) {
      event.respondWith(
        new CacheFirst({
          cacheName: WITTR_CONTENT_IMAGES,
          plugins: [
            servePhotoPlugin, //renames the image key
            new ExpirationPlugin({ maxEntries: 30, purgeOnQuotaError: true }),
            new CacheableResponsePlugin({
              statuses: [0, 200, 301],
            }),
          ],
        }).handle({ event, request })
      );
      return;
    }

    // serve avatars
    if (requestUrl.pathname.startsWith("/avatars/")) {
      event.respondWith(
        //return images from the "wittr-content-imgs" cache
        // if they're in there. But afterwards, go to the network
        // to update the entry in the cache.
        new StaleWhileRevalidate({
          cacheName: WITTR_CONTENT_IMAGES,
          plugins: [
            serverAvatarPlugin,
            new ExpirationPlugin({
              maxEntries: 30,
              maxAgeSeconds: 1 * 24 * 60 * 60, // Cache for a maximum of 1 day
              purgeOnQuotaError: true,
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }).handle({ event, request })
      );
      return;
    }
  }

  event.respondWith(
    // if the request matches request in our cache we return the cache otherwise we fetch it from the network
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

const deleteOldCaches = async () => {
  const cacheKeepList = [staticCacheName, WITTR_CONTENT_IMAGES]; //in reality we might have other versions of cache that we want the user to keep. so we add them to this list
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(
    (cacheName) =>
      //we check to see the cacheName starts with 'wittr' because we don't want to delete other caches of apps sharing thesame origin. Not for this case of wittr app though
      //if the cacheName is not in the list of caches we care about, we delete it
      cacheName.startsWith("wittr-") && !cacheKeepList.includes(cacheName)
  );
  await Promise.all(
    cachesToDelete.map(async (cacheName) => {
      return await caches.delete(cacheName);
    })
  );
};

self.addEventListener("activate", function (event) {
  event.waitUntil(deleteOldCaches());
});

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "SKIP_WAITING") {
    self.skipWaiting(); // allow the new service worker to take over the page
  }
});
