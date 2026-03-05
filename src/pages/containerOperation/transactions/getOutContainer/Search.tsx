import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Paginator from "@/components/Paginator";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import RowFormInputField from "@/components/Form/RowFormInputField";
import { apiRequest } from "@/store/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import moment from 'moment'
import Edit from "./Edit";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { fetchCommonData, searchConfig } from "@/utils/commonHelper";
import { useNavigate } from "react-router-dom";
export interface Column {
    key: string;
    label: string;
}
export interface GateInRecord {
    id: number;
    name: string;
    code: string;
    vehicleNo: string;
    txtInTime: string;
    chAgentCode: string;
    eir: string;
    vesselNo: string;
    loadingStatus: string;
    containerStatus: string;
    foreignCoastalFlag: string;
}


const Search: React.FC = () => {
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
    const initial = {
        chitNo: "",
        containerNo: "",
        vehicleNo: "",
        gateOutDate: "",
        agent: "",
        eir: "",
        vesselNo: "",
        loadingStatus: "",
        containerSize: "",
        voyage: ""
    }
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };


    const [pageSize, setPageSize] = useState(15);
    const [page, setPage] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoding, setSearchLoading] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const fetchRecords = async (payload = formData, page = 0, pageSize = 15) => {
        try {
            setLoading(true)
            const url = `/editGateOut?page=${page}&size=${pageSize}`
            const response = await apiRequest({ url: url, method: "POST", data: payload });
            if (response.success.content.length > 0) {
                setPageSize(pageSize)
                setDataItems(response.success.content)
                setTotalCount(response.success.totalElements)
                setTotalPages(response.success.totalPages)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearchLoading(false)
            setLoading(false)
        }
    };


    const [formEditData, setFormEditData] = useState({});
    const [isEditLoading, setIsEditLoading] = useState(false);

    const handleEdit = useCallback(async (row: any) => {
        try {
            setIsEditLoading(true)
            const url = `/editGateOutPage?chitNo=${row.chit_no}`;
            const response = await apiRequest({ url, method: "GET" });
            if (response?.success) {
                const item = response?.success
                setFormEditData({
                    chitNo: item?.chit_no,
                    vehicleNo: item?.vehicle_no,
                    fromLocId: item?.from_loc_id,
                    locationCode: "",
                    locationName: "",
                    txtInTime: moment(item?.gateOutDateTime).format('DD/MM/YYYY h:mm'),
                    impExpTrns: item?.imp_exp_trns,
                    beSbNo: item?.boe_no,
                    vesselNo: row?.vessel_no,
                    agentNames: response?.agentName,
                    chAgentCode: item?.party_cd,
                    localOrigin: item?.local_origin,
                    vesselName: item?.vessel_no,
                    voyageNo: item?.voyageNumber,
                    shipperName: item?.shipper,
                    portCode: item?.trn_shp_port,
                    portName: response?.portName,
                    cargoName: response?.cargoName,
                    cargoCode: item?.cargo_code,
                    weightmentFlag: item?.weighment_flag,
                    securityWall: item?.security_wall,
                    gateInThrough: item?.gate_out_through,
                    containerNo: item?.container_no,
                    containerStatus: `${item?.container_size},${item?.loading_status}`,
                    packages: item?.bags,
                    quantity: item?.quantity,
                    linerCode: item?.sical_line_code,
                    linerName: item?.sical_line_name,
                    eir: item?.eir,
                    icdCfsFcs: item?.icd_cfs_fsc_none,
                    hazardous: item?.hazardous,
                    customsExamination: item?.customs_examinations,
                    shutOut: item?.shut_out,
                    foreignCoastalFlag: row?.foreign_coastal_flag
                });
                let api_url = searchConfig['vessel'].url;
                const pagination = '?size=10&page=0'
                let query = `&q=${item?.vessel_no}`
                await fetchCommonData({ t_field_a: 'vesselNo', field_a: 'vesselNo', t_field_b: 'vesselName', field_b: 'vesselName', t_field_c: 'voyageNumber', field_c: 'voyageNumber', url: `${api_url}${pagination}${query}`, setForm: setFormEditData, });
                setIsEdit(true)
            } else {
                toast.error("Failed to load edit data", { position: "top-right", autoClose: 6000 });
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong while fetching edit data", { position: "top-right", autoClose: 5000, });
        } finally {
            setIsEditLoading(false)
        }
    }, []);

    const hasAtLeastOneValue = (data: Record<string, any>) => {
        return Object.values(data).some(
            (value) => value !== "" && value !== null && value !== undefined
        );
    };

    const handleSearchForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            if (!hasAtLeastOneValue(formData)) {
                toast.warn("Please enter at least one search field", { position: "top-right", autoClose: 6000, });
                return;
            }
            setSearchLoading(true)
            fetchRecords(formData, 0, pageSize);
        } catch (err: any) {
            let apiError = "Something went wrong. Please try again.";
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        }
    }, [formData, pageSize]);

    const resetform = useCallback(async (e: React.FormEvent) => {
        if (hasAtLeastOneValue(formData)) {
            fetchRecords(initial, 0, pageSize);
        }
    }, [initial, pageSize])

    useEffect(() => {
        fetchRecords();
    }, []);
    const onPageChange = useCallback((pageNumber: number) => {
        const zeroBasedPage = pageNumber - 1;
        setPage(zeroBasedPage);
        fetchRecords(formData, zeroBasedPage, pageSize);
    }, [formData, pageSize]);

    const columns: Column[] = [
        { key: "chit_no", label: "Chit No" },
        { key: "container_no", label: "Container No" },
        { key: "vehicle_no", label: "Vehicle No" },
        { key: "gateOutDateTime", label: "Time (DD/MM/YYYY HH:MI)" },
        { key: "party_cd", label: "Agent" },
        { key: "eir", label: "EIR" },
        { key: "vessel_no", label: "Vessel No" },
        { key: "loading_status", label: "Loading Status" },
        { key: "container_size", label: "Container Size" },
        { key: "foreign_coastal_flag", label: "Voyage" }
    ]

    const navigate = useNavigate();
    return (isEdit ? (<Edit initialForm={formEditData} setIsEdit={setIsEdit} apiRequest={apiRequest} />) :
        (<div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    👉 Gate Out - Container &gt;&gt; Search
                </span>

                <a
                    href="#"
                    style={{ fontSize: "11px" }}
                    className="text-white"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/addGateOut");
                    }}
                >
                    Click here to add new Container Gate Out
                </a>
            </div>

            <form onSubmit={handleSearchForm}>
                <div className="row">
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Chit No" name="chitNo" inputValue={formData.chitNo} error={errors.chitNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Container No" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Vehicle No" name="vehicleNo" inputValue={formData.vehicleNo} error={errors.vehicleNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" placeholder="DD-MM-YYYY" label="Time" name="gateOutDate" inputValue={formData.gateOutDate} error={errors.gateOutDate} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Agent" name="agent" inputValue={formData.agent} error={errors.agent} onChange={handleChange} />


                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="EIR" name="eir" inputValue={formData.eir} error={errors.eir} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Vessel No" name="vesselNo" inputValue={formData.vesselNo} error={errors.vesselNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Loading Status" name="loadingStatus" inputValue={formData.loadingStatus} error={errors.loadingStatus} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Voyage" name="voyage" inputValue={formData.voyage} error={errors.voyage} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Container Size" name="containerSize" inputValue={formData.containerSize} error={errors.containerSize} onChange={handleChange} />


                </div>
                <div className="d-flex gap-3 justify-content-start mt-2">
                    <button type="button" onClick={resetform} disabled={loading} className="btn btn-secondary btn-sm custom-form-control ">
                        Clear
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${searchLoding ? "loading" : ""}`}
                        disabled={searchLoding}
                        style={{
                            minWidth: "100px"
                        }}
                    >
                        {searchLoding && <span className="spinner-center"></span>}
                        {!searchLoding && <span className="btn-text">Search</span>}
                    </button>
                </div>
            </form>

            <div className="text-white px-3   mb-1 mt-3 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>
                    ➤ Container Gate Out
                </span>
            </div>
            <div className="table-wrapper">
                <table className="custom-table">
                    <thead className="text-white">
                        <tr>
                            {columns?.map((column) => (
                                <th>{column.label}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="table-loader">
                                    <LoadingSpinner size={110} />
                                </td>
                            </tr>
                        ) : dataItems.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            dataItems.map((row: any, rowIndex: number) => (
                                <tr key={row.chit_no ?? rowIndex}>
                                    <td><a href="#" onClick={(e) => { e.preventDefault(); handleEdit(row); }}>{row['chit_no']}</a></td>
                                    <td>{row.container_no}</td>
                                    <td>{row.vehicle_no}</td>
                                    <td>{row.gateOutDateTime
                                        ? moment.utc(row.gateOutDateTime).local().format('DD/MM/YYYY HH:mm')
                                        : '-'}
                                    </td>
                                    <td>{row.party_cd}</td>
                                    <td>{row.eir}</td>
                                    <td>{row.vessel_no}</td>
                                    <td>{row.loading_status}</td>
                                    <td>{row.container_size}</td>
                                    <td>{row.foreign_coastal_flag === "F" ? "Foreign" : "Coastal"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>

                <div className="table-footer">
                    <span className="record-info">
                        {totalCount > 0 && (
                            <>
                                Showing {page + 1}/{totalPages} of {totalCount}
                            </>
                        )}
                    </span>

                    {totalCount > pageSize && (
                        <Paginator
                            currentPage={page}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>

                {
                    isEditLoading && <LoadingFetchLoader />
                }
            </div>

        </div>)

    );
};

export default Search;
