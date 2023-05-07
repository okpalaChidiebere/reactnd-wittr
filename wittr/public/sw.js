// just a simple listener to see all fetch request being made by our website
self.addEventListener("fetch", (event) => {
  //we are high jacking fetch request response and responding with a html
  //this is very powerful that why it is required to website to run service worker on HTTPS
  //Since service worker lasts way more that web pages, if a hacker get hold of our sw from an insecure connection they can change contents of our pages which we don't want :)

  event.respondWith(handle404(event.request));
});

const handle404 = async (request) => {
  try {
    const responseFromNetwork = await fetch(request);

    if (responseFromNetwork.status === 404) {
      return fetch("imgs/dr-evil.gif");
    }

    return responseFromNetwork;
  } catch (error) {
    return new Response("Uh oh, that totally failed!");
  }
};
