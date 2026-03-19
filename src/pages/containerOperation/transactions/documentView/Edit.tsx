import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import CommonSelectModal from "@/components/CommonSelectModal";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import DpeTableRow from "./DpeTableRow";
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
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Agent", path: "" },
                { label: "Application", path: "" },
                { label: "Document Upload", path: "" },
                { label: "View" }
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
        setFormData((prevData: any) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };

    return (
        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Document Upload &gt;&gt; View
                </span>
            </div>
            <div className="row">
                <RowFormInputField label="Vessel No" name="vesselNo" isDefault={true} inputValue={formData.vesselNo} error={errors.vesselNo} onChange={handleChange} />

                {/* <RowFormCheckField label="Vessel No" name="vesselNo" inputValue={formData.vesselNo} error={errors.vesselNo} required onChange={handleChange} click={() => onChangeSelect("vesselss", formData.vesselNo)} /> */}
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
                                    <th style={{ minWidth: "140px" }}>Document Type</th>
                                    <th style={{ minWidth: "155px" }}>Document Remarks<span className="text-danger">*</span></th>
                                    <th>Upload Date<span className="text-danger">*</span></th>
                                    <th style={{ minWidth: "200px" }}>Doc Uploaded <span className="text-danger">*</span></th>
                                    <th>Download Link</th>
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
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
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

export default Edit;
