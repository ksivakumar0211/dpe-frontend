import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CommonSelectModal from "@/components/CommonSelectModal";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import DpeTableRow from "./DpeTableRow";
import moment from "moment"; 
import "./style.css";
import axios from "@/utils/axios";

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
    dccFileName: string;
    srlNo: string;
    agentCustomerId: string;
    agentCustomerName: string;
    agentCategory: string;
    cancelFlag: string;
    docType: string;
}

interface SettingsModalProps {
    apiRequest?: any;
    initialForm?: any;
    setIsEdit?: any;
    setInitialForm?: any;
}

const Edit: React.FC<SettingsModalProps> = ({ apiRequest, initialForm, setIsEdit }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initialForm);
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
                { label: "View" },
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
        },
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData: any) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validateRow = (row: Partial<TableRow>, index: number) => {
        const itemErrors: Partial<Record<keyof TableRow, string>> = {};
        if (!row.docUploadDate) itemErrors.docUploadDate = "Upload date is required";
        if (!row.documentRemarks) itemErrors.documentRemarks = "Document remarks is required";
        if (!row.agentCustomerId) itemErrors.agentCustomerId = "Agents is required";
        if (!row.agentCategory) itemErrors.agentCategory = "Category is required";
        if (!row.documentType) itemErrors.documentType = "Document type is required";

        if (!row.dccFileName) {
            if (!row.docFile) {
                itemErrors.docFile = "Document file is required";
            }
        }

        if (row?.docFile) {
            const fileType = (row?.docFile as File)?.type;
            const pdfOnly = ["application/pdf"];
            const allAllowed = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ];

            if (row.docType === ".pdf") {
                if (!pdfOnly.includes(fileType)) {
                    itemErrors.docFile = "Only PDF allowed";
                }
            } else {
                if (!allAllowed.includes(fileType)) {
                    itemErrors.docFile = "Only PDF, DOC, DOCX, XLS, XLSX allowed";
                }
            }
        }
        setErrors((prev) => ({ ...prev, [`row_${index}`]: itemErrors }));
        return Object.keys(itemErrors).length === 0;
    };

    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");

    const addRow = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            if (adding) return;
            setAdding(true);
            try {
                if (!formData?.vesselNo) {
                    toast.warn("Please add Document Details first before adding new row.", {
                        position: "top-right",
                        autoClose: 6000,
                    });
                    return;
                }
                const rows = formData?.documents || [];
                if (rows.length > 0) {
                    const lastIndex = rows.length - 1;
                    const lastRow: any = rows[lastIndex];
                    if (!validateRow(lastRow, lastIndex)) {
                        toast.error("Please fill mandatory field row errors before adding new row", {
                            position: "top-right",
                            autoClose: 6000,
                        });
                        return;
                    }
                }
                const newRow = {
                    agentCustomerId: auth?.usertype == "E" ? auth?.loginId : "",
                    agentCustomerName: auth?.usertype == "E" ? auth?.username : "",
                    agentCategory: "",
                    srlNo: null,
                    documentType: "",
                    docType: ".pdf",
                    docFile: null,
                    documentRemarks: "",
                    cancelFlag: "N",
                    docUploadDate: moment().format("DD/MM/YYYY"),
                    dccDownLink: "",
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
        },
        [auth, formData, adding]
    );
    const saveRow = useCallback(async () => {
        const headerErrors: Record<string, string> = {};
        if (!formData.vesselNo) headerErrors.vesselNo = "Vessel No is required";

        if (Object.keys(headerErrors).length > 0) {
            setErrors(headerErrors);
            toast.error("Please fill all mandatory fields", { position: "top-right", autoClose: 4000 });
            return;
        }

        let hasRowErrors = false;
        formData?.documents.forEach((row: any, index: any) => {
            if (!validateRow(row, index)) hasRowErrors = true;
        });

        if (hasRowErrors) {
            toast.error("Please fix all row errors before submitting", { position: "top-right", autoClose: 4000 });
            return;
        }

        setSubmitting(true);

        const formDataToSend = new FormData(); 
        const safeAppend = (key: string, value: any) => {
            if (value !== null && value !== undefined && value !== "undefined") {
                formDataToSend.append(key, value);
            }
        }; 
        safeAppend("vesselNo", formData.vesselNo);
        safeAppend("vesselName", formData.vesselName);
        safeAppend("vcn", formData.vcn);
        safeAppend(
            "berthedTime",
            formData?.berthedTime
                ? moment(formData.berthedTime, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss")
                : ""
        ); 
        formData?.documents.forEach((item: any, index: any) => {
            const prefix = `documents[${index}]`;
            safeAppend(`${prefix}.agentCategory`, item.agentCategory);
            safeAppend(`${prefix}.agentCustomerId`, item.agentCustomerId);
            safeAppend(`${prefix}.agentCustomerName`, item.agentCustomerName);
            safeAppend(`${prefix}.documentType`, item.documentType);
            safeAppend(`${prefix}.documentRemarks`, item.documentRemarks);
            safeAppend(`${prefix}.docUploadDate`, item.docUploadDate ? moment(item.docUploadDate, "YYYY-MM-DD").format("DD-MM-YYYY") : "");
            safeAppend(`${prefix}.cancelFlag`, item.cancelFlag || "N");

            if (item?.srlNo) {
                safeAppend(`${prefix}.srlNo`, item.srlNo);
            } 
            if (item.docFile instanceof File) {
                formDataToSend.append(`${prefix}.file`, item.docFile);
            }
        });

        try {
            const respos = await apiRequest({
                url: `/doc/save?userId=${auth?.userId}`,
                method: "POST",
                data: formDataToSend,
                params: {},
                headers: {
                    "Content-Type": undefined
                },
            });

            if (respos?.success?.vesselNo) {
                const response = await apiRequest({
                    url: `/doc/get-doc?vesselsNo=${formData?.vesselNo}&agentCode=`,
                    method: "GET",
                });
                const detail = response?.success?.documents || [];
                setFormData((pre: any) => ({ ...pre, documents: detail }));
                toast.success("Document updated successfully");
            }
        } catch (rr) {
            console.error("Upload Error:", rr);
            toast.error("Upload failed");
        } finally {
            setSubmitting(false);
        }
    }, [formData, auth, validateRow, apiRequest]);

    // const saveRow = useCallback(async () => {
    //     const headerErrors: Record<string, string> = {};
    //     if (!formData.vesselNo) headerErrors.vesselNo = "Vessel No is required";
    //     if (Object.keys(headerErrors).length > 0) {
    //         setErrors(headerErrors);
    //         toast.error("Please fill all mandatory fields", { position: "top-right", autoClose: 4000 });
    //         return;
    //     }

    //     let hasRowErrors = false;
    //     formData?.documents.forEach((row: any, index: any) => {
    //         if (!validateRow(row, index)) hasRowErrors = true;
    //     });
    //     if (hasRowErrors) {
    //         toast.error("Please fix all row errors before submitting", { position: "top-right", autoClose: 4000 });
    //         return;
    //     }

    //     setSubmitting(true);
    //     const safeAppend = (formDataObj: FormData, key: string, value: any) => {
    //         if (value !== null && value !== undefined && value !== "undefined") {
    //             formDataObj.append(key, value);
    //         }
    //     };

    //     const formDataToSend = new FormData();
    //     safeAppend(formDataToSend, "vesselNo", formData.vesselNo);
    //     safeAppend(formDataToSend, "vesselName", formData.vesselName);
    //     safeAppend(formDataToSend, "vcn", formData.vcn);
    //     safeAppend(
    //         formDataToSend,
    //         "berthedTime",
    //         formData?.berthedTime
    //             ? moment(formData.berthedTime, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss")
    //             : ""
    //     );

    //     formData?.documents.forEach((item: any, index: any) => {
    //         // if (!item?.srlNo) {
    //             const prefix = `documents[${index}]`; 
    //             safeAppend(formDataToSend, `${prefix}.agentCategory`, item.agentCategory);
    //             safeAppend(formDataToSend, `${prefix}.agentCustomerId`, item.agentCustomerId);
    //             safeAppend(formDataToSend, `${prefix}.agentCustomerName`, item.agentCustomerName);
    //             safeAppend(formDataToSend, `${prefix}.documentType`, item.documentType);
    //             safeAppend(formDataToSend, `${prefix}.documentRemarks`, item.documentRemarks);
    //             safeAppend(formDataToSend, `${prefix}.docUploadDate`, item.docUploadDate ? moment(item.docUploadDate, "YYYY-MM-DD").format("DD-MM-YYYY") : "");
    //             safeAppend(formDataToSend, `${prefix}.cancelFlag`, item.cancelFlag || "N");
    //             if (item?.srlNo) {
    //                 safeAppend(formDataToSend, `${prefix}.srlNo`, item.srlNo || null);
    //             }
    //             if (item.docFile instanceof File) {
    //                 formDataToSend.append(`${prefix}.file`, item.docFile);
    //             }
    //         // } 
    //     });

    //     try {
    //         const respos = await apiRequest({
    //             url: `/doc/save?userId=${auth?.userId}`,
    //             method: "POST",
    //             data: formDataToSend,
    //             params: {},
    //             headers: { "Content-Type": "multipart/form-data" },
    //         });

    //         if (respos?.success?.vesselNo) {
    //             const response = await apiRequest({
    //                 url: `/doc/get-doc?vesselsNo=${formData?.vesselNo}&agentCode=`,
    //                 method: "GET",
    //             });
    //             const detail = response?.success?.documents || [];
    //             setFormData((pre: any) => ({ ...pre, documents: detail }));
    //         }

    //         toast.success("Document updated successfully");
    //     } catch (rr) {
    //         toast.error("Upload failed");
    //     } finally {
    //         setSubmitting(false);
    //     }
    // }, [formData, auth]);

    const downloadReport = useCallback(
        async (item: any) => {
            try {
                const fileName = item?.dccFileName;
                if (!fileName) {
                    toast.warning("File not available");
                    return;
                }
                const response = await axios({
                    url: `/doc/download`,
                    method: "GET",
                    params: { fileName },
                    headers: { Authorization: `Bearer ${auth?.token}` },
                    responseType: "blob",
                });
                const blob =
                    response?.data instanceof Blob
                        ? response.data
                        : new Blob([response.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Download error:", error);
                toast.error("Failed to download file");
            }
        },
        [auth]
    );

    const canRow = useCallback(
        async (items: any) => {
            const headerErrors: Record<string, string> = {};
            if (!formData.vesselNo) headerErrors.vesselNo = "Vessel No is required";
            if (Object.keys(headerErrors).length > 0) {
                setErrors(headerErrors);
                toast.error("Please fill all mandatory fields", { position: "top-right", autoClose: 4000 });
                return;
            }
            setSubmitting(true);
            const formDataToSend = new FormData();
            formDataToSend.append("vesselNo", formData.vesselNo);
            formDataToSend.append("vesselName", formData.vesselName);
            formDataToSend.append("vcn", formData.vcn);
            formDataToSend.append("berthedTime", formData?.berthedTime ? moment(formData.berthedTime, "DD-MM-YYYY").format("DD-MM-YYYY HH:mm:ss") : "");
            // formDataToSend.append("agentCustomerId", formData.agentCustomerId);
            // formDataToSend.append("agentCustomerName", formData.agentCustomerName);
            // formDataToSend.append("zoneId", formData.zoneId);
            items.forEach((item: any, index: any) => {
                formDataToSend.append(`documents[${index}].documentType`, item.documentType);
                formDataToSend.append(`documents[${index}].documentRemarks`, item.documentRemarks);
                formDataToSend.append(`documents[${index}].agentCustomerId`, item.agentCustomerId);
                formDataToSend.append(`documents[${index}].agentCustomerName`, item.agentCustomerName);
                formDataToSend.append(`documents[${index}].agentCategory`, item.agentCategory);
                formDataToSend.append(`documents[${index}].docUploadDate`, item.docUploadDate ? moment(item.docUploadDate, "YYYY-MM-DD").format("DD-MM-YYYY") : "");
                formDataToSend.append(`documents[${index}].dccDownLink`, "");
                formDataToSend.append(`documents[${index}].cancelFlag`, "Y");
                if (item?.srlNo) formDataToSend.append(`documents[${index}].srlNo`, item.srlNo);
                if (item.docFile) formDataToSend.append(`documents[${index}].file`, item.docFile);
            });
            try {
                const respos = await apiRequest({
                    url: `/doc/save?userId=${auth?.userId}`,
                    method: "POST",
                    data: formDataToSend,
                    params: {},
                    headers: { "Content-Type": "multipart/form-data" },
                });
                console.log(respos, 'resposresposresposresposrespos')
                if (respos?.success?.vesselNo) {
                    const response = await apiRequest({
                        url: `/doc/get-doc?vesselsNo=${formData?.vesselNo}&agentCode=`,
                        method: "GET",
                    });
                    const detail = response?.success?.documents || [];
                    setFormData((pre: any) => ({ ...pre, documents: detail }));
                }
                toast.success("Row removed successfully");
            } catch (rr) {
                toast.error("Upload failed");
            } finally {
                setSubmitting(false);
            }
        },
        [formData, auth]
    );

    return (
        <div
            className="_rkContentBorder container-fluid py-3"
            style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}
        >
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>👉 Document Upload &gt;&gt; View</span>
            </div>

            <div className="row">
                <RowFormInputField label="Vessel No" name="vesselNo" isDefault={true} inputValue={formData.vesselNo} error={errors.vesselNo} onChange={handleChange} />
                <RowFormInputField label="Vessel Name" name="vesselName" isDefault={true} inputValue={formData.vesselName} error={errors.vesselName} onChange={handleChange} />
                <RowFormInputField label="VCN" name="vcn" isDefault={true} inputValue={formData.vcn} error={errors.vcn} onChange={handleChange} />
                <RowFormInputField label="Berthed Time" name="berthedTime" isDefault={true} inputValue={formData.berthedTime} error={errors.berthedTime} onChange={handleChange} />
            </div>

            <div className="text-white px-3 mb-3 mt-2 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>➤ Document Details</span>
            </div>

            <div className="row">
                <div className="col-12">
                    <div style={{ overflowX: "auto" }}>
                        <table className="custom-table text-white">
                            <thead style={{ backgroundColor: "#023e8a" }}>
                                <tr>
                                    <th style={{ minWidth: "5px" }}>#</th>
                                    <th style={{ minWidth: "230px" }}>Agent Name</th>
                                    <th style={{ minWidth: "10px" }}>Agent Category<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "140px" }}>Document Type<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "155px" }}>Document Remarks<span className="text-danger">*</span></th>
                                    <th>Upload Date<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "10px" }}>Doc Upload <span className="text-danger">*</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData?.documents?.map((row: any, index: any) => (
                                    <DpeTableRow
                                        key={index}
                                        row={row}
                                        index={index}
                                        errors={errors}
                                        setFormData={setFormData}
                                        formData={formData}
                                        handleRowChange={handleRowChange}
                                        setErrors={setErrors}
                                        downloadReport={downloadReport}
                                        canRow={canRow}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        disabled={submitting}
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
                    onClick={() => { setIsEdit(false) }}
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
                    {!submitting && <span className="btn-text">Update</span>}
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
                    authUser={auth}
                    screenType="edit"
                />
            )}
        </div>
    );
};

export default Edit;