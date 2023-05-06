import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const defaultButtons = ["dismiss"];
let hideTimer;

const Toast = forwardRef((props, forwardedRef) => {
  const toastRef = useRef(null);
  const [state, setState] = useState({
    buttons: ["dismiss"],
    message: null,
    unmountToast: false,
    duration: 0, //in seconds
    show: false,
  });

  const { buttons, unmountToast, duration, message, show } = state;

  const hide = useCallback(() => {
    clearTimeout(hideTimer);
    setState((currState) => ({ ...currState, show: false }));
  }, []);

  const handleOnClick = useRef(() => hide());

  useImperativeHandle(
    forwardedRef,
    () => ({
      // show a message to the user eg:
      // toasts.show("Do you wish to continue?", {
      //   buttons: ['yes', 'no']
      // })
      // Returns a toast.
      show(message, opts, buttonsResolver = (h) => hide()) {
        //override the default options if any is passed
        opts = Object.assign({ duration: 0, buttons: defaultButtons }, opts);

        //mount the component
        setState((currState) => ({
          ...currState,
          unmountToast: false,
        }));

        requestAnimationFrame(() => {
          setTimeout(
            () =>
              setState((currState) => ({
                ...currState,
                ...opts,
                message,
                show: true, //start animation
              })),
            50
          );
        });

        handleOnClick.current = buttonsResolver;
      },
      hide() {
        hide();
      },
    }),
    [hide]
  );

  useEffect(() => {
    if (duration && show) {
      hideTimer = setTimeout(function () {
        hide();
      }, duration * 1000);
    }

    if (toastRef.current) {
      //listen for when the transition animation ends
      toastRef.current.ontransitionend = () => {
        //unmount the toast
        if (!show) {
          setState((currState) => ({
            ...currState,
            unmountToast: true,
            duration: 0,
          }));
        }
      };
    }
  }, [show, duration, hide]);

  if (unmountToast) return null;

  return (
    <div className="toasts">
      <div
        ref={toastRef}
        className={`toast ${show ? "show-toast" : "hide-toast"}`}
      >
        <div className="toast-content">{message}</div>
        {buttons.map((button) => (
          <button
            key={button}
            className="unbutton"
            onClick={() =>
              handleOnClick.current && handleOnClick.current(button, hide)
            }
          >
            {button}
          </button>
        ))}
      </div>
    </div>
  );
});

export default Toast;
