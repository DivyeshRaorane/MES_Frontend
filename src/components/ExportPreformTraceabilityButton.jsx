import { useState } from "react";
import axios from "axios";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { showError, showSuccess } from "../utils/toastService";

/* Base API URL — already includes the "/api" prefix (see VITE_API_URL). */
const API = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────────────────────────────
   ExportPreformTraceabilityButton

   Reusable button that downloads the preform traceability report
   (.xlsx) for a given bobbin.

   Props:
   - bobbinNo (string, required) — the bobbin to export. When empty,
     the button is disabled.
   - compact (bool) — denser padding/text for toolbars (default true).
   - className (string) — extra classes to merge in.
   - children — custom label (default "Preform Traceability").

   Behavior:
   - GET {API}/preform-traceability/export?bobbin_no=<bobbinNo>
   - Sends JWT: Authorization: Bearer <token> (from localStorage).
   - Response is a binary .xlsx — fetched as a blob and downloaded.
   - Filename taken from the Content-Disposition header when present,
     else falls back to preform_traceability_<bobbinNo>.xlsx.
   - On a JSON error returned as a blob (e.g. 404 "No preform found",
     400 "bobbin_no is required"), the message is shown via toast.
   ───────────────────────────────────────────────────────────── */
const ExportPreformTraceabilityButton = ({
  bobbinNo,
  compact = true,
  className = "",
  children = "Preform Traceability",
}) => {
  const [loading, setLoading] = useState(false);

  const parseFilename = (contentDisposition, fallback) => {
    if (!contentDisposition) return fallback;
    // Prefer RFC 5987 filename* then plain filename.
    const star = contentDisposition.match(/filename\*=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    if (star?.[1]) {
      try { return decodeURIComponent(star[1]); } catch { return star[1]; }
    }
    const plain = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
    return plain?.[1] || fallback;
  };

  const handleExport = async () => {
    const bobbin = (bobbinNo || "").trim();
    if (!bobbin) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API}/preform-traceability/export`, {
        params: { bobbin_no: bobbin },
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const fallbackName = `preform_traceability_${bobbin}.xlsx`;
      const filename = parseFilename(res.headers?.["content-disposition"], fallbackName);

      const blob = new Blob([res.data], {
        type:
          res.data?.type ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(`Export ready: ${filename}`);
    } catch (err) {
      // The server may return a JSON error inside the blob (because we asked
      // for responseType: "blob"). Try to read and parse it for the message.
      let msg = "Export failed";
      const data = err?.response?.data;
      try {
        if (data && typeof data.text === "function") {
          const text = await data.text();
          msg = JSON.parse(text)?.message || msg;
        } else if (data?.message) {
          msg = data.message;
        } else if (err?.message) {
          msg = err.message;
        }
      } catch {
        // Non-JSON error body — keep the default message.
      }
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !(bobbinNo && bobbinNo.trim());

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      title={!bobbinNo ? "Scan a bobbin first" : "Export preform traceability report (.xlsx)"}
      className={`
        flex items-center justify-center gap-1.5
        bg-green-700 text-white rounded font-bold
        transition-all active:scale-95
        ${compact ? "px-3 py-1.5 text-[9px]" : "px-4 py-2 text-xs"}
        ${disabled
          ? "opacity-40 cursor-not-allowed pointer-events-none"
          : "hover:bg-green-800"}
        ${className}
      `}
    >
      {loading
        ? <Loader2 size={compact ? 10 : 14} className="animate-spin" />
        : <FileSpreadsheet size={compact ? 10 : 14} />}
      {loading ? "Exporting..." : children}
    </button>
  );
};

export default ExportPreformTraceabilityButton;
