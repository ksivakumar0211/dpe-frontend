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
import { calculateDays } from "@/utils/commonHelper";

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
}

const PopUpCheckBox: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    itemsPerPage = 12,
    apiRequest,
    config,
    setFormData,
    setIsEdit
}) => {
    const [loading, setLoading] = useState(false);
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
    interface Detail {
        cfsNo?: string;
        cfsDate?: string;
        service?: string;
        from?: string;
        to?: string;
        rate?: number;
        amount?: number;
        cgst?: number;
        sgst?: number;
        igst?: number;
        total?: number;
        paymentNo?: string;
        remarks?: string;
    }

    const onchangeRequest = useCallback(
        async (config: any, rowData: Record<string, any>) => {
            try {
                if (config?.field === "containerNo") {
                    setIsEdit?.(true);
                    const containerNo = rowData?.[config?.columns?.[0]?.field || ""];
                    const response = await apiRequest({
                        url: `/api/containerInPortDetails?containerNo=${containerNo}`,
                        method: "GET",
                    });
                    const responseDetail = await apiRequest({
                        url: `/service/charge/search?chitNo=${response?.chitNo}&containerNo=${response?.containerNo}`,
                        method: "GET",
                    });

                    const detail: Detail[] = responseDetail?.success && responseDetail?.success?.serviceDetails?.length
                        ? responseDetail?.success?.serviceDetails.map((item: any) => {
                            const rate = Number(item.rate) || 0;
                            const days = calculateDays(moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD"), moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
                            const amount = rate * days;
                            const gstRate = 0.18;
                            const gstAmount = amount * gstRate;
                            return {
                                id: item?.id ? item?.id : "",
                                cfsNo: item?.cfsNo ? item?.cfsNo : "",
                                cfsDate: item.cfsDate ? moment(item.cfsDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                                service: item?.serviceTypeCd,
                                from: item.serviceFromDate ? moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                                to: item.serviceToDate ? moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                                rate: item?.rate ? item?.rate : 0,
                                amount: item?.amount ? item?.amount : 0,
                                sgst: item?.sgst ? item?.sgst : 0,
                                cgst: item?.cgst ? item?.cgst : 0,
                                igst: item?.igst ? item?.igst : 0,
                                gst: Number(gstAmount.toFixed(2)) || 0,
                                totalVal: item?.totalVal ? item?.totalVal : 0,
                                paymentNo: item?.paymentNo ? item?.paymentNo : "",
                                paymentDate: item.paymentDate ? item?.paymentDate : "",
                                remarks: item?.serviceRemarks ? item?.serviceRemarks : "",
                                cancelFlag: "N",
                            }
                        }
                        ) : [];
 
                    setFormData((prev: any) => ({
                        ...prev,
                        ...rowData,
                        serviceDetails: detail,
                        adChitNo: response?.chitNo,
                        adTime: response?.gateInDateTime ? moment(response.gateInDateTime).format("YYYY-MM-DD") : "",
                        containerNo: response?.containerNo,
                        chAgentCode: response?.agentCode,
                        chAgentName: response?.agentName,
                        shipBillNo: response?.boeNo,
                        containerSize: response?.containerSize,
                        loadingStatus: response?.loadingStatus,
                        foreignCoastalFlag: response?.foreignCoastalFlag,
                        delDateTentive: responseDetail?.success?.tenDeliveryDate ? moment(responseDetail?.success?.tenDeliveryDate,"DD/MM/YYYY").format("YYYY-MM-DD") : "",
                        delDateActual: "",
                    }));
                } else {
                    const value = rowData?.[config?.columns?.[0]?.field || ""];

                    setFormData((prev: any) => ({
                        ...prev,
                        ...rowData,
                        [config?.field || ""]: value,
                        ...(config?.columns?.length > 1 &&
                            config?.columns?.[1]?.field && {
                            [config.dispField || ""]:
                                rowData?.[config.columns[1].field],
                        }),
                    }));
                }

                onClose?.();
            } catch (error) {
                console.error("onchangeRequest error:", error);
            }
        },
        []
    );
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
                <footer className="footer d-flex flex-column flex-md-row align-items-end justify-content-between px-4 py-3 border-top small">
                    <p className="text-muted mb-1 mb-md-0">
                        © 2026 DCG Data-Core Systems (India) Private Limited. All rights reserved.
                    </p>
                </footer>
            </motion.div>
        </>
    );
};

export default PopUpCheckBox;
