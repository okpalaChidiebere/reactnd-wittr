import { toastRef } from "./components/Toast";

const updateReady = (swr) => {
  toastRef.current?.show("New version available", {
    buttons: ["Whatever"],
  });
};

const trackInstalling = (swr) => {
  //listen to the state changes to track it
  swr.onstatechange = () => {
    if (swr.state == "installed") {
      // if it reaches the install state we tell the user
      updateReady(swr);
    }
  };
};

let serviceWorker;

export default async function register() {
  try {
    if (!navigator.serviceWorker) return; //if service worker is not supported, we just return. to avoid seeing error in console

    const registration = await navigator.serviceWorker.register("/sw.js", {
      // the file "sw.js" MUST load from the link `${process.env.PUBLIC_URL}/sw.js` in browser
      //'scope' is where you define what pages you want sw to keep track control.
      //we want the whole website we we use root which is default. You can specify just certain pages and not the whole website if you want
      //see doc https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#registering_your_worker
      scope: "/",
    }); //returns a promise. NOTE Service workers requires the site using them to be served over HTTPS for security reasons, but have exceptions for localhost.

    if (!navigator.serviceWorker.controller) {
      //navigator.serviceWorker.controller refers to the sw that controls this page
      //if there is no controller it means the page is loaded via the network so we don't have to look at the service worker registration status
      return;
    }

    if (registration.installing) {
      // there is an update in progress but that update may fail so we track it
      trackInstalling(registration.installing);
    } else if (registration.waiting) {
      serviceWorker = registration.waiting;
      // there is an update ready and waiting so we let the user know about it
      updateReady(registration.waiting);
    } else {
      //listen for the updatefound event
      registration.addEventListener("updatefound", () => {
        //track the state of the installing worker
        trackInstalling(registration.installing);
      });
    }
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
