import "./scss/main.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistance, getTime } from "date-fns";
import { enCA } from "date-fns/locale";
import Posts from "./components/Posts";
import Toast, { toastRef } from "./components/Toast";
import { bulkInsertWittrs, getWittrs, MAX_MESSAGES } from "./AppDatabase";

const backendBaseUrl = "http://127.0.0.1";

function App() {
  const ws = useRef(null);
  const lastTimeUpdate = useRef(0);
  const lostConnectionToast = useRef(false); //keep track of if the  lostConnection Toast is currently displayed or not

  const [state, setState] = useState({
    posts: [],
    latestPostDate: null,
    isInitialized: false,
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

  const addPosts = useCallback(
    (posts) => {
      setState((currState) => {
        const updatedPosts = posts.concat(currState.posts); //add to new posts as most recent
        return {
          ...(posts.length && {
            latestPostDate: getTime(new Date(posts[0].time)),
          }),
          posts: updatedPosts.slice(0, MAX_MESSAGES), // remove really old posts to avoid too much content and leave the rest
        };
      });
      timesUpdate();
    },
    [timesUpdate]
  );

  const openSocket = useCallback(() => {
    const socketUrl = new URL("/updates", backendBaseUrl);
    socketUrl.protocol = "ws";
    socketUrl.port = 3001;

    // get the date of the latest post, or null if there are no posts
    if (state.latestPostDate) {
      socketUrl.search = "since=" + state.latestPostDate.valueOf();
    }

    const client = new WebSocket(socketUrl.href);
    ws.current = client;

    ws.current.onopen = () => {
      //Hide lostConnection Toast
      if (toastRef.current) {
        toastRef.current?.hide();
        lostConnectionToast.current = false;
      }
    };

    ws.current.onmessage = (e) => {
      requestAnimationFrame(async () => {
        const messages = JSON.parse(e.data);
        addPosts(messages);
        bulkInsertWittrs(messages);
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
  }, [state.latestPostDate, addPosts]);

  const softTimesUpdate = useCallback(() => {
    if (Date.now() - lastTimeUpdate.current < 1000 * 10) return;
    timesUpdate();
  }, [timesUpdate]);

  const cleanImageCache = useCallback(async () => {
    let imagesNeeded = [];
    const posts = await getWittrs();

    for (const post of posts) {
      //we look to see if an images contains the photo property. This property contains the photo url without the width bit at the end
      //remember before this point, we have the messages in the storage object to be maximum of 30 at a time
      if (post.photo) {
        imagesNeeded.push(post.photo); //we add the image as those that we want to keep
      }
      imagesNeeded.push(post.avatar); //we also include the avatar URLs in the image that we want to keep. We don't want them getting lost in the clean up!
    }

    const cachedImage = await caches.open("wittr-content-imgs"); //open our images cached
    const cachedImagesURLs = await cachedImage.keys();

    const deleteImageRequests = Array.from(cachedImagesURLs)
      .filter((request) => {
        //return path URL that isn't in our array of images needed
        return !imagesNeeded.includes(request.url);
      })
      .map((request) => {
        return cachedImage.delete(request); //we pass the request to cache.delete
      });

    // // make sure they all delete
    await Promise.all(deleteImageRequests);
  }, []);

  const { posts, isInitialized } = state;

  useEffect(() => {
    let id, cleanCacheId;
    (async () => {
      if (isInitialized === false) {
        await cleanImageCache();
        // first load data from the IDB before opening the websocket
        const postsFromIndexedDB = await getWittrs();
        addPosts(postsFromIndexedDB);

        //React.StrictMode re-renders the app component twice so we have to check to avoid opening multiple connections during development
        if (!ws.current) {
          openSocket();
        }

        // update times on an interval
        id = setInterval(() => {
          requestAnimationFrame(() => {
            softTimesUpdate();
          });
        }, 1000 * 30);

        // The cache can still get out of control if the user keeps the page open for ages without refreshing
        // So we call the cleanImageCache every 5 mins
        cleanCacheId = setInterval(() => cleanImageCache(), 1000 * 60 * 5);

        setState((currState) => ({ ...currState, isInitialized: true }));
      }
    })();
    return () => {
      clearInterval(id);
      clearInterval(cleanCacheId);
      lastTimeUpdate.current = 0;
    };
  }, [softTimesUpdate, addPosts, openSocket, cleanImageCache, isInitialized]);

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
