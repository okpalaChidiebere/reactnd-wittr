# Wittr

This is a silly little demo app for learning how to build an offline-first web app.
This is just a clone of this [app](https://github.com/jakearchibald/wittr). The author also wrote an article [here](https://jakearchibald.com/2014/offline-cookbook/) thats wort a good read

We learned about:

- Using [Service Workers](https://developer.chrome.com/docs/workbox/service-worker-overview/#you_need_https) to intercept network traffic. We will understand this using the ServiceWorker dev tools.
- Using the IndexedDB API (the browser database), along with Service Workers, to write caching solutions that will make your applications more performant.

The outcome was I was able to use SW both during development and production. The default [CRA](https://github.com/facebook/create-react-app#creating-an-app) with service worker only works for production :( but with my way it works for both :)

## Difference between an Offline-first and Online first app

**offline first**

- Getting as many things as possible on the screen first using stuff already on the user's device in caches and such. We might still go to the network but we are not going to wait for it. We get stuff from the cache as much as we can then we can finally update the page if we finally get stuff from the network.
- If we get stuff from the network, we can update what the user is looking at and also save that data into the cache for next time.
- If we can get stuff from the network we stick with what we have got. I could be out of stale data or not. This is way better than showing nothing 😁
- This approach works well for good connectivity, offline apps and as well as poor connectivity(lie-fie).
- Showing an error page from a cache is not offline first

**Online first**

- Is basically trying the network first and if that fails, then we can serve some cached data or so. This works great for good connectivity and offline apps

## Service Worker Dev Tools

- In Chrome dev tools, you can find the `Service Workers` under the **Application tab** > **Application section in the side panel on the left** It has the gearbox icon on it
- With the nature of service workers, you can check the **update on reload** checkbox if you want the service worker to be more developer friendly instead of user friendly if you want to see all recent css, or js changes on your site right away. If not it will be added to the waiting sw queue and not load the new updates until
  - navigate to a page or website not controlled by that service worker and navigate back to the pervious page controlled by the service worker
  - or you close that tab and open a new tab
- Once your service worker is registered, you app becomes offline first!. You can confirm this by navigating to the Network Tab and open the Throttling dropdown which is set to No Throttling by default. Then select **offline** you will see that the page loads! 😁 It doesn't not matter what network you choose slow fast or custom that page loads.
- See this [doc](https://www.browserstack.com/guide/how-to-perform-network-throttling-in-chrome) to learn how to add custom network speeds in chrome dev tools

## Simulating Network types

- To simulate offline, you can either that at the network tab in the dev tools where you select `offline` or you can close your front-end dev server and/or back-end dev sever
- To simulate lie-fie, you can select `slow 3G` in the network tab
- To simulate online, is basically starting all servers and selecting `no throttling` in the network tab
- You can add your custom network. See this [article](https://www.browserstack.com/guide/how-to-perform-network-throttling-in-chrome)

## Caching Response

- With the help of [**workbox-sw**](https://developer.chrome.com/docs/workbox/modules/workbox-sw/) we can do this very easily
- FYI: The reason is did not go ahead and use the global js cache function like [here](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#install_and_activate_populating_your_cache) to manually cache response is because you must be specific with the urls otherwise the cache will not work. But with workbox i can use regex and write some logic to cache certain type of fetch responses
- Other caching strategies are listed and explained [here](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/#caching-strategies) and [here](https://developer.chrome.com/docs/workbox/reference/workbox-strategies/). We used **CacheFirst** strategy for this app
- You can use [additional modules](https://developer.chrome.com/docs/workbox/modules/) from the Workbox project, add in a push notification library, or remove some of the default caching logic.

## Workbox

Workbox is basically a web api on browsers that covers lower level logic like in this [article](https://jakearchibald.com/2014/offline-cookbook) you need to write for service workers

- [Custom plugins in Workbox](https://developer.chrome.com/docs/workbox/using-plugins/#methods-for-custom-plugins)
- [How to Register a Navigation Route for single page application](https://developer.chrome.com/docs/workbox/modules/workbox-routing/#how-to-register-a-navigation-route)
- [Custom Strategies in Workbox](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/#creating-a-new-strategy)
- You can use [additional modules](https://developer.chrome.com/docs/workbox/modules/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/#advanced_usage)
- [Caching with service worker and Workbox](https://sevic.dev/caching-service-worker-workbox/)
- [https://gist.github.com/jeffposnick/fc761c06856fa10dbf93e62ce7c4bd57](https://gist.github.com/jeffposnick/fc761c06856fa10dbf93e62ce7c4bd57)

## Caching the Page Skeleton

- Since react is a single page application, we can easy cache the page skeleton. React loads all the page at one when we make a request to load the js scripts, css and index.html `/` or `/index.html`
- It is important to note that you cannot cache websocket responses. Only fetch requests is what you can cache. Our witter app pretty much get posts updates from ws so if we want to show those pose offline we will have to cache those posts in indexedDB. This way when the user is offline, we load the app skeleton and the get the posts from the indexedDB

- [Stackoverflow - Workbox update cache on new version](https://stackoverflow.com/questions/60912127/workbox-update-cache-on-new-version)
- [Detect when a user is offline in js](https://stackoverflow.com/questions/68408612/offline-pages-with-service-worker-react)

## Getting Started React

- [Initialize react app](https://create-react-app.dev/docs/getting-started)
- [Adding scss](https://create-react-app.dev/docs/adding-a-sass-stylesheet/)

## Ignoring ES-lints

There are two mains one

- Ignoring a line

```js
console.log("this line will be ignores"); //eslint-disable-line
```

- ignoring next line

```js
// eslint-disable-next-line -- comment to self if needed
console.log("this line will be ignores");
```

A great [article](https://maxrozen.com/react-hooks-eslint-plugin-saved-hours-debugging-useeffect) on this

## More on React Animations

- [html animate method](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
- [Mastering CSS Transitions With React 18](https://blog.openreplay.com/mastering-css-transitions-with-react-18/)
- [5 Ways to animate a React app.](https://medium.com/hackernoon/5-ways-to-animate-a-reactjs-app-in-2019-56eb9af6e3bf)
- [CSS Keyframes](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)
- [w3schools animations](https://www.w3schools.com/css/css3_animations.asp)
- [w3schools transitions](https://www.w3schools.com/css/css3_2dtransforms.asp)
- [Using requestAnimationFrame](https://medium.com/dhiwise/reactjs-requestanimationframe-da2155706c36)
- [How to build faster animation transitions in React](https://blog.logrocket.com/how-build-faster-animation-transitions-react/)
- [Setup PWA Workbox Webpack Plugin for React Application | Workbox Window | Precaching | Caching at runtime.](https://imranhsayed.medium.com/setup-pwa-workbox-webpack-plugin-for-react-application-workbox-window-precaching-caching-at-40f9289650e5)
- [https://github.com/GoogleChrome/workbox/issues/2217](https://github.com/GoogleChrome/workbox/issues/2217)

## Date-fns useful links

- [Format distance in custom format instead of words](https://github.com/date-fns/date-fns/issues/1706) and [here](https://github.com/date-fns/date-fns/blob/e4ffe1537a0dfddddfd24697b976915cd366b10b/src/locale/en-US/_lib/formatDistance/index.js)

## Maintain Scrolling positions in Angular

- [Maintaining Scroll Offsets When Adding Content Above The User's Viewport In Angular](https://www.bennadel.com/blog/3724-maintaining-scroll-offsets-when-adding-content-above-the-users-viewport-in-angular-9-0-0-rc-2.htm)

## Caching Images

- We choose to use the Cache API instead of IDB because the Cache will stream the data which is more memory efficient and leads to faster renders for the image data.
- If we wanted to store the image in IDB we will loose the streaming effect of image bytes. we will have to read the pixel data of the image and convert the pixels to blob and all that is more complicated and to show the image will have to convert the how thing we stored in the IDB into `ImageData` and the display to the user. All these might cause the image to not be performant because the UI will have to wait for the whole image to be complete instead of streaming like the Cache API does

## Install and Cache with service workers in React

- This is also know as precaching. When user loads your app for the first time in the browser, there will be some files you want to be cached right away so that on the second hot-reload of the browser of when the user gets offline without hot-reload these files will have already been cached. These are usually files responsible for the basic skeleton of your app. maybe images, css, js, index.html, etc
- New Service workers does not get controlled over pages until the install phase is completed. So we use this opportunity to get everything we want from the network and create a cache for them.
- If you look `install` eventListener (listens for the install phase of the service worker) at the `sw.js` file, you will see that i made a fetch request to get the manifest file from the server eg: [http://localhost:3000/asset-manifest.json](http://localhost:3000/asset-manifest.json). The file `asset-manifest.json` describes the resources to cache and includes **hashes** of every file's contents. When an update to the application is deployed (like starting or re-starting the dev server or building the app for prod), the contents (hash) of the manifest change, informing the service worker that a new version of the application should be downloaded and cached. You will need to create a new cache used to store the new changes and delete the old cache if necessary. Angular has similar thing as well

```json
//exists in the build folder for built apps or http://localhost:3000/asset-manifest.json for running development server app
{
  "files": {
    "main.js": "/static/js/bundle.js",
    "static/js/node_modules_web-vitals_dist_web-vitals_js.chunk.js": "/static/js/node_modules_web-vitals_dist_web-vitals_js.chunk.js",
    "index.html": "/index.html",
    "bundle.js.map": "/static/js/bundle.js.map",
    "main.hot-update.js.map": "/main.42d8d98ea4aaa7ff225d.hot-update.js.map",
    "node_modules_web-vitals_dist_web-vitals_js.chunk.js.map": "/static/js/node_modules_web-vitals_dist_web-vitals_js.chunk.js.map"
  },
  "entrypoints": [
    "static/js/bundle.js",
    "main.42d8d98ea4aaa7ff225d.hot-update.js"
  ]
}
```

The hash values changes with each webpack re-build and with preaching in SW, you need to add the [exact file(s) urls](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#install_and_activate_populating_your_cache). There is no way for us to predetermine the has value LOL. Thats why we fetch that file and read those values. So this means that:

- **for development** we can basically pre-cache those files during the install phase and also listen for fetch request like `hot-updates` GET requests and update the cache accordingly; this way your changes to the js file will be seen in the UI right away. Also
- **for production** that we can easily precache the newly build files if the hash changes. The only one thing you MUST do is to update the cache name (like updating the version number or hash value in the cache name) use used to store the precache urls so the there will be a new cache with the new precache static files and then the user can get those changes.
- This stackOverflow [thread](https://stackoverflow.com/questions/46830493/is-there-any-way-to-cache-all-files-of-defined-folder-path-in-service-worker) kinda show a bit of what i did

## Updating the sw.js file

Regardless, any slight change you make to the `sw.js` file will trigger a new service worker to queued in in the browser because the browser checks to see if there is a byte change between the old file and the new file. This does not update the cache, indexedDB, cookies, etc for you after you add the new service worker ( with `self.skipWaiting()` or directly from the dev tools ); you will have to handle those cases for yourself in `sw.js` file.

## More to explore for a more optimized PWA

- All Service worker API like backgroundFetch, Push Notifications, etc [here](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration)
- [Richer offline experiences with the Periodic Background Sync API](https://developer.chrome.com/articles/periodic-background-sync/)
- [Web Periodic Background Synchronization API](https://felixgerschau.com/periodic-background-sync-explained/)
- [Background Fetch JS](https://developer.chrome.com/blog/background-fetch/)
- [workbox-background-sync](https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/)
- [Web Push notifications](https://jakearchibald.com/2014/offline-cookbook)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notification) and [https://phppot.com/javascript/web-push-notification/](https://phppot.com/javascript/web-push-notification/)
- [Do you need to show prompt for re-fresh](https://developer.chrome.com/docs/workbox/handling-service-worker-updates/#do-you-need-to-show-a-prompt)
- [idb](https://www.npmjs.com/package/idb)
- [emoji images](https://joypixels.com/emoji)
- [React navigation 6](https://reactrouter.com/en/main/routers/create-browser-router)
- [Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Responsive pages](https://webdesign.tutsplus.com/how-to-build-a-full-screen-responsive-page-with-flexbox--cms-32086t)

## More on web browser database

- The web browser has a database called indexedDB. There are lots of API out there that builds on top of this indexedDB for easy use. Check this [article](https://levelup.gitconnected.com/using-the-indexeddb-api-with-react-and-hooks-4e63d83a5d1b)
