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
import "./style.css"
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
        vesselNo:"",
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
        details: [{
            documentType: "",
            documentRemarks: "",
            documentUpDate: moment().format('DD/MM/YYYY HH:MM'),
            documentUpLink: "",
        }]
    }

    const dispatch = useDispatch();
    const [services, setServices] = useState([]);
    const [paymentRecord, setPaymentRecord] = useState<Record<string, any>>([]);
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [canPay, setCanPay] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});
    const [adding, setAdding] = useState(false);
    const [inserting, setInserting] = useState({ index: null, isInserting: false });
    const [confirmPaymentModal, setConfirmPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Agent", path: "" },
                { label: "Application", path: "" },
                { label: "Document Upload", path: "" },
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
                const rows = [...prev.details];
                let row: TableRow = { ...rows[index], [field]: value };
                if (["rate", "from", "to"].includes(field)) {
                    row = recalculateRow(row);
                }
                rows[index] = row;
                return { ...prev, details: rows };
            });
            if (field === "service") {
                const url = `/rate?serviceId=${value}&containerSize=${formData.containerSize}&loadingStatus=${formData.loadingStatus}&foreignCoastalFlag=${formData.foreignCoastalFlag}`;
                const rate = await apiRequest({ url, method: "GET" });
                setFormData((current: any) => {
                    const updatedRows = [...current.details];
                    let updatedRow = {
                        ...updatedRows[index],
                        rate,
                    };
                    updatedRow = recalculateRow(updatedRow);
                    updatedRows[index] = updatedRow;
                    return { ...current, details: updatedRows };
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
               
            if (!formData?.vesselNo) {
                toast.warn("Please add Document Details first before adding new row.", { position: "top-right", autoClose: 6000 });
                return;
            }
            const rows = formData?.details || [];
            if (rows.length > 0) {
                const lastIndex = rows.length - 1;
                const lastRow: any = rows[lastIndex];

                if (!validateRow(lastRow, lastIndex)) {
                    toast.error("Please fill mandatory field row errors before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                } 
            }

            const newRow = {
                documentType: "",
                documentRemarks: "",
                documentUpDate: moment().format('DD/MM/YYYY HH:MM'),
                documentUpLink: "",

            };

            setFormData((prev: any) => ({
                ...prev,
                details: [...(prev.details || []), newRow],
            }));

        } catch (error) {
            toast.error("Failed to generate CFS number");
        } finally {
            setAdding(false);
        }
    };



    const deleteRow = (index: number) => {
        setFormData((prev: any) => {
            const rows = [...prev.details];
            if (rows[index]?.isSaved) {
                toast.warning("Saved row cannot be deleted");
                return prev;
            }
            rows.splice(index, 1);
            return { ...prev, details: rows };
        });
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`row_${index}`];
            return newErrors;
        });
    };
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    // const saveRow = useCallback(async (index: number) => {
    //     const row = formData.details[index];
    //     const isValid = validateRow(row, index);
    //     if (!isValid) {
    //         toast.error("Please fix row errors before saving");
    //         return;
    //     }
    //     setInserting((prev: any) => { return { ...prev, index: index, isInserting: true }; });

    //     const item: any = formData?.details[index]
    //     if (!item) {
    //         toast.error("Please add row and fill the mandatory field.");
    //         return;
    //     }
    //     const payload = {
    //         header: {
    //             chitNo: formData?.adChitNo,
    //             containerNo: formData?.containerNo,
    //             gateInDateTime: formData?.adTime ? moment(formData?.adTime, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             partyCd: formData?.chAgentCode,
    //             agentCustomerName: formData?.chAgentName,
    //             boeNo: formData?.shipBillNo,
    //             tenDeliveryDate: formData?.delDateTentive ? moment(formData?.delDateTentive, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             actDeliveryDate: formData?.delDateActual ? moment(formData?.delDateActual, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             zoneId: formData?.zoneId || "",
    //         },
    //         detail: {
    //             ...(item?.id && { id: item?.id }),
    //             cfsNo: item?.cfsNo,
    //             cfsDate: item?.cfsDate ? moment(item?.cfsDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             serviceTypeCd: item?.service,
    //             serviceFromDate: item?.from ? moment(item?.from, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             serviceToDate: item?.to ? moment(item?.to, "YYYY-MM-DD").format("DD/MM/YYYY") : "",
    //             rate: item?.rate,
    //             amount: item?.amount,
    //             cgst: item?.cgst || 0,
    //             sgst: item?.sgst || 0,
    //             igst: item?.igst || 0,
    //             gst: item?.gst || 0,
    //             totalVal: item?.totalVal,
    //             paymentNo: item?.paymentNo,
    //             paymentDate: item.paymentDate ? item?.paymentDate : "",
    //             serviceRemarks: item?.remarks,
    //             cancelFlag: "N",
    //         }
    //     }
    //     try {
    //         const url = `/service/charge/add-edit?userId=${auth?.userID}`
    //         const response = await apiRequest({ url, method: "POST", data: payload })
    //         toast.success("Row inserted successfully", { position: "top-right", autoClose: 6000 });

    //         const detail: any[] = response?.success && response?.success?.serviceDetails?.length
    //             ? response?.success?.serviceDetails.map((item: any) => {
    //                 const rate = Number(item.rate) || 0;
    //                 const days = calculateDays(moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD"), moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
    //                 const amount = rate * days;
    //                 const gstRate = 0.18;
    //                 const gstAmount = amount * gstRate;
    //                 return {
    //                     id: item?.id ? item?.id : "",
    //                     cfsNo: item?.cfsNo ? item?.cfsNo : "",
    //                     cfsDate: item.cfsDate ? moment(item.cfsDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
    //                     service: item?.serviceTypeCd,
    //                     from: item.serviceFromDate ? moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
    //                     to: item.serviceToDate ? moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
    //                     rate: item?.rate ? item?.rate : 0,
    //                     amount: item?.amount ? item?.amount : 0,
    //                     sgst: item?.sgst ? item?.sgst : 0,
    //                     cgst: item?.cgst ? item?.cgst : 0,
    //                     igst: item?.igst ? item?.igst : 0,
    //                     gst: Number(gstAmount.toFixed(2)) || 0,
    //                     totalVal: item?.totalVal ? item?.totalVal : 0,
    //                     paymentNo: item?.paymentNo ? item?.paymentNo : "",
    //                     paymentDate: item.paymentDate ? item?.paymentDate : "",
    //                     remarks: item?.serviceRemarks ? item?.serviceRemarks : "",
    //                     cancelFlag: "N",
    //                 }
    //             }) : [];

    //         setFormData((prev: any) => ({
    //             ...prev,
    //             details: detail,
    //         }));
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Failed to save row");
    //     } finally {
    //         setInserting((prev: any) => { return { ...prev, index: null, isInserting: false }; });

    //     }
    // }, [auth])


    const navigate = useNavigate();


    useEffect(() => {
        const rows = formData?.details || [];
        if (rows.length > 0) {
            const lastRow: any = rows[rows.length - 1];
            const hasId = Object.prototype.hasOwnProperty.call(lastRow, "id");
            setCanPay(!hasId);
        }
    }, [formData]);



    return (

        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Document Upload &gt;&gt; Add
                </span>
            </div>
            <div className="row">
                <RowFormCheckField label="Vessel No" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} required onChange={handleChange} click={() => onChangeSelect("container", formData.containerNo)} />
                <RowFormInputField label="Vessel Name" name="adChitNo" isDefault={true} inputValue={formData.adChitNo} error={errors.adChitNo} onChange={handleChange} />
                <RowFormInputField label="VCN" name="adTime" isDefault={true} inputValue={formData.adTime} error={errors.adTime} onChange={handleChange} />
                <RowFormInputField label="Berthed Time" name="chAgentName" isDefault={true} inputValue={formData.chAgentName} error={errors.chAgentName} onChange={handleChange} />
                <RowFormInputField label="Agent Name" name="chAgentName" isDefault={true} inputValue={formData.chAgentName} error={errors.chAgentName} onChange={handleChange} />

                {/* <RowFormInputField label="Shipping Bill No" name="shipBillNo" isDefault={true} inputValue={formData.shipBillNo} error={errors.shipBillNo} onChange={handleChange} />
                <RowFormInputField type="date" label="Delivery Date (Tentative)" name="delDateTentive" inputValue={formData.delDateTentive} error={errors.delDateTentive} onChange={handleChange} />
                <RowFormInputField label="Delivery Date (Actual)" name="delDateActual" isDefault={true} inputValue={formData.delDateActual} error={errors.delDateActual} onChange={handleChange} /> */}
            </div>
            <div className="text-white px-3 mb-3 mt-2 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>
                    ➤ Document Details
                </span>
            </div>
            <div className="row">
                <div className="col-12">
                    <div style={{ overflowX: "auto" }}>
                        <table className="custom-table text-white">
                            <thead style={{ backgroundColor: "#023e8a" }}>
                                <tr>
                                    <th style={{ minWidth: "10px" }}>Document Type</th>
                                    <th style={{ minWidth: "140px" }}>Document Type</th>
                                    <th style={{ minWidth: "155px" }}>Document Remarks<span className="text-danger">*</span></th>
                                    <th >Upload Date<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "200px" }}>Doc Upload <span className="text-danger">*</span></th>
                                    <th>Download Link</th>
                                </tr>
                            </thead>

                            <tbody>
                                {formData?.details.map((row, index) => (
                                    <DpeTableRow
                                        key={index}
                                        row={row}
                                        index={index}
                                        services={services}
                                        errors={errors}
                                        setFormData={setFormData}
                                        formData={formData}
                                        handleRowChange={handleRowChange}
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
                    onClick={() => navigate("/editGateIn")}
                >
                    Back to Search Page
                </button>

                <button
                    type="submit"
                    className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`}
                    disabled={submitting}
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
        </div>

    );
};

export default Add;
