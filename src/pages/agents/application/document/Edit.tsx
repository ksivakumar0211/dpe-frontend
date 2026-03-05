import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { calculateDays } from "@/utils/commonHelper";
import DpeTableRow from "./DpeTableRow";
import moment from "moment"; 
import RowFormCheckField from "@/components/Form/RowFormCheckField";
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

interface SettingsModalProps {
    apiRequest?: any;
    initialForm?: any;
    setIsEdit?: any;
    setInitialForm?: any;
}

const Edit: React.FC<SettingsModalProps> = ({
    setIsEdit,
    apiRequest,
    initialForm,
    setInitialForm
}) => {

    const dispatch = useDispatch();
    const [services, setServices] = useState([]);
    const [paymentRecord, setPaymentRecord] = useState<Record<string, any>>([]);
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [canPay, setCanPay] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});
    const [adding, setAdding] = useState(false);
    const [inserting, setInserting] = useState({ index: null, isInserting: false });
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Container Operation", path: "" },
                { label: "Transaction", path: "" },
                { label: "Direct Port Entry Service Charges", path: "" },
                { label: "Edit" }
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
            const rows = [...prev.details];
            const row = { ...rows[index], [field]: value };
            const amount = Number(row.amount) || 0;
            const gst = Number(row.gst) || 0;
            row.total = Number((amount + (amount * gst) / 100).toFixed(2));
            rows[index] = row;
            return { ...prev, details: rows };
        });
    }, []);



    /**Handle Change (onchange request) */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData: any) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };



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
            const rows = formData?.details || [];
            if (rows.length > 0) {
                const lastIndex = rows.length - 1;
                const lastRow: any = rows[lastIndex];

                if (!validateRow(lastRow, lastIndex)) {
                    toast.error("Please fill mandatory field row errors before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                }
                if (!lastRow?.id) {
                    toast.error("Please insert the current row before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                }
            }
            const cfsNo = await apiRequest({ url: "/generate-cfs", method: "GET" });

            const newRow = {
                cfsNo,
                cfsDate: "",
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
     

    useEffect(() => {
        const rows = formData?.details || [];
        if (rows.length > 0) {
            const lastRow: any = rows[rows.length - 1];
            const hasId = Object.prototype.hasOwnProperty.call(lastRow, "id");
            setCanPay(!hasId);
        }
    }, [formData]);

  const onChangeSelect = useCallback(async (field: any, query?: any) => {
        setModal(true)
        setErrors({})
        // const cfg = searchConfig[field];
        // cfg.search = query ? query : ""
        // setConfig(cfg)
    }, [])
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
                {/* <RowFormCheckField label="Vessel No" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} required onChange={handleChange} click={() => onChangeSelect("container", formData.containerNo)} /> */}
                <RowFormInputField label="Vessel Name" name="adChitNo" isDefault={true} inputValue={formData.adChitNo} error={errors.adChitNo} onChange={handleChange} />
                <RowFormInputField label="VCN" name="adTime" isDefault={true} inputValue={formData.adTime} error={errors.adTime} onChange={handleChange} />
                <RowFormInputField label="Berthed Time" name="chAgentName" isDefault={true} inputValue={formData.chAgentName} error={errors.chAgentName} onChange={handleChange} />
                <RowFormInputField label="Agent Name" name="chAgentName" isDefault={true} inputValue={formData.chAgentName} error={errors.chAgentName} onChange={handleChange} />

             
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
                                {formData?.details.map((row:any, index:any) => (
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
                    // onClick={() => navigate("/editGateIn")}
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
export default Edit;
