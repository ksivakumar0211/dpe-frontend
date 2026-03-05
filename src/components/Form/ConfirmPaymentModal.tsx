// components/CustomPosModal.tsx
import React from "react";

interface CustomPosModalProps {
    isOpen: boolean;
    amount?: number;
    processing?: boolean;
    title?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const CustomPosModal: React.FC<CustomPosModalProps> = ({
    isOpen,
    amount = 0,
    processing = false,
    title = "POS Payment",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 1000,
                }}
            />

            {/* Centered modal */}
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
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
            >
                {!processing ? (
                    <>
                        {/* <h5 style={{ marginBottom: "15px" }}>{title}</h5> */}
                        <p style={{ marginBottom: "20px", color: "#023e8a" }}>
                            Please confirm to pay <strong>₹{amount}</strong> via POS.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                            <button
                                style={{
                                    padding: "8px 20px",
                                    backgroundColor: "#dc3545",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={onCancel}
                            >
                                No
                            </button>
                            <button
                                style={{
                                    padding: "8px 20px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={onConfirm}
                            >
                                Yes
                            </button>

                        </div>
                    </>
                ) : (
                    <div style={{ fontWeight: "bold", color: "#023e8a" }}>
                        Processing Payment...
                    </div>
                )}
            </div>
        </>
    );
};

export default CustomPosModal;
