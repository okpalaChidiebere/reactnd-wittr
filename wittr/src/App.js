import "./scss/main.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistance, getTime } from "date-fns";
import { enCA } from "date-fns/locale";
import Posts from "./components/Posts";
import Toast, { toastRef } from "./components/Toast";

const backendBaseUrl = "http://127.0.0.1";
const maxMessages = 30;

function App() {
  const ws = useRef(null);
  const socketUrl = useRef(new URL("/updates", backendBaseUrl));
  const lastTimeUpdate = useRef(0);
  socketUrl.current.protocol = "ws";
  socketUrl.current.port = 3001;
  const lostConnectionToast = useRef(false); //keep track of if the  lostConnection Toast is currently displayed or not

  const [state, setState] = useState({
    posts: [],
    latestPostDate: null,
  });

  const timesUpdate = useCallback(() => {
    setState((currState) => {
      return {
        ...currState,
        posts: currState.posts.map((post) => {
          var postDate = new Date(post.time);
          return {
            ...post,
            timeTextContext: humanReadableTimeDiff(postDate),
          };
        }),
      };
    });

    lastTimeUpdate.current = Date.now();
  }, []);

  const openSocket = useCallback(() => {
    // get the date of the latest post, or null if there are no posts
    if (state.latestPostDate) {
      socketUrl.current.search = "since=" + state.latestPostDate.valueOf();
    }

    const client = new WebSocket(socketUrl.current.href);
    ws.current = client;

    ws.current.onopen = () => {
      //Hide lostConnection Toast
      if (toastRef.current) {
        toastRef.current?.hide();
        lostConnectionToast.current = false;
      }
    };

    ws.current.onmessage = (e) => {
      requestAnimationFrame(() => {
        const messages = JSON.parse(e.data);
        setState((currState) => {
          // remove really old posts to avoid too much content
          const posts = currState.posts.slice(0, maxMessages);

          return {
            latestPostDate: getTime(new Date(messages[0].time)),
            posts: [...new Set([...messages, ...posts])],
          };
        });
        timesUpdate();
      });
    };

    ws.current.onclose = (e) => {
      //tell the user
      if (!lostConnectionToast.current) {
        toastRef.current?.show("Unable to connect. Retrying…");
        lostConnectionToast.current = true;
      }

      // try and reconnect in 5 seconds
      setTimeout(() => {
        openSocket();
      }, 5000);
    };
  }, [state.latestPostDate, timesUpdate]);

  const softTimesUpdate = useCallback(() => {
    if (Date.now() - lastTimeUpdate.current < 1000 * 10) return;
    timesUpdate();
  }, [timesUpdate]);

  useEffect(() => {
    (async () => {
      if (!ws.current) {
        openSocket();
      }

      // update times on an interval
      setInterval(function () {
        requestAnimationFrame(() => {
          softTimesUpdate();
        });
      }, 1000 * 30);
    })();
  }, [openSocket, softTimesUpdate]);

  const { posts } = state;

  return (
    <div className="layout">
      <header className="toolbar">
        <h1 className="site-title">Wittr</h1>
      </header>
      <main className="main">
        <Posts posts={posts} />
      </main>
      <Toast ref={toastRef} />
    </div>
  );
}

export default App;

function humanReadableTimeDiff(dateTime) {
  const formatDistanceLocale = {
    // lessThanXSeconds: "now",
    lessThanXSeconds: {
      one: "now",
      other: "{{count}}s",
    },
    xSeconds: "{{count}}s",
    halfAMinute: "30s",
    lessThanXMinutes: "{{count}}m",
    xMinutes: "{{count}}m",
    aboutXHours: "{{count}}h",
    xHours: "{{count}}h",
    xDays: "{{count}}d",
    aboutXWeeks: "{{count}}w",
    xWeeks: "{{count}}w",
    aboutXMonths: "{{count}}m",
    xMonths: "{{count}}m",
    aboutXYears: "{{count}}y",
    xYears: "{{count}}y",
    overXYears: "{{count}}y",
    almostXYears: "{{count}}y",
  };
  const locale = {
    ...enCA, //Canadian English
    formatDistance: (token, count) => {
      let result;
      if (typeof formatDistanceLocale[token] === "string") {
        result = formatDistanceLocale[token].replace("{{count}}", count);
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace("{{count}}", count);
      }

      return result;
    },
  };

  return formatDistance(new Date(dateTime), new Date(), {
    locale,
    includeSeconds: true,
    // addSuffix: true,
  });
}

// function humanReadableTimeDiff(date) {
//   var dateDiff = Date.now() - date;
//   if (dateDiff <= 0 || Math.floor(dateDiff / 1000) === 0) {
//     return "now";
//   }
//   if (dateDiff < 1000 * 60) {
//     return Math.floor(dateDiff / 1000) + "s";
//   }
//   if (dateDiff < 1000 * 60 * 60) {
//     return Math.floor(dateDiff / (1000 * 60)) + "m";
//   }
//   if (dateDiff < 1000 * 60 * 60 * 24) {
//     return Math.floor(dateDiff / (1000 * 60 * 60)) + "h";
//   }
//   return Math.floor(dateDiff / (1000 * 60 * 60 * 24)) + "d";
// }
