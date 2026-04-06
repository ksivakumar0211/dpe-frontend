// components/CustomPosModal.tsx
import { apiRequest } from "@/store/services/api";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "@/utils/axios";
import LoadingFetchLoader from "../LoadingFetchLoader";

type ModalState =
    | "confirm"
    | "processing"
    | "countdown"
    | "downloading"
    | "manual";

const CustomPosModal = ({
    isOpen,
    amount,
    onCancel,
    paymentRecord,
    setConfirmPaymentModal,
    setProcessingPayment,
    formData,
    setFormData,
    initial,
    setIsEnablePrintReport,
    setIsEnablePosTransaction,
    setPaymentRecord,
}: any) => {
    if (!isOpen) return null;

    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const [modalState, setModalState] = useState<ModalState>("confirm");
    const [countdown, setCountdown] = useState<number>(120);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const downloadTimerRef = useRef<NodeJS.Timeout | null>(null);
    const p2pRequestIdRef = useRef<string | null>(null);
    const downloadWindowRef = useRef<Window | null>(null);


    useEffect(() => {
        if (modalState !== "processing" && modalState !== "countdown") return;

        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    if (modalState === "processing") {
                        toast.error("⏱ Payment timeout!");
                        setProcessingPayment(false);
                        setConfirmPaymentModal(false);
                    }
                    if (modalState === "countdown") {
                        setModalState("manual");
                        toast.error("⏱ Auto download timeout.");
                    }

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownRef.current!);
    }, [modalState]);

    useEffect(() => {
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
            if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
        };
    }, []);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };


    const triggerPdfDownload = useCallback(async () => {
        try {
            const res = await axios({
                url: `/report/jasper/PDF/DPE_Bill_PDF.jrxml`,
                method: "POST",
                data: { p2prequestiD: p2pRequestIdRef.current },
                headers: { Authorization: `Bearer ${auth?.token}` },
                responseType: "blob",
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            downloadWindowRef.current = window.open("", "_blank");
            if (downloadWindowRef.current && !downloadWindowRef.current.closed) {
                downloadWindowRef.current.location.replace(url);
            }
            if (!downloadWindowRef.current) {
                toast.error("Popup blocked! Please allow popups.");
                toast.error("Auto download failed. Please download manually.");
                return;
            }
            if (downloadTimerRef.current) {
                clearTimeout(downloadTimerRef.current);
            }
            setIsEnablePrintReport(true);
            setIsEnablePosTransaction(true);
            setPaymentRecord([]);
            setFormData(initial);
            setProcessingPayment(false);
            setConfirmPaymentModal(false);

        } catch (err) {
            toast.error("Auto download failed. Please download manually.");
            setModalState("manual");
        }
    }, [auth]);
    const onConfirmPayment = useCallback(async () => {
        try {
            setModalState("processing");
            setProcessingPayment(true);
            const totalAmount = paymentRecord.reduce((sum: number, row: any) => sum + (Number(row.totalVal) || 0), 0);
            const roundedAmount = Math.ceil(((totalAmount + Number.EPSILON) * 100) / 100);;
            const cfsNos = paymentRecord.map((item: any) => item.cfsNo);
            const url = `/pos/payments?chitNo=${formData?.adChitNo}&amount=${roundedAmount}`;
            const controller = new AbortController();
            processingTimerRef.current = setTimeout(() => {
                controller.abort(); 
                setProcessingPayment(false);
                setConfirmPaymentModal(false);
            }, 120000);

            const resp: any = await apiRequest({ url, method: "POST", data: cfsNos, signal: controller.signal });
            if (resp.status === "SUCCESS") {
                toast.success("Payment successfully done.", { position: "top-right", autoClose: 6000 });
                downloadWindowRef.current = window.open("", "_blank");
                if (downloadWindowRef.current) {
                    downloadWindowRef.current.document.write(`
                        <html>
                            <body style="font-family:sans-serif;text-align:center;padding-top:50px">
                            <h3>Generating your report...</h3>
                            <p>Please wait, your report will open automatically.</p>
                            </body>
                        </html>
                        `);
                }
                p2pRequestIdRef.current = resp.p2pRequestId;
                if (processingTimerRef.current) {
                    clearTimeout(processingTimerRef.current);
                }
                setModalState("countdown");
                setCountdown(120);
                downloadTimerRef.current = setTimeout(() => {
                    setModalState("manual");
                    toast.error("⏱ Auto download timeout.");
                }, 5000);
                setTimeout(() => {
                    triggerPdfDownload();
                }, 5000);
            }


        } catch (err: any) {
            if (err.name === "AbortError" || err.name === "CanceledError") {
                toast.error("⏱ Payment timeout!");
            } else {
                toast.error("Payment failed!");
            }
            setProcessingPayment(false);
            setConfirmPaymentModal(false);
        }
    }, [triggerPdfDownload]);

    return (
        <>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1000,
            }} />


            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#fff",
                padding: "25px 35px",
                borderRadius: "10px",
                zIndex: 1001,
                minWidth: "340px",
                textAlign: "center",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
            }}>

                {/* ✅ Confirm */}
                {modalState === "confirm" && (
                    <>
                        <p style={{ marginBottom: "20px", color: "#023e8a", fontSize: "15px" }}>
                            Please confirm to pay <strong>₹{amount}</strong> via POS.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    padding: "8px 22px",
                                    backgroundColor: "#dc3545",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                No
                            </button>

                            <button
                                onClick={onConfirmPayment}
                                style={{
                                    padding: "8px 22px",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Yes
                            </button>
                        </div>
                    </>
                )}

                {/* ⏳ Processing */}
                {modalState === "processing" && (
                    <div style={{ color: "#023e8a" }}>
                        <p style={{ color: "#555", fontSize: "13px", marginBottom: "10px" }}>
                            Processing your payment... Please wait.
                        </p>

                        <div style={{
                            fontSize: "56px",
                            fontWeight: "bold",
                            letterSpacing: "3px",
                            color: countdown <= 30 ? "#dc3545" : "#023e8a",
                            margin: "10px 0",
                        }}>
                            {formatTime(countdown)}
                        </div>

                        <p style={{ fontSize: "12px", color: "#d00000", marginTop: "14px" }}>
                            ⚠ Do not refresh or close this page during payment processing.
                        </p>
                    </div>
                )}
                {modalState === "countdown" && (
                    <div style={{ color: "#023e8a" }}>
                        <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                            ✅ Payment successful!
                        </p>

                        <p style={{ color: "#555", fontSize: "13px", marginBottom: "10px" }}>
                            Preparing your report... Auto-download will start shortly.
                        </p>

                        <div style={{
                            fontSize: "56px",
                            fontWeight: "bold",
                            letterSpacing: "3px",
                            color: countdown <= 30 ? "#dc3545" : "#023e8a",
                            margin: "10px 0",
                        }}>
                            {formatTime(countdown)}
                        </div>

                        <p style={{ fontSize: "12px", color: "#d00000", marginTop: "14px" }}>
                            ⚠ Please do not refresh or close this page.
                        </p>
                    </div>
                )}

                {/* 📥 Downloading */}
                {modalState === "downloading" && (
                    <div style={{ color: "#023e8a" }}>
                        <p style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "bold" }}>
                            Downloading Report...
                        </p>
                        <LoadingFetchLoader />
                    </div>
                )}

                {/* ⚠ Manual */}
                {modalState === "manual" && (
                    <div style={{ color: "#023e8a" }}>
                        <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                            ⚠ Auto download failed or timed out.
                        </p>

                        <button
                            onClick={triggerPdfDownload}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Download Report
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CustomPosModal;