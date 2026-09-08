import { toast } from "react-toastify";

export const showSuccess = (message) => {
  toast.success(message);
};

export const showError = (message) => {
  toast.error(message);
};

export const showWarning = (message) => {
  toast.warning(message);
};

export const showInfo = (message) => {
  toast.info(message);
};

/**
 * Registers a global "Enter to dismiss" behavior for toasts.
 *
 * Tracks how many toasts are currently visible via toast.onChange, and when
 * the user presses Enter while at least one toast is showing, all visible
 * toasts are dismissed. When no toast is visible, Enter behaves normally.
 *
 * Returns a cleanup function that removes both listeners.
 */
export const initToastKeyDismiss = () => {
  let activeCount = 0;

  const unsubscribe = toast.onChange((payload) => {
    switch (payload.status) {
      case "added":
        activeCount += 1;
        break;
      case "removed":
        activeCount = Math.max(0, activeCount - 1);
        break;
      default:
        break;
    }
  });

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (activeCount > 0) {
      toast.dismiss();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    unsubscribe();
  };
};
