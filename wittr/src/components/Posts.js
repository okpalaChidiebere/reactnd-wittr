import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Post from "./Post";

const Posts = (props) => {
  const scrollUpdatePending = useRef(false);

  // used to keep track of the latest post before re-rendering of the list.
  // Used Maintaining Scroll Offsets When Adding Content Above The User's Viewport
  var mOldLatestPost = useRef(null);

  const [state, setState] = useState({
    hasNewPosts: false,
  });
  const { posts = [] } = props;
  const scroller = useRef(null);

  // called as the scroll position changes
  const handleOnScroll = useCallback(() => {
    if (scrollUpdatePending.current) return;
    scrollUpdatePending.current = true;

    requestAnimationFrame(() => {
      if (scroller.current.scrollTop < 60) {
        setState({ hasNewPosts: false });
      }
      scrollUpdatePending.current = false;
    });
  }, []);

  //returns snapshot value before re-render of the component
  const oldLatestPostOldPosition = useMemo(() => {
    mOldLatestPost.current = scroller.current?.querySelector(".post");
    return (
      mOldLatestPost.current && mOldLatestPost.current.getBoundingClientRect()
    );
  }, [posts]); // eslint-disable-line --- ignore warn error in console because we need this memo to re-render to always get the latest post which will soon be an old post when re-render happens

  //runs after component mounts
  useLayoutEffect(() => {
    // move scrolling position to make it look like nothing happened
    if (mOldLatestPost.current) {
      let oldLatestPostNewPosition =
        mOldLatestPost.current.getBoundingClientRect();

      const areScrollOffsetsTheSame =
        Math.round(oldLatestPostNewPosition.top) ===
        Math.round(oldLatestPostOldPosition.top);

      // In modern browsers, the scroll-offset will be HANDLED AUTOMATICALLY.
      // Meaning, the browser will UPDATE THE SCROLL OFFSET in order to maintain
      // the "current" experience for the user (how great is that?!?!).
      // if the pre/post scroll offsets are the different, we
      // have to step-in and manually SCROLL THE USER DOWN to compensate for the change
      // in container height.
      if (!areScrollOffsetsTheSame) {
        // the browser did not help us at this point se we handle that ourself

        scroller.current.scrollTop =
          scroller.current.scrollTop +
          (Math.round(oldLatestPostNewPosition.top) -
            Math.round(oldLatestPostOldPosition.top));

        // show the new alert if the user is not at the top of the list but the scrollTop changed but we haven't alerted the user before
        setState((currState) => ({
          ...currState,
          ...(!currState.hasNewPosts &&
            scroller.current.scrollTop > 0 && { hasNewPosts: true }),
        }));
      }
    }
  }, [posts, oldLatestPostOldPosition?.top]);

  const { hasNewPosts } = state;

  return (
    <>
      <div className={`posts-alert ${hasNewPosts ? "active" : ""}`}></div>
      <div
        className="scroller posts"
        ref={(ref) => (scroller.current = ref)}
        onScroll={handleOnScroll}
      >
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </>
  );
};

export default memo(Posts, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.posts) === JSON.stringify(nextProps.posts);
});
