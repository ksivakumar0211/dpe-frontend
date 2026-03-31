// components/CustomPosModal.tsx
import { apiRequest } from "@/store/services/api";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import axios from "@/utils/axios";
import moment from "moment";
import LoadingFetchLoader from "../LoadingFetchLoader";

interface CustomPosModalProps {
    isOpen: boolean;
    processing?: boolean;
    title?: string;
    onCancel: () => void;
    paymentRecord?: any;
    setProcessingPayment?: any;
    setConfirmPaymentModal?: any
    formData?: any
    setFormData?: any
    initial?: any;
    setIsEnablePrintReport?: any;
    setIsEnablePosTransaction?: any;
    setPaymentRecord?: any
    amount?: any;
}

const CustomPosModal: React.FC<CustomPosModalProps> = ({
    isOpen,
    amount,
    processing = false,
    title = "POS Payment",
    onCancel,
    paymentRecord,
    setConfirmPaymentModal,
    setProcessingPayment,
    formData,
    setFormData,
    initial,
    setIsEnablePrintReport,
    setIsEnablePosTransaction,
    setPaymentRecord
}) => {
    if (!isOpen) return null;
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const [reportDownloading, setReportDownloading] = useState<boolean>(false);
    const onConfirmPayment = useCallback(async () => {
        try {
            setConfirmPaymentModal(false);
            setProcessingPayment(true);
            const totalAmount = paymentRecord.reduce((sum: number, row: any) => sum + (Number(row.totalVal) || 0), 0);
            const roundedAmount = Math.ceil(((totalAmount + Number.EPSILON) * 100) / 100);;
            const cfsNos = paymentRecord.map((item: any) => item.cfsNo);
            const url = `/pos/payments?chitNo=${formData?.adChitNo}&amount=${roundedAmount}`;
            const resp = await apiRequest({ url, method: "POST", data: cfsNos });
            toast.success("Payment Successfully done.", { position: "top-right", autoClose: 6000 });
            if (resp.status == "SUCCESS") {
                const apiPath = `/report/jasper/PDF/DPE_Bill_PDF.jrxml`;
                const payload = { p2prequestiD: resp.p2pRequestId || 123, };
                setReportDownloading(true)
                const pdfResponse = await axios({ url: apiPath, method: "POST", data: payload, headers: { Authorization: `Bearer ${auth?.token}`, }, responseType: "blob" });
                const blob = new Blob([pdfResponse.data], { type: "application/pdf", });
                const fileURL = window.URL.createObjectURL(blob);
                setIsEnablePrintReport(true)
                setIsEnablePosTransaction(true)
                setPaymentRecord([])
                setFormData(initial)
                window.open(fileURL, "_blank");
                setTimeout(() => {
                    window.URL.revokeObjectURL(fileURL);
                }, 5000);
            }
        } catch (error) {
            toast.error("Payment failed! Please try again", { position: "top-right", autoClose: 6000 });
        } finally {
            setProcessingPayment(false);
            setReportDownloading(false)
        }
    }, [paymentRecord, formData, auth]);
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
                                onClick={onConfirmPayment}
                            >
                                Yes
                            </button>

                        </div>
                    </>
                ) : (
                    <div style={{ fontWeight: "bold", color: "#023e8a" }}>
                        Processing Payment...
                        <LoadingFetchLoader />
                    </div>
                )}
                {reportDownloading && <LoadingFetchLoader />}
            </div>
        </>
    );
};

export default CustomPosModal;
