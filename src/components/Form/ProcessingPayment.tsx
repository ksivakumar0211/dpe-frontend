import React, { useEffect, useState } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  message?: string;
  countdown?: number | null; // seconds remaining — parent se pass karo
}

const ProcessingPayment: React.FC<ProcessingModalProps> = ({
  isOpen,
  message = "Waiting for POS Payment",
  countdown = null,
}) => {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const dots = ".".repeat(dotIndex + 1);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "25px 35px",
          borderRadius: "8px",
          zIndex: 1001,
          minWidth: "320px",
          fontWeight: "bold",
          color: "#023e8a",
        }}
      >
        {/* Message */}
        <div style={{ fontSize: "18px" }}>
          {message}
          <span>{dots}</span>
        </div>

        {/* ✅ Countdown — sirf tab dikhe jab countdown ho */}
        {countdown !== null && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "13px", color: "#555", fontWeight: "normal", marginBottom: "6px" }}>
              Auto-abort in
            </div>
            <div
              style={{
                fontSize: "52px",
                fontWeight: "bold",
                letterSpacing: "3px",
                color: countdown <= 30 ? "#dc3545" : "#023e8a",
              }}
            >
              {formatTime(countdown)}
            </div>
            <div style={{ fontSize: "11px", color: "#999", fontWeight: "normal", marginTop: "4px" }}>
              Report will abort if not ready within 5 minutes
            </div>
          </div>
        )}

        {/* Warning */}
        <div
          style={{
            marginTop: "16px",
            fontSize: "13px",
            fontWeight: "normal",
            color: "#d00000",
          }}
        >
          ⚠ Please do not refresh or close this page.
        </div>
      </div>
    </>
  );
};

export default ProcessingPayment;