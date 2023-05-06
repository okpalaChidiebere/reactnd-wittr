const Post = (props) => {
  const { body, photo, name, avatar, time, timeTextContext } = props;
  return (
    <article className="card post">
      {photo && (
        <div className="post-main-img-container">
          <img
            className="post-main-img"
            alt=""
            src={`${photo}-800px.jpg`}
            srcSet={`${photo}-1024px.jpg 1024w,
                ${photo}-800px.jpg 800w,
                ${photo}-640px.jpg 640w,
                ${photo}-320px.jpg 320w
              `}
            sizes="(min-width: 800px) 765px,
               (min-width: 600px) calc(100vw - 32px),
               calc(100vw - 16px)"
          />
        </div>
      )}
      <div className="post-content">
        <img
          className="post-avatar"
          alt=""
          width="40"
          height="40"
          src={`${avatar}-1x.jpg`}
          srcSet={`${avatar}-2x.jpg 2x,
              ${avatar}-3x.jpg 3x`}
        />
        <div className="post-text-content">
          <div className="post-title">
            <h1 className="post-heading">{name}</h1>
            <time className="post-time" dateTime={time}>
              {timeTextContext}
            </time>
          </div>
          <p>{body}</p>
        </div>
      </div>
    </article>
  );
};

export default Post;
