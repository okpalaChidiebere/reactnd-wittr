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
