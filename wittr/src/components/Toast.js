import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  createRef,
} from "react";

const defaultButtons = ["dismiss"];
let hideTimer;

export function createToastContainerRef() {
  return createRef({
    isReady: () => undefined,
    show: (message, opts, buttonsResolver = (h) => () => {}) => undefined,
    hide: () => undefined,
  });
}

export const toastRef = createToastContainerRef();

export function handleShow(message, opts, buttonsResolver) {
  if (toastRef.current.isReady()) {
    toastRef.current.show(message, opts, buttonsResolver);
  }
}

export function handleHide() {
  if (toastRef.current.isReady()) {
    toastRef.current.hide();
  }
}

const Toast = forwardRef((props, forwardedRef) => {
  const toastRef = useRef(null);
  const [state, setState] = useState({
    buttons: ["dismiss"],
    message: null,
    unmountToast: true,
    duration: 0, //in seconds
    show: false,
  });

  const { buttons, unmountToast, duration, message, show, isReady } = state;

  const hide = useCallback(() => {
    clearTimeout(hideTimer);
    setState((currState) => ({ ...currState, show: false }));
  }, []);

  const handleOnClick = useRef(() => hide());

  useImperativeHandle(
    forwardedRef,
    () => ({
      isReady() {
        return unmountToast === false;
      },
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
    [hide, unmountToast]
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
