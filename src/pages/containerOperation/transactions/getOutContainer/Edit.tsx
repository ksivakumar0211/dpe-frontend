import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useState } from "react";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { containerStatusOption, fromLocationGateOutOption, gateInContainerOption, gateInOption, icdFcsOption, securityOption, statusOption, transhipmentOption, voyageOption } from "@/pages/options";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
export interface Column {
    id: number;
    key: string;
    label: string;
}
interface SettingsModalProps {
    apiRequest?: any;
    initialForm?: any;
    setIsEdit?: any;
}

const Add: React.FC<SettingsModalProps> = ({
    setIsEdit,
    apiRequest,
    initialForm
}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Container Operation", path: "" },
                { label: "Transaction", path: "" },
                { label: "Gate Out - Container", path: "" },
                { label: "Edit" }
            ])
        );
    }, [dispatch]);
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData: any) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validationRules: ValidationRules = {
        vehicleNo: { required: true, minLength: 8, maxLength: 15 },
        fromLocId: { required: true, minLength: 2, maxLength: 20 },
        locationName: { required: true, minLength: 2, maxLength: 255 },
        agentNames: { required: true, minLength: 2, maxLength: 255 },
        portName: { required: true, minLength: 2, maxLength: 255 },
        linerName: { required: true, minLength: 2, maxLength: 255 },
        linerCode: { required: true, minLength: 2, maxLength: 15 },
        containerNo: { required: true, minLength: 11, maxLength: 12 },
        quantity: { required: true, gt: true, minLength: 1, maxLength: 15 },
        eir: { required: true, minLength: 2, maxLength: 20 },
        chitNo: { required: true, minLength: 2, maxLength: 20 },
        gateInThrough: { required: true, minLength: 1, maxLength: 20 }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);

        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 5000 });
            return;
        }
        setSubmitting(true)
        const payload = {
            chitNo: formData?.chitNo,
            vehicleNo: formData?.vehicleNo,
            fromLocId: formData?.fromLocId,
            toLocId: formData?.locationCode,
            impExpTrns: formData?.impExpTrns,
            beSbNo: formData?.beSbNo,
            chAgentCode: formData?.chAgentCode,
            vesselNo: formData?.vesselNo,
            vesselName: formData?.vesselName,
            voyageNo: formData?.voyageNumber,
            shipperName: formData?.shipperName,
            localOrigin: formData?.localOrigin,
            portOfDestination: formData?.portCode,
            weightmentFlag: formData?.weightmentFlag,
            securityWall: formData?.securityWall,
            gateInThrough: formData?.gateInThrough,
            containerNo: formData?.containerNo,
            containerStatus: formData?.containerStatus,
            cargoName: formData?.cargoCode,
            packages: formData?.packages,
            quantity: formData?.quantity,
            linerCode: formData?.linerCode,
            linerName: formData?.linerName,
            eir: formData?.eir,
            icdCfsFcs: formData?.icdCfsFcs,
            hazardous: formData?.hazardous,
            customsExamination: formData?.customsExamination,
            shutOut: formData?.shutOut,
            foreignCoastalFlag: formData?.foreignCoastalFlag
        };
        try {
            const resp = await apiRequest({ url: "/api/gateOutUpdate", method: "POST", data: payload })
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });

        } catch (err: any) {
            let apiError = "Something went wrong! Please try again.";
            if (!err.success && err.errors) {
                setErrors(err.errors);
            }
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        } finally {
            setSubmitting(false)
        }
    };

    const handleSelectChange = (selectedOption: any, name: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: selectedOption?.value || "" }));
        setErrors({})
    };
    const [modal, setModal] = useState<boolean>(false);
    const [config, setConfig] = useState<any>({});




    const onChangeSelect = useCallback(async (field: any, query?: any) => {
        setModal(true)
        setErrors({})
        const cfg = searchConfig[field];
        cfg.search = query ? query : ""
        setConfig(cfg)
    }, [])

    const defaultValue: boolean = true
    return (

        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Gate Out - Container &gt;&gt; Edit
                </span>
                <a
                    href="#"
                    style={{ fontSize: "11px" }}
                    className="text-white"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsEdit(false)
                    }}
                >
                    Back to Search Page
                </a>
            </div>

            <form onSubmit={handleFormSubmit}>
                <div className="row">
                     <RowFormInputField isDefault={true} label="Container No" max={12} type="stupr" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} required onChange={handleChange} />
                  
                    <RowFormInputField label="Chit No" isDefault={true} name="chitNo" inputValue={formData.chitNo} error={errors.chitNo} required onChange={handleChange} />
                    <RowFormInputField label="Out Time" name="txtInTime" inputValue={formData.txtInTime} error={errors.txtInTime} required onChange={handleChange} isDefault={true} />
                    <RowFormInputField label="Vehicle No" max={15} name="vehicleNo" inputValue={formData.vehicleNo} error={errors.vehicleNo} required onChange={handleChange} />

                    <RowFormSelectField name="fromLocId" label="From Location" options={fromLocationGateOutOption} value={formData.fromLocId} error={errors.fromLocId} onChange={handleSelectChange} isLoading={false} formData={formData} />


                    <RowFormCheckField label="To Location" isDefault={true} name="locationName" inputValue={formData.locationName} error={errors.locationName} required onChange={handleChange} click={() => onChangeSelect("location", formData.locationName)} />
                    <RowFormInputField label="BE / SB No" max={20} name="beSbNo" inputValue={formData.beSbNo} error={errors.beSbNo} onChange={handleChange} />
                    <RowFormCheckField defaultVal={defaultValue} label="CH Agent Name" isDefault={true} name="agentNames" inputValue={formData.agentNames} error={errors.agentNames} required onChange={handleChange} click={() => onChangeSelect("agent", formData.agentNames)} />

                    <RowFormCheckField label="Shipper" isDefault={true} name="shipperName" inputValue={formData.shipperName} error={errors.shipperName} onChange={handleChange} click={() => onChangeSelect("shipper", formData.shipperName)} />
                    <RowFormCheckField label="Vessel Name" isDefault={true} name="vesselName" inputValue={formData.vesselName} error={errors.vesselName} onChange={handleChange} click={() => onChangeSelect("vessel", formData.vesselNo)} />
                    <RowFormInputField label="Vessel No" isDefault={true} name="vesselNo" inputValue={formData.vesselNo} error={errors.vesselNo} onChange={handleChange} />
                    <RowFormInputField label="Voyage No" isDefault={true} name="voyageNumber" inputValue={formData.voyageNumber} error={errors.voyageNumber} onChange={handleChange} />

                    <RowFormInputField label="Local Origin" max={20} name="localOrigin" inputValue={formData.localOrigin} error={errors.localOrigin} onChange={handleChange} />
                    <RowFormCheckField label="Port of Destination" isDefault={true} name="portName" inputValue={formData.portName} error={errors.portName} required onChange={handleChange} click={() => onChangeSelect("port", formData.portName)} />
                    <RowFormSelectField isTrue={defaultValue} name="weightmentFlag" label="Weightment" options={statusOption} value={formData.weightmentFlag} error={errors.weightmentFlag} onChange={handleSelectChange} isLoading={false} formData={formData} />
                    <RowFormSelectField isTrue={defaultValue} name="securityWall" label="Security Wall" options={securityOption} value={formData.securityWall} error={errors.securityWall} onChange={handleSelectChange} isLoading={false} formData={formData} />
                    <RowFormSelectField  name="gateInThrough" label="Gate Out Through" options={gateInOption} value={formData.gateInThrough} error={errors.gateInThrough} onChange={handleSelectChange} isLoading={false} required formData={formData} />
                    <RowFormSelectField isTrue={defaultValue} name="impExpTrns" label="Import/Export" options={transhipmentOption} value={formData.impExpTrns} error={errors.impExpTrns} onChange={handleSelectChange} isLoading={false} formData={formData} />

                </div>

                {/* ===== CONTAINER SECTION ===== */}
                <div className="text-white px-3 mb-3 mt-2 fw-bold" style={{ backgroundColor: "#023e8a" }}>

                    <span style={{ fontSize: "12px" }}>
                        ➤ Container
                    </span>
                </div>

                <div className="row">
                    <RowFormSelectField name="containerStatus" label="Container Status" options={gateInContainerOption} value={formData.containerStatus} error={errors.containerStatus} onChange={handleSelectChange} isLoading={false} formData={formData} />
                    <RowFormCheckField isDefault={true} label="Cargo" name="cargoName" inputValue={formData.cargoName} error={errors.cargoName} onChange={handleChange} click={() => onChangeSelect("cargo", formData.cargoName)} />
                    <RowFormSelectField name="foreignCoastalFlag" label="Voyage" options={voyageOption} value={formData.foreignCoastalFlag} error={errors.foreignCoastalFlag} onChange={handleSelectChange} isLoading={false} formData={formData} />

                    <RowFormInputField label="Packages" max={10} name="packages" inputValue={formData.packages} error={errors.packages} onChange={handleChange} />
                    <RowFormInputField isDefault={defaultValue} label="Quantity (In MT)" type="number" max={15} name="quantity" inputValue={formData.quantity} error={errors.quantity} required onChange={handleChange} />
                    <RowFormCheckField defaultVal={defaultValue} label="Liner" isDefault={true} name="linerName" required inputValue={formData.linerName} error={errors.linerName} onChange={handleChange} click={() => onChangeSelect("liner", formData.linerName)} />
                    <RowFormInputField label="Liner Code" isDefault={true} name="linerCode" required inputValue={formData.linerCode} error={errors.linerCode} onChange={handleChange} />

                    <RowFormInputField isDefault={defaultValue} label="EIR" name="eir" type="stupr" max={20} inputValue={formData.eir} error={errors.eir} required onChange={handleChange} />

                    <RowFormSelectField isTrue={defaultValue} name="icdCfsFcs" label="ICD/CFS/FCS" options={icdFcsOption} value={formData.icdCfsFcs} error={errors.icdCfsFcs} onChange={handleSelectChange} isLoading={false} formData={formData} />
                    <RowFormSelectField isTrue={defaultValue} name="hazardous" label="Hazardous" options={statusOption} value={formData.hazardous} error={errors.hazardous} onChange={handleSelectChange} isLoading={false} formData={formData} />

                    <RowFormSelectField isTrue={defaultValue} name="customsExamination" label="Custom Examination" options={statusOption} value={formData.customsExamination} error={errors.customsExamination} onChange={handleSelectChange} isLoading={false} formData={formData} />

                    <RowFormSelectField isTrue={defaultValue} name="shutOut" label="Shut Out" options={statusOption} value={formData.shutOut} error={errors.shutOut} onChange={handleSelectChange} isLoading={false} formData={formData} />

                </div>
                <div className="d-flex gap-3 justify-content-end mt-5">
                    <button
                        type="button"
                        disabled={submitting}
                        className="btn btn-sm btn-secondary custom-form-control"
                        onClick={() => setIsEdit(false)}
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
                        {!submitting && <span className="btn-text">Update</span>}
                    </button>
                </div>

            </form>

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
