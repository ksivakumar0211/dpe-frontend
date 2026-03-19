import React, { useCallback, useEffect, useState } from "react";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import CommonSelectModal from "@/components/CommonSelectModal";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
import { apiRequest } from "@/store/services/api";;
import Edit from "./Edit";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export interface Column {
    id: number;
    key: string;
    label: string;
}

const Search: React.FC = () => {
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
    const [config, setConfig] = useState<any>({});
    const [isEdit, setIsEdit] = useState(false);
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Agent", path: "" },
                { label: "Application", path: "" },
                { label: "Document Upload", path: "" },
                { label: "Edit" }
            ])
        );
    }, [dispatch]);

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


    console.log('formDataformData',formData)

    const navigate = useNavigate();
    return (isEdit && formData?.documents?.length > 0 ? (<Edit setIsEdit={setIsEdit} initialForm={formData} setInitialForm={setFormData} apiRequest={apiRequest} />) : (
        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Document Upload &gt;&gt; Search
                </span>
            </div>
            <div className="row">
                <RowFormCheckField label="Vessel No" isDefault={true} name="vesselNo" inputValue={formData.vesselNo} error={errors.vesselNo} required onChange={handleChange} click={() => onChangeSelect("vesselss", formData.vesselNo)} />
            </div> 
            <div className="row">
                <div className="col-12">

                </div>
            </div>

            {
                modal && <CommonSelectModal
                    isOpen={modal}
                    onClose={() => setModal(false)}
                    itemsPerPage={12}
                    apiRequest={apiRequest}
                    setFormData={setFormData}
                    config={config}
                    isEdit={true}
                    setIsEdit={setIsEdit}
                />
            }


        </div >

    ))
};

export default Search;
