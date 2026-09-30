/**
 * runtimeSync
 * -----------------------------------------------------------------------------
 * Client bootstrap validation helper.
 *
 * Uses the local system time as the source of truth, and enforces a monotonic
 * guard against local-clock rollback, then validates the current moment against
 * the configured runtime validity boundary.
 *
 * Outward behaviour on failure is deliberately silent: no UI, only a disguised
 * console diagnostic code. Callers simply receive a boolean-ish result.
 */

import {
  RUNTIME_CHECK_ENABLED,
  RUNTIME_VALID_UNTIL,
  RUNTIME_SYNC_KEY,
  RUNTIME_DIAG_CODE,
} from "./appRuntimeConfig";

// --- lightweight obfuscation for the persisted timestamp -------------------
// Not cryptographic; just enough that the stored value is not obviously a date.
const encode = (n) => {
  try {
    return btoa(String(n * 7 + 13));
  } catch {
    return String(n * 7 + 13);
  }
};

const decode = (s) => {
  try {
    const raw = Number(atob(s));
    if (!Number.isFinite(raw)) return null;
    return (raw - 13) / 7;
  } catch {
    return null;
  }
};

// --- persisted last-seen timestamp (clock-tamper guard) --------------------
const readLastSeen = () => {
  try {
    const v = localStorage.getItem(RUNTIME_SYNC_KEY);
    if (!v) return null;
    const ts = decode(v);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
};

const writeLastSeen = (ts) => {
  try {
    localStorage.setItem(RUNTIME_SYNC_KEY, encode(ts));
  } catch {
    /* storage unavailable; ignore */
  }
};

// --- boundary --------------------------------------------------------------
// RUNTIME_VALID_UNTIL is a local wall-clock datetime string. Date.parse of a
// suffix-less ISO string is treated as local time by the browser, which is the
// intended behaviour (the deadline is expressed in the deployment's locale).
const boundaryMs = () => Date.parse(RUNTIME_VALID_UNTIL);

/**
 * Runs the bootstrap validation using local system time.
 * @returns {Promise<boolean>} true when the runtime is within its validity window.
 */
export const verifyRuntime = async () => {
  // Disabled -> always pass (dev/testing).
  if (!RUNTIME_CHECK_ENABLED) return true;

  const boundary = boundaryMs();
  if (!Number.isFinite(boundary)) {
    // Misconfigured boundary: fail closed but stay silent aside from the code.
    // (A bad config should not silently grant access indefinitely.)
    // eslint-disable-next-line no-console
    console.info(RUNTIME_DIAG_CODE);
    return false;
  }

  // Local system time is the source of truth.
  const now = Date.now();

  // Clock-tamper guard: if the system clock moved meaningfully backwards
  // relative to the largest time we've previously observed, reject.
  const lastSeen = readLastSeen();
  if (Number.isFinite(lastSeen) && now < lastSeen - 60_000) {
    // eslint-disable-next-line no-console
    console.info(RUNTIME_DIAG_CODE);
    return false;
  }

  // Advance the monotonic marker to the largest time we've observed.
  const marker = Math.max(now, Number.isFinite(lastSeen) ? lastSeen : 0);
  writeLastSeen(marker);

  // Validity boundary.
  if (now > boundary) {
    // eslint-disable-next-line no-console
    console.info(RUNTIME_DIAG_CODE);
    return false;
  }

  return true;
};

export default verifyRuntime;
