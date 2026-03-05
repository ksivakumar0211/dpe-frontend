import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { calculateDays, searchConfig } from "@/utils/commonHelper";
import { apiRequest } from "@/store/services/api";
import DpeTableRow from "./DpeTableRow";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import ConfirmPaymentModal from "@/components/Form/ConfirmPaymentModal";
import ProcessingPayment from "@/components/Form/ProcessingPayment";

export interface Column {
    id: number;
    key: string;
    label: string;
}

interface TableRow {
    cfsNo: string;
    cfsDate: string;
    service: string;
    from: string;
    to: string;
    rate: number;
    amount: number;
    sgst: number,
    cgst: number,
    igst: number,
    gst: number;
    total: number;
    totalVal: number;
    paymentNo: string;
    paymentDate: string;
    remarks: string;
}

const Add: React.FC = () => {
    const initial = {
        adChitNo: "",
        adTime: "",
        containerNo: "",
        chAgentCode: "",
        chAgentName: "",
        shipBillNo: "",
        delDateTentive: "",
        delDateActual: "",
        loadingStatus: "",
        foreignCoastalFlag: "",
        containerSize: "",
        zoneId: "",
        serviceDetails: []
    }

    const dispatch = useDispatch();
    const [services, setServices] = useState([]);
    const [paymentRecord, setPaymentRecord] = useState<Record<string, any>>([]);
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [canPay, setCanPay] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isPaymenting, setIPaymenting] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});
    const [adding, setAdding] = useState(false);
    const [inserting, setInserting] = useState({ index: null, isInserting: false });
    const [confirmPaymentModal, setConfirmPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Container Operation", path: "" },
                { label: "Transaction", path: "" },
                { label: "Direct Port Entry Service Charges", path: "" },
                { label: "Add" }
            ])
        );
    }, [dispatch]);

    const fetchServices = async () => {
        try {
            const url = "/services";
            const response = await apiRequest({ url, method: "GET" });
            if (response?.length > 0) {
                const newData = response.map((row: any) => ({
                    label: row?.serviceName,
                    value: row?.serviceId,
                }));
                setServices(newData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchServices();
    }, []);

    const recalculateRow = (row: TableRow): TableRow => {
        const rate = Number(row.rate) || 0;
        const days = calculateDays(row.from, row.to);
        const amount = rate * days;
        const gstRate = 0.18;
        const gstAmount = amount * gstRate;
        const cgstAmount = amount * 0.09;
        const sgstAmount = amount * 0.09;

        const total = amount + gstAmount;

        return {
            ...row,
            amount: Number(amount.toFixed(2)) || 0,
            gst: Number(gstAmount.toFixed(2)) || 0,
            cgst: Number(cgstAmount.toFixed(2)) || 0,
            sgst: Number(sgstAmount.toFixed(2)) || 0,
            totalVal: Number(total.toFixed(2)) || 0,
        };
    };


    const handleRowChange = useCallback(
        async (index: number, field: keyof TableRow, value: any) => {
            setFormData((prev: any) => {
                const rows = [...prev.serviceDetails];
                let row: TableRow = { ...rows[index], [field]: value };
                if (["rate", "from", "to"].includes(field)) {
                    row = recalculateRow(row);
                }
                rows[index] = row;
                return { ...prev, serviceDetails: rows };
            });
            if (field === "service") {
                const url = `/rate?serviceId=${value}&containerSize=${formData.containerSize}&loadingStatus=${formData.loadingStatus}&foreignCoastalFlag=${formData.foreignCoastalFlag}`;
                const rate = await apiRequest({ url, method: "GET" });
                setFormData((current: any) => {
                    const updatedRows = [...current.serviceDetails];
                    let updatedRow = {
                        ...updatedRows[index],
                        rate,
                    };
                    updatedRow = recalculateRow(updatedRow);
                    updatedRows[index] = updatedRow;
                    return { ...current, serviceDetails: updatedRows };
                });
            }
            setErrors((prev) => ({
                ...prev,
                [`row_${index}`]: {
                    ...prev[`row_${index}`],
                    [field]: "",
                },
            }));
        }, [formData]);



    const checkRowForPayment = useCallback((row: any) => {
        const totalAmount = Number(row?.totalVal || row?.total || 0);
        if (!totalAmount || totalAmount <= 0) {
            toast.warn("Amount should not be 0(zero).", { position: "top-right", autoClose: 6000 });
            return;
        }

        setPaymentRecord((prev: any[]) => {
            const exists = prev.some(
                (item: any) =>
                    item?.id?.chitNo === row?.id?.chitNo &&
                    item?.id?.srlNo === row?.id?.srlNo
            );
            if (exists) {
                return prev.filter((item: any) => !(
                    item?.id?.chitNo === row?.id?.chitNo &&
                    item?.id?.srlNo === row?.id?.srlNo
                )
                );
            }
            return [...prev, row];
        });
    }, []);




    const sanitizeNumber = (value: string, field?: "rate" | "amount" | "gst") => {
        let numericValue = value.replace(/[^0-9.]/g, "");
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            numericValue = parts[0] + "." + parts[1];
        }
        if (field === "gst") {
            const gstValue = Number(numericValue);
            if (gstValue > 100) numericValue = "100";
        }
        return Number(numericValue) || 0;
    };


    const handleCalcChange = useCallback((index: number, field: "rate" | "amount" | "gst", rawValue: string) => {
        const value = sanitizeNumber(rawValue, field);
        setFormData((prev: any) => {
            const rows = [...prev.serviceDetails];
            const row = { ...rows[index], [field]: value };
            const amount = Number(row.amount) || 0;
            const gst = Number(row.gst) || 0;
            row.total = Number((amount + (amount * gst) / 100).toFixed(2));
            rows[index] = row;
            return { ...prev, serviceDetails: rows };
        });
    }, []);



    /**Handle Change (onchange request) */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const onChangeSelect = useCallback(async (field: any, query?: any) => {
        setModal(true)
        setErrors({})
        const cfg = searchConfig[field];
        cfg.search = query ? query : ""
        setConfig(cfg)
    }, [])

    const validateRow = (row: Partial<TableRow>, index: number) => {
        const itemErrors: Partial<Record<keyof TableRow, string>> = {};
        if (!row.cfsDate) itemErrors.cfsDate = "CFS Date is required";
        if (!row.service) itemErrors.service = "Service is required";
        if (!row.from) itemErrors.from = "From date is required";
        if (!row.to) itemErrors.to = "To date is required";
        if (row.from && row.to && row.to < row.from) {
            itemErrors.to = "To date cannot be before From date";
        }
        setErrors(prev => ({
            ...prev,
            [`row_${index}`]: itemErrors,
        }));
        return Object.keys(itemErrors).length === 0;
    };


    const addRow = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (adding) return;
        setAdding(true);
        try {
            if (!formData?.adChitNo || !formData?.containerNo || !formData?.chAgentName) {
                toast.warn("Please add Container Details first before adding new row.", { position: "top-right", autoClose: 6000 });
                return;
            }
            const rows = formData?.serviceDetails || [];
            if (rows.length > 0) {
                const lastIndex = rows.length - 1;
                const lastRow: any = rows[lastIndex];

                if (!validateRow(lastRow, lastIndex)) {
                    toast.error("Please fill mandatory field row errors before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                }
                if (!lastRow?.id) {
                    toast.error("Please submit the current row before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                }
            }
            const cfsNo = await apiRequest({ url: "/generate-cfs", method: "GET" });

            const newRow = {
                cfsNo,
                cfsDate: moment().format("YYYY-MM-DD"),
                service: "",
                from: "",
                to: "",
                rate: 0,
                amount: 0,
                gst: 0,
                total: 0,
                paymentNo: "",
                paymentDate: "",
                remarks: ""
            };

            setFormData((prev: any) => ({
                ...prev,
                serviceDetails: [...(prev.serviceDetails || []), newRow],
            }));

        } catch (error) {
            toast.error("Failed to generate CFS number");
        } finally {
            setAdding(false);
        }
    };



    const deleteRow = (index: number) => {
        setFormData((prev: any) => {
            const rows = [...prev.serviceDetails];
            if (rows[index]?.isSaved) {
                toast.warning("Saved row cannot be deleted");
                return prev;
            }
            rows.splice(index, 1);
            return { ...prev, serviceDetails: rows };
        });
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`row_${index}`];
            return newErrors;
        });
    };
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const saveRow = useCallback(async() => {
        if (!formData?.adChitNo || !formData?.containerNo || !formData?.chAgentName) {
            toast.warn("Please add Container Details first before adding new row.", { position: "top-right", autoClose: 6000 });
            return;
        }
        const rows = formData?.serviceDetails || [];
        if (rows.length > 0) {
            const lastIndex = rows.length - 1;
            const lastRow: any = rows[lastIndex];

            if (!validateRow(lastRow, lastIndex)) {
                toast.error("Please fill mandatory field row errors before adding new row", { position: "top-right", autoClose: 6000 });
                return;
            } 
        }

        const payload = {
            chitNo: formData?.adChitNo,
            containerNo: formData?.containerNo,
            gateInDateTime: formData?.adTime ? moment(formData?.adTime, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
            partyCd: formData?.chAgentCode,
            agentCustomerName: formData?.chAgentName,
            boeNo: formData?.shipBillNo,
            tenDeliveryDate: formData?.delDateTentive ? moment(formData?.delDateTentive, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
            actDeliveryDate: formData?.delDateActual ? moment(formData?.delDateActual, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
            zoneId: formData?.zoneId || "",
            serviceDetails: formData?.serviceDetails?.map((item: any) => ({
                ...(item?.id && { id: item?.id }),
                cfsNo: item?.cfsNo,
                cfsDate: item?.cfsDate ? moment(item?.cfsDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
                serviceTypeCd: item?.service,
                serviceFromDate: item?.from ? moment(item?.from, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
                serviceToDate: item?.to ? moment(item?.to, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
                rate: item?.rate,
                amount: item?.amount,
                cgst: item?.cgst || 0,
                sgst: item?.sgst || 0,
                igst: item?.igst || 0,
                gst: item?.gst || 0,
                totalVal: item?.totalVal,
                paymentNo: item?.paymentNo,
                paymentDate: item?.paymentDate || "",
                serviceRemarks: item?.remarks,
                cancelFlag: "N",
            })) 
        }

       setSubmitting(true)
       
        try {
            const url = `/service/charge/add-edit?userId=${auth?.userID}`
            const response = await apiRequest({ url, method: "POST", data: payload })
            console.log('responseresponse',response)
            toast.success("Row inserted successfully", { position: "top-right", autoClose: 6000 });

            const detail: any[] = response?.success && response?.success?.serviceDetails?.length
                ? response?.success?.serviceDetails.map((item: any) => {
                    const rate = Number(item.rate) || 0;
                    const days = calculateDays(moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD"), moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
                    const amount = rate * days;
                    const gstRate = 0.18;
                    const gstAmount = amount * gstRate;
                    return {
                        id: item?.id ? item?.id : "",
                        cfsNo: item?.cfsNo ? item?.cfsNo : "",
                        cfsDate: item.cfsDate ? moment(item.cfsDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                        service: item?.serviceTypeCd,
                        from: item.serviceFromDate ? moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                        to: item.serviceToDate ? moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                        rate: item?.rate ? item?.rate : 0,
                        amount: item?.amount ? item?.amount : 0,
                        sgst: item?.sgst ? item?.sgst : 0,
                        cgst: item?.cgst ? item?.cgst : 0,
                        igst: item?.igst ? item?.igst : 0,
                        gst: Number(gstAmount.toFixed(2)) || 0,
                        totalVal: item?.totalVal ? item?.totalVal : 0,
                        paymentNo: item?.paymentNo ? item?.paymentNo : "",
                        paymentDate: item.paymentDate ? item?.paymentDate : "",
                        remarks: item?.serviceRemarks ? item?.serviceRemarks : "",
                        cancelFlag: "N",
                    }
                }) : [];

            setFormData((prev: any) => ({
                ...prev,
                serviceDetails: detail,
            }));
        } catch (err) {
            console.error(err);
            toast.error("Failed to save row");
        } finally {
            setSubmitting(false)
            setInserting((prev: any) => { return { ...prev, index: null, isInserting: false }; }); 
        }
    }, [auth,formData])

    const handleRazorpayPayment = () => {
        const totalAmount = paymentRecord.reduce((sum: any, row: any) => sum + (row.totalVal || 0), 0);
        if (totalAmount <= 0) {
            toast.error("Invalid amount");
            return;
        }
        setConfirmPaymentModal(true);
    };
    const navigate = useNavigate();


    useEffect(() => {
        const rows = formData?.serviceDetails || [];
        if (rows.length > 0) {
            const lastRow: any = rows[rows.length - 1];
            const hasId = Object.prototype.hasOwnProperty.call(lastRow, "id");
            setCanPay(!hasId);
        }
    }, [formData]);


    const onConfirmPayment = () => {
        setConfirmPaymentModal(false);
        setProcessingPayment(true);
        const totalAmount = 10
        // try {
        //     const options = {
        //         key: "rzp_test_RLf4v1l3wkKW6r",
        //         amount: totalAmount * 100,
        //         currency: "INR",
        //         name: "DPE Service Charges",
        //         description: `POS Payment ₹${totalAmount}`,
        //         handler: function (response: any) {
        //             toast.success("Payment Successful");
        //             setProcessingPayment(false);
        //         },
        //         modal: { backdropclose: false, escape: false },
        //         theme: { color: "#023e8a" },
        //     };
        //     const rzp = new (window as any).Razorpay(options);
        //     rzp.open();
        // } catch (err) {
        //     console.error(err);
        //     toast.error("Payment failed");
        //     setProcessingPayment(false);
        // }
    };

    return (

        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 DPE Service Charge &gt;&gt; Add
                </span>
            </div>
            <div className="row">
                <RowFormCheckField label="Container No" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} required onChange={handleChange} click={() => onChangeSelect("container", formData.containerNo)} />
                <RowFormInputField label="Admission Chit No" name="adChitNo" isDefault={true} inputValue={formData.adChitNo} error={errors.adChitNo} onChange={handleChange} />
                <RowFormInputField label="Admission Time" type="date" name="adTime" isDefault={true} inputValue={formData.adTime} error={errors.adTime} onChange={handleChange} />
                <RowFormInputField label="CH Agent Name" name="chAgentName" isDefault={true} inputValue={formData.chAgentName} error={errors.chAgentName} onChange={handleChange} />
                <RowFormInputField label="Shipping Bill No" name="shipBillNo" isDefault={true} inputValue={formData.shipBillNo} error={errors.shipBillNo} onChange={handleChange} />
                <RowFormInputField type="date" label="Delivery Date (Tentative)" name="delDateTentive" inputValue={formData.delDateTentive} error={errors.delDateTentive} onChange={handleChange} />
                {/* <RowFormInputField label="Delivery Date (Actual)" name="delDateActual" isDefault={true} inputValue={formData.delDateActual} error={errors.delDateActual} onChange={handleChange} /> */}
            </div>
            <div className="text-white px-3 mb-3 mt-2 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>
                    ➤ Details
                </span>
            </div>
            <div className="row">
                <div className="col-12">
                    <div style={{ overflowX: "auto" }}>
                        <table className="custom-table text-white">
                            <thead style={{ backgroundColor: "#023e8a" }}>
                                <tr>

                                    <th style={{ minWidth: "70px" }}>Action</th>
                                    <th style={{ minWidth: "155px" }}>CFS No<span className="text-danger">*</span></th>
                                    <th>CFS Date<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "200px" }}>Service<span className="text-danger">*</span></th>
                                    <th>From<span className="text-danger">*</span></th>
                                    <th>To<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "120px" }}>Rate</th>
                                    <th style={{ minWidth: "160px" }}>Amount</th>
                                    <th style={{ minWidth: "110px" }}>CGST</th>
                                    <th style={{ minWidth: "110px" }}>SGST</th>
                                    <th style={{ minWidth: "110px" }}>Total GST</th>
                                    <th style={{ minWidth: "160px" }}>Total</th>
                                    <th style={{ minWidth: "160px" }}>Payment No</th>
                                    <th style={{ minWidth: "120px" }}>Payment Date</th>
                                    <th style={{ minWidth: "200px" }}>Remarks</th>
                                </tr>
                            </thead>

                            <tbody>
                                {formData?.serviceDetails.map((row, index) => (
                                    <DpeTableRow
                                        key={index}
                                        row={row}
                                        index={index}
                                        services={services}
                                        errors={errors}
                                        deleteRow={deleteRow}
                                        saveRow={saveRow}
                                        inserting={inserting}
                                        handleRowChange={handleRowChange}
                                        paymentRecord={paymentRecord}
                                        checkRowForPayment={checkRowForPayment}
                                        handleCalcChange={handleCalcChange}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm mt-2 mr-4"
                        onClick={addRow}
                        style={{
                            borderRadius: "0px",
                            backgroundColor: "#023e8a",
                            color: "#fff"
                        }}
                    >
                        + Add Row
                    </button>


                </div>
            </div>

            <div className="d-flex gap-3 justify-content-end">
                <button
                    type="button"
                    disabled={submitting}
                    className="btn btn-sm btn-secondary custom-form-control"
                    onClick={() => navigate("/editDpeServiceCharge")}
                >
                    Back to Search Page
                </button>

                <button
                    type="submit"
                    onClick={handleRazorpayPayment}
                    className={`btn btn-warning btn-sm px-4 custom-form-control position-relative ${isPaymenting ? "loading" : ""}`}
                    disabled={isPaymenting || (!(paymentRecord.length > 0) || canPay)}
                    style={{
                        minWidth: "100px"
                    }}
                >
                    {isPaymenting && <span className="spinner-center"></span>}
                    {!isPaymenting && <span className="btn-text">Payment through POS</span>}
                </button>
                <button type="submit" className="btn btn-sm  btn-dark custom-form-control ">
                    Print Payment
                </button>

                <button
                    onClick={() => saveRow()}
                    className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`}
                    disabled={!(formData?.serviceDetails?.length > 0) || submitting}
                    style={{
                        minWidth: "100px"
                    }}
                >
                    {submitting && <span className="spinner-center"></span>}
                    {!submitting && <span className="btn-text">Submit</span>}
                </button>
            </div>

            {
                modal && <PopUpCheckBox
                    isOpen={modal}
                    onClose={() => setModal(false)}
                    itemsPerPage={12}
                    apiRequest={apiRequest}
                    setFormData={setFormData}
                    config={config}
                />
            }

            {confirmPaymentModal && <ConfirmPaymentModal
                amount={paymentRecord.reduce((sum: any, row: any) => sum + (row.totalVal || 0), 0)}
                isOpen={confirmPaymentModal || processingPayment}
                processing={processingPayment}
                onConfirm={onConfirmPayment}
                onCancel={() => setConfirmPaymentModal(false)}
            />}

            {
                processingPayment && <ProcessingPayment isOpen={processingPayment} message="Waiting for Payment" />
            }
        </div>

    );
};

export default Add;
