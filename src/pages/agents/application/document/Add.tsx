import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import CommonSelectModal from "@/components/CommonSelectModal";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
import { apiRequest } from "@/store/services/api";
import DpeTableRow from "./DpeTableRow";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "./style.css"
export interface Column {
    id: number;
    key: string;
    label: string;
}

interface TableRow {
    documentType: string;
    docFile: any;
    documentRemarks: string;
    docUploadDate: string;
    dccDownLink: string;
    srlNo: string;
    cancelFlag: string;
}

const Add: React.FC = () => {
    const initial = {
        vesselNo: "",
        vcn: "",
        zoneId: "",
        agentCustomerName: "",
        berthedTime: "",
        vesselName: "",
        agentCustomerId: "",
        documents: [{
            srlNo: null,
            documentType: ".pdf",
            docFile: null,
            documentRemarks: "",
            cancelFlag: "N",
            docUploadDate: moment().format('DD/MM/YYYY'),
        }]
    }

    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});
    const [adding, setAdding] = useState(false);

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

    const handleRowChange = useCallback(
        async (index: number, field: keyof TableRow, value: any) => {
            setFormData((prev: any) => {
                const rows = [...prev.documents];
                let row: TableRow = { ...rows[index], [field]: value };
                rows[index] = row;
                return { ...prev, documents: rows };
            });
            setErrors((prev) => ({
                ...prev,
                [`row_${index}`]: {
                    ...prev[`row_${index}`],
                    [field]: "",
                },
            }));
        }, []);


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
        if (!row.docUploadDate) itemErrors.docUploadDate = "Upload date is required";
        if (!row.documentRemarks) itemErrors.documentRemarks = "Document remarks is required";
        if (!row.docFile) {
            itemErrors.docFile = "Document file is required";
        } else {
            const fileType = (row?.docFile as File)?.type;
            const pdfOnly = ["application/pdf"];
            const allAllowed = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ];

            if (row.documentType === ".pdf") {
                if (!pdfOnly.includes(fileType)) {
                    itemErrors.docFile = "Only PDF allowed";
                }
            } else {
                if (!allAllowed.includes(fileType)) {
                    itemErrors.docFile = "Only PDF, DOC, DOCX, XLS, XLSX allowed";
                }
            }
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
            if (!formData?.vesselNo) {
                toast.warn("Please add Document details first before adding new row.", { position: "top-right", autoClose: 6000 });
                return;
            }
            const rows = formData?.documents || [];
            if (rows.length > 0) {
                const lastIndex = rows.length - 1;
                const lastRow: any = rows[lastIndex];
                if (!validateRow(lastRow, lastIndex)) {
                    toast.error("Please fill mandatory field row errors before adding new row", { position: "top-right", autoClose: 6000 });
                    return;
                }
            }

            const newRow = {
                documentType: ".pdf",
                docFile: null,
                documentRemarks: "",
                docUploadDate: moment().format('DD/MM/YYYY'),
                dccDownLink: "",
                cancelFlag: "",
            };

            setFormData((prev: any) => ({
                ...prev,
                documents: [...(prev.documents || []), newRow],
            }));

        } catch (error) {
            toast.error("Failed to add row");
        } finally {
            setAdding(false);
        }
    };

    const navigate = useNavigate();
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const saveRow = useCallback(async () => {
        const headerErrors: Record<string, string> = {};
        if (!formData.vesselNo) headerErrors.vesselNo = "Vessel No is required";
        if (Object.keys(headerErrors).length > 0) {
            setErrors(headerErrors);
            toast.error("Please fill all mandatory fields", { position: "top-right", autoClose: 4000 });
            return;
        }
        let hasRowErrors = false;
        formData.documents.forEach((row: any, index) => {
            if (!validateRow(row, index)) {
                hasRowErrors = true;
            }
        });
        if (hasRowErrors) {
            toast.error("Please fix all row errors before submitting", { position: "top-right", autoClose: 4000 });
            return;
        }

        setSubmitting(true);
        const formDataToSend = new FormData();
        formDataToSend.append("vesselNo", formData.vesselNo);
        formDataToSend.append("vesselName", formData.vesselName);
        formDataToSend.append("vcn", formData.vcn);
        formDataToSend.append("berthedTime", formData?.berthedTime ? moment(formData.berthedTime, "DD-MM-YYYY").format("DD-MM-YYYY HH:MM:ss") : "");
        formDataToSend.append("agentCustomerId", formData.agentCustomerId);
        formDataToSend.append("agentCustomerName", formData.agentCustomerName);
        formDataToSend.append("zoneId", formData.zoneId);
        formData.documents.forEach((item, index) => {
            formDataToSend.append(`documents[${index}].documentType`, item.documentType);
            formDataToSend.append(`documents[${index}].documentRemarks`, item.documentRemarks);
            formDataToSend.append(`documents[${index}].docUploadDate`, item.docUploadDate ? moment(item.docUploadDate, "YYYY-MM-DD").format("DD-MM-YYYY") : "");
            formDataToSend.append(`documents[${index}].dccDownLink`, "");
            if (item?.srlNo) {
                formDataToSend.append(`documents[${index}].srlNo`, item.srlNo);
            }

            if (item.docFile) {
                formDataToSend.append(`documents[${index}].file`, item.docFile);
            }
        });

        try {
            await apiRequest({
                url: `/doc/save?userId=${auth?.userId}`,
                method: "POST",
                data: formDataToSend,
                params: {},
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("File uploaded successfully");
        } catch (rr) {
            toast.error("Upload failed");;
        } finally {
            setSubmitting(false);
        }
    }, [formData, auth]);


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
                <RowFormCheckField label="Vessel No" name="vesselNo" inputValue={formData.vesselNo} error={errors.vesselNo} required onChange={handleChange} click={() => onChangeSelect("vesselss", formData.vesselNo)} />
                <RowFormInputField label="Vessel Name" name="vesselName" isDefault={true} inputValue={formData.vesselName} error={errors.vesselName} onChange={handleChange} />
                <RowFormInputField label="VCN" name="vcn" isDefault={true} inputValue={formData.vcn} error={errors.vcn} onChange={handleChange} />
                <RowFormInputField label="Berthed Time" name="berthedTime" isDefault={true} inputValue={formData.berthedTime} error={errors.berthedTime} onChange={handleChange} />
                <RowFormInputField label="Agent Name" name="agentCustomerName" isDefault={true} col2="col-md-11" inputValue={formData.agentCustomerName} error={errors.agentCustomerName} onChange={handleChange} />
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
                                    <th style={{ minWidth: "5px" }}>#</th>
                                    <th style={{ minWidth: "140px" }}>Document Type</th>
                                    <th style={{ minWidth: "155px" }}>Document Remarks<span className="text-danger">*</span></th>
                                    <th>Upload Date<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "200px" }}>Doc Upload <span className="text-danger">*</span></th>
                                    <th>Download Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData?.documents.map((row, index) => (
                                    <DpeTableRow
                                        key={index}
                                        row={row}
                                        index={index}
                                        errors={errors}
                                        setFormData={setFormData}
                                        formData={formData}
                                        handleRowChange={handleRowChange}
                                        setErrors={setErrors}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm mt-2 mr-4"
                        onClick={addRow}
                        style={{ borderRadius: "0px", backgroundColor: "#023e8a", color: "#fff" }}
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
                    onClick={saveRow}
                    className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`}
                    disabled={submitting}
                    style={{ minWidth: "100px" }}
                >
                    {submitting && <span className="spinner-center"></span>}
                    {!submitting && <span className="btn-text">Submit</span>}
                </button>
            </div>

            {modal && (
                <CommonSelectModal
                    isOpen={modal}
                    onClose={() => setModal(false)}
                    itemsPerPage={12}
                    apiRequest={apiRequest}
                    setFormData={setFormData}
                    config={config}
                />
            )}
        </div>
    );
};

export default Add;
