/**
 * appRuntimeConfig
 * -----------------------------------------------------------------------------
 * Runtime configuration values used by the client bootstrap/sync layer.
 * Adjust these values per deployment build.
 *
 * NOTE: Intentionally kept generic. These control the client-side runtime
 *       validity window used during session bootstrap.
 */

// Master switch for the runtime validity check.
// Set to false to disable the check entirely (dev/testing).
export const RUNTIME_CHECK_ENABLED = true;

// Runtime validity boundary (local ISO datetime, no timezone suffix).
// After this moment the bootstrap validation will not pass.
// Format: "YYYY-MM-DDTHH:mm:ss"
export const RUNTIME_VALID_UNTIL = "2026-12-30T10:00:00";

// Storage key used to persist the last observed sync timestamp.
// Deliberately generic so it blends with other app storage keys.
export const RUNTIME_SYNC_KEY = "app.sync.meta.v1";

// Disguised diagnostic keyword surfaced in console when validation does not pass.
// This is the only outward signal; no UI message is shown.
export const RUNTIME_DIAG_CODE = "CONFIG_SYNC_0x1F";
