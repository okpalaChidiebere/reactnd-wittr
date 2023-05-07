export default async function register() {
  try {
    if (!navigator.serviceWorker) return; //if service worker is not supported, we just return. to avoid seeing error in console

    await navigator.serviceWorker.register("/sw.js", {
      // the file "sw.js" MUST load from the link `${process.env.PUBLIC_URL}/sw.js` in browser
      //'scope' is where you define what pages you want sw to keep track control.
      //we want the whole website we we use root which is default. You can specify just certain pages and not the whole website if you want
      //see doc https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#registering_your_worker
      scope: "/",
    }); //returns a promise. NOTE Service workers requires the site using them to be served over HTTPS for security reasons, but have exceptions for localhost.

    console.log("Registration worked!");
  } catch (e) {
    console.error(`Registration failed with ${e}`);
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
