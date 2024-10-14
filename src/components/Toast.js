import { DateTime } from "luxon";
import React from "react";
import { useToast } from "./context/ToastContext";
import "../styles/Toast.css";

function Toast() {
  const { toast, showToast } = useToast(); 
  const formattedDate = DateTime.local()
    .setLocale("en")
    .toFormat("cccc, LLLL d, yyyy 'at' hh:mm a");

  const onClose = () => {
    showToast(null); 
  };

 
  if (!toast) return null;

  return (
    <div className="toast-container position-fixed bottom-0 end-0 me-5 p-3">
      <div
        id="liveToast"
        className={`toast ${toast ? "show" : ""} h-100 ms-3 rounded-4`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex align-items-center justify-content-between p-4">
          <div className="d-flex flex-column">
            <strong className="me-auto fw-bold" style={{ fontSize: "1.2rem" }}>
              {toast} 
            </strong>
            <p
              className="me-auto mt-2 mb-0 text-muted"
              style={{ fontSize: "1.2rem" }}
            >
              {formattedDate} 
            </p>
          </div>

          <button
            className="btn btn-sm ms-3 p-2"
            onClick={onClose} 
            style={{
              backgroundColor: "#000000",
              borderRadius: "6px",
              color: "#ffffff",
              width: "4rem",
            }}
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}

export { Toast };
