import { toast } from "react-toastify";

// Stable toast ids. Reusing an id makes react-toastify update the existing
// toast instead of stacking a new one, so repeated failed submits never pile
// up multiple identical toasts.
const SUCCESS_ID = "app-success";
const ERROR_ID = "app-error";
const WARNING_ID = "app-warning";
const INFO_ID = "app-info";

const KNOWN_TOAST_IDS = [SUCCESS_ID, ERROR_ID, WARNING_ID, INFO_ID];

export const showSuccess = (message) => {
  toast.success(message, { toastId: SUCCESS_ID });
};

export const showError = (message) => {
  toast.error(message, { toastId: ERROR_ID });
};

export const showWarning = (message) => {
  toast.warning(message, { toastId: WARNING_ID });
};

export const showInfo = (message) => {
  toast.info(message, { toastId: INFO_ID });
};

/**
 * Registers a global "Enter to dismiss" behavior for toasts.
 *
 * When the user presses Enter while any toast is visible, all visible toasts
 * are dismissed and the keypress is swallowed so it cannot also trigger a form
 * submit or button click underneath. When no toast is visible, Enter behaves
 * normally.
 *
 * Returns a cleanup function that removes the listener.
 */
export const initToastKeyDismiss = () => {
  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;

    // toast.isActive(id) is synchronous and reflects the current DOM state,
    // which avoids the timing races of tracking counts via toast.onChange.
    // All toasts we create use one of the known ids above.
    const anyActive = KNOWN_TOAST_IDS.some((id) => toast.isActive(id));
    if (!anyActive) return;

    // Swallow this Enter so it does not also re-submit the focused form or
    // re-click the focused button, which would spawn another toast in a loop.
    event.preventDefault();
    event.stopPropagation();
    toast.dismiss();
  };

  // Capture phase so we intercept Enter before it reaches form/button handlers.
  window.addEventListener("keydown", handleKeyDown, true);

  return () => {
    window.removeEventListener("keydown", handleKeyDown, true);
  };
};
