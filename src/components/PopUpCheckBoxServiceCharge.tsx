import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DataTable } from "primereact/datatable";
import { Column as PrimeColumn } from "primereact/column";
import { Paginator } from "primereact/paginator";
import "./PopUpCheckBox.css";
import { RadioButton } from "primereact/radiobutton";
import { toast } from "react-toastify";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import moment from "moment";
import { calculateDays, fetchContainerServiceData } from "@/utils/commonHelper";
import LoadingFetchLoader from "./LoadingFetchLoader";

export interface Column {
    key: string;
    label: string;
}

interface SettingsModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    itemsPerPage?: number;
    apiRequest?: any;
    config?: any;
    setFormData?: any;
    setIsEdit?: any;
    setServices?: any;
}


const PopUpCheckBoxServiceCharge: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    itemsPerPage = 12,
    apiRequest,
    config,
    setFormData,
    setIsEdit,
    setServices
}) => {
    const [loading, setLoading] = useState(false);
     const [isLoadingSet, setIsLoadingSet] = useState(false);
    const [first, setFirst] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [rowItems, setRowItems] = useState<any>([]);
    const [queryData, setQueryData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, any>>({});
    /* ---------------- FILTER COLUMNS ---------------- */
    const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
    const validationRules: ValidationRules = {
        q: { required: true, minLength: 2, maxLength: 50 }
    };

    const fetchChitNoData = async (params: any, query = "", page = 0, size = itemsPerPage) => {
        try {
            setLoading(true)
            const exc = params?.exec ? params?.exec : '';
            const url = `${params?.url}?page=${page}&size=${size}${exc}${query}`;
            const response = await apiRequest({ url: url, method: "GET" });
            if (response?.content?.length > 0) {
                setRowItems(response.content)
                setFirst(page)
                setTotalElements(response.totalElements)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        const query = `&q=${config?.search}`
        fetchChitNoData(config, query, 0, itemsPerPage);
        setQueryData((prev) => ({
            ...prev,
            q: config?.search
        }));
    }, [config]);

    const searchItem = useCallback(async () => {
        const { isValid, errors } = validationRequest(queryData, validationRules);
        setErrors(errors);
        if (!isValid) {
            toast.error("Search key is missing. Please check and try again.", {
                position: "top-right",
                autoClose: 4000,
            });
            return;
        }
        setFirst(0);
        const query = `&q=${queryData.q}`
        fetchChitNoData(config, query, 0, itemsPerPage);
    }, [config, queryData]);


    const resetItem = useCallback(async () => {
        setErrors({})
        setQueryData({});
        setFirst(0);
        const query = `&q=`
        fetchChitNoData(config, query, 0, itemsPerPage);
    }, [config]);

    const onPageChange = useCallback(
        async (e: any) => {
            setFirst(e.first);
            setRowsPerPage(e.rows);
            const query = `&q=`
            fetchChitNoData(config, query, e.page, e.rows);
        }, [config]);
    const [selectedKey, setSelectedKey] = useState<string | null>("");

    useEffect(() => {
        if (config?.search) {
            setSelectedKey(config.search);
        }
    }, [config]);

    const onchangeRequest = useCallback(async (config: any, rowData: Record<string, any>) => {
        
        try {
            setIsLoadingSet(true)
            if (config?.field !== "containerNo") {
                const value = rowData?.[config?.columns?.[0]?.field || ""];

                setFormData((prev: any) => ({
                    ...prev,
                    ...rowData,
                    [config?.field || ""]: value,
                    ...(config?.columns?.length > 1 &&
                        config?.columns?.[1]?.field && {
                        [config?.dispField || ""]: rowData?.[config.columns[1].field],
                    }),
                }));

                onClose?.();
                return;
            }

            setIsEdit?.(true);

            const containerNo = rowData?.[config?.columns?.[0]?.field || ""];
            const containerServiceData = await fetchContainerServiceData(containerNo);
            const { containerResponse, serviceOptions, serviceDetails, responseDetail } = containerServiceData;
            setServices(serviceOptions);
            setFormData((prev: any) => ({
                ...prev,
                ...rowData,
                serviceDetails: serviceDetails,
                adChitNo: containerResponse?.chitNo,
                adTime: containerResponse?.gateInDateTime
                    ? moment(containerResponse.gateInDateTime).format("YYYY-MM-DD")
                    : "",
                containerNo: containerResponse?.containerNo,
                chAgentCode: containerResponse?.agentCode,
                chAgentName: containerResponse?.agentName,
                shipBillNo: containerResponse?.boeNo,
                containerSize: containerResponse?.containerSize,
                loadingStatus: containerResponse?.loadingStatus,
                foreignCoastalFlag: containerResponse?.foreignCoastalFlag,
                delDateTentive: responseDetail?.success?.tenDeliveryDate
                    ? moment(responseDetail.success.tenDeliveryDate, "DD/MM/YYYY").format("YYYY-MM-DD")
                    : "",
                delDateActual: ""
            }));

            onClose?.();

        } catch (error) {
            console.error("onchangeRequest error:", error);
        }finally{
             setIsLoadingSet(false)
        }
    }, []);
    return (
        <>
            {isOpen && <div className="modal-overlay" onClick={onClose} />}

            <motion.div
                initial={{ x: 1000 }}
                animate={{ x: isOpen ? 0 : 1000 }}
                transition={{ duration: 0.3 }}
                className="modal-right"
            >
                <div className="modal-content">
                    <div
                        className="p-3 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#023e8a" }}
                    >
                        <h5 className="mb-0 text-white">{config?.title}</h5>
                        <button className="btn btn-outline-light btn-sm" onClick={onClose}>
                            Back
                        </button>
                    </div>
                    <div className="input-group mb-3 mt-2">
                        <input
                            type="text"
                            name="q"
                            value={queryData?.q || ""}
                            onChange={(e) => {
                                setQueryData((prev) => ({
                                    ...prev,
                                    q: e.target.value,
                                }));
                                setErrors({});
                            }}
                            className={`form-control ${errors?.q ? "is-invalid" : ""}`}
                            style={{ borderRadius: "0px" }}
                            placeholder="Type to search..."
                        />


                        <div className="input-group-append pl-2" onClick={!loading ? searchItem : undefined}>
                            <span className="input-group-text" style={{ borderRadius: "0px", cursor: loading ? "not-allowed" : "pointer" }}>
                                {loading ? "Searching..." : "Search 🔍"}
                            </span>
                        </div>

                        <div className="input-group-append" onClick={!loading ? resetItem : undefined}>
                            <span className="input-group-text" style={{ borderRadius: "0px", cursor: loading ? "not-allowed" : "pointer" }}>
                                Reset 🔄
                            </span>
                        </div>

                    </div>

                    <DataTable
                        value={rowItems}
                        emptyMessage={
                            loading ? (
                                <div className="tablee-loader">
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
                                </div>
                            ) : (
                                "No records found"
                            )
                        }
                        size="small"
                        stripedRows
                        loading={loading}
                        showGridlines
                        className="p-datatable-sm shadow-sm"
                    >
                        <PrimeColumn
                            header="Select"
                            style={{ width: "3rem" }}
                            headerStyle={{ backgroundColor: "#023e8a", color: "#fff", fontWeight: "bold" }}
                            body={(rowData) => {
                                let rowKey = rowData[config?.columns?.[0].field];
                                if (config?.columns.length && config?.columns?.[1]?.field) {
                                    rowKey = rowData[config?.columns?.[1].field];
                                }
                                return (
                                    <RadioButton
                                        inputId={rowKey}
                                        checked={selectedKey === rowKey}
                                        onChange={(e: any) => { e.preventDefault(); onchangeRequest(config, rowData) }}
                                    />
                                );
                            }}
                        />
                        {config?.columns?.map((col: any) => (
                            <PrimeColumn
                                key={col.field}
                                field={col.field}
                                header={col.header}
                                headerStyle={{ backgroundColor: "#023e8a", color: "#fff", fontWeight: "bold" }}
                            />
                        ))}
                    </DataTable>
                    {
                        rowItems && <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                Total Records: {totalElements}
                            </div>
                            {rowItems.length > 0 &&
                                <Paginator
                                    first={first}
                                    rows={rowsPerPage}
                                    totalRecords={totalElements}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    onPageChange={onPageChange}
                                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                />}
                        </div>
                    }
                </div>
                {
                    isLoadingSet && <LoadingFetchLoader />
                }
                <footer className="footer d-flex flex-column flex-md-row align-items-end justify-content-between px-4 py-3 border-top small">
                    <p className="text-muted mb-1 mb-md-0">
                        © 2026 DCG Data-Core Systems (India) Private Limited. All rights reserved.
                    </p>
                </footer>
            </motion.div>
        </>
    );
};

export default PopUpCheckBoxServiceCharge;
