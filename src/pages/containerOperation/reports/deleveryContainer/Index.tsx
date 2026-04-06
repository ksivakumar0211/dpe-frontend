import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useEffect, useState } from "react";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { apiRequest } from "@/store/services/api";
import RowFormCheckboxField from "@/components/Form/RowFormCheckboxField";
import axios from "@/utils/axios";
import moment from "moment";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
export interface Column {
    id: number;
    key: string;
    label: string;
}
const Index: React.FC = () => {
    const dispatch = useDispatch();

    const [containerList, setContainerList] = useState([]);
    const getContainer = async () => {
        try {
            const url = `/report/get-out/container-pr`;
            const resp = await apiRequest({ url, method: "GET" });
            if (resp?.success && Array.isArray(resp.success) && resp.success.length > 0) {
                const formattedData = resp.success.map((item: any) => ({
                    label: item.containerNo,
                    value: item.containerNo,
                    ...item,
                    gateoutTime:item?.dpeOutTime
                }));

                setContainerList(formattedData);
            } else {
                setContainerList([]);
            }
        } catch (error) {
            setContainerList([]);
        }
    };
    useEffect(() => {
        getContainer()
    }, []);
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Container Operation", path: "" },
                { label: "Reports", path: "" },
                { label: "Delivery of Container", path: "" },
            ])
        );
    }, [dispatch]);
    const initial = {
        gateoutTime: "",
        containerNo: "",
        fileType: "PDF",
    }
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleDateChange = (name: any, date: any) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: date,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validationRules: ValidationRules = { 
        containerNo: { required: true, minLength: 1, maxLength: 20 }
    };
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);

        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 5000 });
            return;
        }
        setSubmitting(true)
        try {
            const apiPath = `/report/jasper/PDF/DPE_Container_Out_PDF.jrxml`;
            const payload = {
                gateoutTime: formData?.gateoutTime,
                containerNo: formData?.containerNo
            }; const response = await axios({
                url: apiPath,
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${auth?.token}` },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fileName = `DPE_Container_Out_PDF${moment().format("DDMMYYYYmmss")}.pdf`;
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            toast.error("Failed to generate report. Please try again.", { position: "top-right", autoClose: 5000 });
            console.error("Download error:", error);
        } finally {
            setSubmitting(false)
        }
    };

    const handleSelectChange = (selectedOption: any, name: string) => { 
        setFormData((prev) => ({ ...prev, [name]: selectedOption?.value || "", ...selectedOption }));
        setErrors({})
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;

        setFormData((prev) => {
            if (type === "checkbox") {
                return {
                    ...prev,
                    [name]: checked,
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };
    const refreshPage = () => {
        setFormData(initial);
        setErrors({});
    };

    return (

        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Delivery of Container
                </span>
            </div>

            <form onSubmit={handleFormSubmit}>
                <div className="row">
                    <RowFormSelectField required row="col-md-4" col1="col-md-3" col2="col-md-7" name="containerNo" label="Container No" options={containerList} value={formData.containerNo} error={errors.containerNo} onChange={handleSelectChange} isLoading={false} formData={formData} />
                    <RowFormInputField row="col-md-6" col1="col-md-2" col2="col-md-6" label="Gate Out Time" name="gateoutTime" isDefault={true} inputValue={formData.gateoutTime} error={errors.gateoutTime} onChange={(date: any) => handleDateChange("gateoutTime", date)} />
                   
                    <RowFormCheckboxField
                        row="col-md-4" col1="col-md-3" col2="col-md-9"
                        label="Output File"
                        name="fileType"
                        value={formData.fileType}
                        type="radio"
                        options={[
                            { label: "PDF", value: "PDF" },
                        ]}
                        onChange={handleChange}
                    />
                </div>
                <div className="d-flex gap-3 justify-content-end">
                    <button
                        type="button"
                        disabled={submitting}
                        className="btn btn-sm btn-secondary custom-form-control"
                        onClick={refreshPage}
                    >
                        Refresh
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
                        {!submitting && <span className="btn-text">Generate</span>}
                    </button>
                </div>

            </form>
            {submitting && <LoadingFetchLoader />}
        </div>
    );
};

export default Index;
