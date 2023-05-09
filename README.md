# Wittr

This is a silly little demo app for learning how to build an offline-first web app.
This is just a clone of this [app](https://github.com/jakearchibald/wittr)

We learned about:

- Using Service Workers to intercept network traffic. We will understand this using the ServiceWorker dev tools.
- Using the IndexedDB API (the browser database), along with Service Workers, to write caching solutions that will make your applications more performant.

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
- Once your service worker is registered, you app becomes offline first!. You can confirm this by navigating to the Network Tab and open the Throttling dropdown which is set to No Throttling by default. Then select **offline** you will see that the page loads! 😁 I don't not matter what network you choose slow fast or custom that page loads.
- See this [doc](https://www.browserstack.com/guide/how-to-perform-network-throttling-in-chrome) to learn how to add custom network speeds in chrome dev tools

## Caching Response

- With the help of [**workbox-sw**](https://developer.chrome.com/docs/workbox/modules/workbox-sw/) we can do this very easily
- FYI: The reason is did not go ahead and use the global js cache function like [here](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#install_and_activate_populating_your_cache) to manually cache response is because you must be specific with the urls otherwise the cache will not work. But with workbox i can use regex and write some logic to cache certain type of fetch responses
- It is important to note that you cannot cache websocket responses. Only fetch requests is what you can cache. Our witter app pretty much get posts updates from ws so if we want to show those pose offline we will have to cache those posts in indexDB
- Other caching strategies are listed and explained [here](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/#caching-strategies) and [here](https://developer.chrome.com/docs/workbox/reference/workbox-strategies/). We used **CacheFirst** strategy for this app
- You can use [additional modules](https://developer.chrome.com/docs/workbox/modules/) from the Workbox project, add in a push notification library, or remove some of the default caching logic.
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

## Date-fns useful links

- [Format distance in custom format instead of words](https://github.com/date-fns/date-fns/issues/1706) and [here](https://github.com/date-fns/date-fns/blob/e4ffe1537a0dfddddfd24697b976915cd366b10b/src/locale/en-US/_lib/formatDistance/index.js)

## Maintain Scrolling positions in Angular

- [Maintaining Scroll Offsets When Adding Content Above The User's Viewport In Angular](https://www.bennadel.com/blog/3724-maintaining-scroll-offsets-when-adding-content-above-the-users-viewport-in-angular-9-0-0-rc-2.htm)
