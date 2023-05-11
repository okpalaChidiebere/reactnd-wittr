const Websocket = require("ws");
const http = require("http");
const express = require("express");
const { random } = require("./utils");
let url = require("url");
const { generateReady, generateMessage } = require("./generateMessage");

const port = 3001;

const maxMessages = 30;

const imgSizeToFlickrSuffix = {
  "1024px": "b",
  "800px": "c",
  "640px": "z",
  "320px": "n",
};

const staticOptions = {
  maxAge: 0,
};

const app = express();

const appServer = http.createServer(app);

const webSocketServer = new Websocket.WebSocketServer({
  server: appServer,
  path: "/updates",
});

let messages = [];

(async () => {
  await generateReady.then((_) => {
    // generate initial messages
    let time = new Date();

    for (let i = 0; i < maxMessages; i++) {
      const msg = generateMessage();
      const timeDiff = random(5000, 15000);
      time = new Date(time - timeDiff);
      msg.time = time.toISOString();
      messages.push(msg);
    }

    generateDelayedMessages();
  });

  webSocketServer.on("connection", onWsConnection);

  app.use("/avatars", express.static("./public/avatars", staticOptions));

  app.get("/photos/:farm-:server-:id-:secret-:type.jpg", (req, res) => {
    const flickrUrl = `http://farm${req.params.farm}.staticflickr.com/${
      req.params.server
    }/${req.params.id}_${req.params.secret}_${
      imgSizeToFlickrSuffix[req.params.type]
    }.jpg`;

    const flickrRequest = http.request(flickrUrl, (flickrRes) => {
      Object.keys(flickrRes.headers).forEach((header) => {
        res.setHeader(header, flickrRes.headers[header]);
      });
      // flickrRes.pipe(res);
      res.sendStatus(301);
    });

    flickrRequest.on("error", (err) => {
      // TODO: use a real flickr image as a fallback
      res.sendFile("imgs/icon.png", {
        root: __dirname + "/public/",
      });
    });

    flickrRequest.end();
  });

  app.get("/ping", (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.status(200).send({ ok: true });
  });

  appServer.listen(port, () => {
    console.log(`Server listening at localhost:${port}`);
  });
})();

const onWsConnection = (socket, req) => {
  const requestUrl = url.parse(req.url, true);

  if ("no-socket" in requestUrl.query) return;

  socket.on("close", () => console.log("CLOSED!!!"));

  let sendNow = [];

  if (requestUrl.query.since) {
    const sinceDate = new Date(Number(requestUrl.query.since));

    let missedMessages = messages.findIndex(
      (msg) => new Date(msg.time) <= sinceDate
    );
    if (missedMessages == -1) missedMessages = messages.length;
    sendNow = messages.slice(0, missedMessages);
  } else {
    sendNow = messages.slice();
  }

  if (sendNow.length) {
    socket.send(JSON.stringify(sendNow));
  }
};

const generateDelayedMessages = () => {
  setTimeout((_) => {
    addMessage();
    generateDelayedMessages();
  }, random(5000, 15000));
};

const addMessage = () => {
  const message = generateMessage();
  messages.unshift(message);
  messages.pop();
  broadcast([message]);
};

//broadcasts new message to all clients
const broadcast = (message) => {
  const msg = JSON.stringify(message);

  webSocketServer.clients.forEach((client) => {
    if (client.readyState === Websocket.OPEN) {
      client.send(msg, (err) => {
        if (err) console.error(err);
      });
    }
  });
};
