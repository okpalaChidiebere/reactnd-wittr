// just a simple listener to see all fetch request being made by our website
self.addEventListener("fetch", function (event) {
  console.log(event.request);
});
