importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
);

const { cacheableResponse, expiration, strategies, routing, core, precaching } =
  workbox;
const STATIC_CACHE_NAME = "wittr-static-v2"; // we use this cache to store static files of our app
const WITTR_CONTENT_IMAGES = "wittr-content-imgs"; // we store images of wittr in  different cache because we want the images to live in between versions of our wittr app. Remember that static files versions can change

precaching.cleanupOutdatedCaches();

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

// we listen for image request and store the response in the cache
routing.registerRoute(
  ({ url }) => {
    if (
      //eg: localhost:3001/photos/...
      ["localhost"].some((urls) => url.hostname.includes(urls)) &&
      url.pathname.startsWith("/photos/")
    ) {
      return true;
    }

    return false;
  }, // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new strategies.CacheFirst({
    cacheName: WITTR_CONTENT_IMAGES,
    plugins: [
      servePhotoPlugin, //renames the image key
      new expiration.ExpirationPlugin({ maxEntries: 50 }),
      new cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200, 301],
      }),
      new expiration.ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

routing.registerRoute(
  ({ url }) => {
    //cache response from cross-origins
    if (
      [
        "https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff",
        "https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff",
      ].some((fonts) => url.href.includes(fonts))
    ) {
      return true;
    }

    //cache response from same-origins
    if (url.origin === self.location.origin) {
      //during development, there will be a `hot-update` fetch response, so we can cache that here as well :)
      if (url.pathname === "/") {
        return true;
      }

      if (url.pathname.endsWith("manifest.json")) {
        return true;
      }

      if (
        //start cache react prod build files as specified here
        //https://create-react-app.dev/docs/production-build
        url.pathname.match(
          new RegExp("^/static/js/[0-9]+.[a-z0-9]+.chunk.js+$")
        ) ||
        url.pathname.match(new RegExp("^/static/js/main.[a-z0-9]+.js+$")) ||
        url.pathname.match(new RegExp("^/static/css/main.[a-z0-9]+.css+$")) ||
        //end cache react build app files
        //cache js bundle response for react dev bundle
        url.pathname.match(new RegExp("^/static/js/bundle.js+$"))
      ) {
        return true;
      }

      if (url.pathname === "/imgs/icon.png") {
        return true;
      }
    }

    // Return false to signal that we want to use the handler to cache non permitted "fetch" response
    return false;
  },
  new strategies.CacheFirst({
    cacheName: STATIC_CACHE_NAME,
    plugins: [
      new cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200, 206], // 206 Partial Code.
      }),
      new expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 20 * 60 * 60, //maximum you are allowed to cache by sw is 24hrs
      }),
    ],
  })
);

const deleteOldCaches = async () => {
  const cacheKeepList = [STATIC_CACHE_NAME, WITTR_CONTENT_IMAGES]; //in reality we might have other versions of cache that we want the user to keep. so we add them to this list
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
