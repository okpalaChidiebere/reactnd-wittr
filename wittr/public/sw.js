importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
);

const { cacheableResponse, expiration, strategies, routing } = workbox;

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
    cacheName: "wittr-static-v1",
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
