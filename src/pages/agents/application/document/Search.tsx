import React, { useCallback, useEffect, useState } from "react";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
import { apiRequest } from "@/store/services/api";;
import Edit from "./Edit";
import { useNavigate } from "react-router-dom";

export interface Column {
    id: number;
    key: string;
    label: string;
}

const Search: React.FC = () => {
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
        details: []
    }

    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [modal, setModal] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
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



    const navigate = useNavigate();
    return (isEdit && formData.details.length > 0 ? (<Edit setIsEdit={setIsEdit} initialForm={formData} setInitialForm={setFormData} apiRequest={apiRequest} />) : (
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
                <RowFormCheckField label="Vessel No" isDefault={true} name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} required onChange={handleChange} click={() => onChangeSelect("container", formData.containerNo)} />
            </div>
            {/* <div className="text-white px-3 mb-3 mt-2 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>
                    ➤ Details
                </span>
            </div> */}
            <div className="row">
                <div className="col-12">
                    {/* <div style={{ overflowX: "auto" }}>
                        <table className="custom-table text-white">
                            <thead style={{ backgroundColor: "#023e8a" }}>
                                <tr>

                                    <th style={{ minWidth: "140px" }}>Action</th>
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
                                {(isEdit && formData?.details?.length === 0) && <tr>
                                    <td colSpan={12} style={{ color: "black", height: "40px" }} className="text-center">{isEdit && formData?.details?.length === 0 ? "Records not found" : ""} <a
                                        href="#"
                                        style={{ fontSize: "11px" }}
                                        onClick={(e) => { e.preventDefault(); navigate("/addDpeServiceCharge") }}
                                    >
                                        Click here to Add New
                                    </a></td>
                                </tr>}
                            </tbody>
                        </table>
                    </div> */}

                    {/* <button
                        type="button"
                        disabled
                        className="btn btn-primary btn-sm mt-2 mr-4"
                        style={{
                            borderRadius: "0px",
                            backgroundColor: "#023e8a",
                            color: "#fff"
                        }}
                    >
                        + Add Row
                    </button> */}


                </div>
            </div>

            {/* <div className="d-flex gap-3 justify-content-end">
                <button
                    type="submit"
                    className={`btn btn-warning btn-sm px-4 custom-form-control position-relative ${false ? "loading" : ""}`}
                    disabled={true}
                    style={{
                        minWidth: "100px"
                    }}
                >
                    {<span className="btn-text">Payment through POS</span>}
                </button>
                <button type="submit" disabled className="btn btn-sm  btn-dark custom-form-control ">
                    Print Payment
                </button>
            </div> */}

            {
                modal && <PopUpCheckBox
                    isOpen={modal}
                    onClose={() => setModal(false)}
                    itemsPerPage={12}
                    apiRequest={apiRequest}
                    setFormData={setFormData}
                    config={config}
                    setIsEdit={setIsEdit}
                />
            }


        </div >

    ))
};

export default Search;
