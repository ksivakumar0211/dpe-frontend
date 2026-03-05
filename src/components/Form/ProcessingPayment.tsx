import React, { useEffect, useState } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  message?: string;
}

const ProcessingPayment: React.FC<ProcessingModalProps> = ({
  isOpen,
  message = "Waiting for POS Payment"
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

  return (
    <> 
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000
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
          // textAlign: "center",
          fontWeight: "bold",
          color: "#023e8a"
        }}
      >
        <div style={{ fontSize: "18px" }}>
          {message}
          <span>{dots}</span>
        </div> 
        <div
          style={{
            marginTop: "12px",
            fontSize: "13px",
            fontWeight: "normal",
            color: "#d00000"
          }}
        >
          ⚠ Please do not refresh or close this page.
        </div>
      </div>
    </>
  );
};

export default ProcessingPayment;
