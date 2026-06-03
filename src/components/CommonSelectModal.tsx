import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "primereact/datatable";
import { Column as PrimeColumn } from "primereact/column";
import { toast } from "react-toastify";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { calculateDays } from "@/utils/commonHelper";
import moment from "moment";
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
  isEdit?: boolean;
  authUser?: any;
  screenType?: any;
}

const S = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(2, 20, 50, 0.45)",
    backdropFilter: "blur(2px)",
    zIndex: 1000,
    cursor: "pointer",
  },
  panel: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    height: "100%",
    width: "min(480px, 100vw)",
    background: "#ffffff",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "-16px 0 60px rgba(2,20,50,0.22)",
  },
  header: {
    background: "#021432",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
    letterSpacing: "0.01em",
  },
  backBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "0.5px solid rgba(255,255,255,0.28)",
    color: "#fff",
    fontSize: 12,
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  searchBar: {
    padding: "12px 14px 10px",
    display: "flex",
    gap: 7,
    borderBottom: "0.5px solid rgba(0,0,0,0.1)",
    flexShrink: 0,
  },
  input: (hasError: boolean) => ({
    flex: 1,
    fontFamily: "inherit",
    fontSize: 13,
    padding: "7px 11px",
    border: `0.5px solid ${hasError ? "#e24b4a" : "rgba(0,0,0,0.2)"}`,
    borderRadius: 6,
    background: "#f9f9f9",
    outline: "none",
    transition: "border-color 0.15s",
  }),
  actionBtn: (loading: boolean) => ({
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    padding: "7px 13px",
    borderRadius: 6,
    border: "0.5px solid rgba(0,0,0,0.2)",
    background: "#f4f4f4",
    color: "#444",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    whiteSpace: "nowrap" as const,
    transition: "background 0.15s, color 0.15s",
  }),
  tableWrap: {
    flex: 1,
    overflowY: "auto" as const,
  },
  tableHeader: {
    backgroundColor: "#021432",
    color: "#fff",
    fontWeight: 500,
    fontSize: 11.5,
    letterSpacing: "0.02em",
    padding: "8px 10px",
  },
  radioCell: (checked: boolean) => ({
    width: 15,
    height: 15,
    borderRadius: "50%",
    border: `1.5px solid ${checked ? "#021432" : "#bbb"}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 0.15s",
  }),
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#021432",
  },
  footerBar: {
    padding: "10px 14px",
    borderTop: "0.5px solid rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    fontSize: 12,
    color: "#666",
  },
  pageBtn: (active: boolean, disabled?: boolean) => ({
    width: 26,
    height: 26,
    border: `0.5px solid ${active ? "#021432" : "rgba(0,0,0,0.18)"}`,
    borderRadius: 5,
    background: active ? "#021432" : "#f4f4f4",
    color: active ? "#fff" : "#555",
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.35 : 1,
    fontFamily: "monospace",
    transition: "background 0.12s",
  }),
  copyright: {
    padding: "8px 18px",
    fontSize: 11,
    color: "#aaa",
    borderTop: "0.5px solid rgba(0,0,0,0.08)",
    flexShrink: 0,
  },
};

const CommonSelectModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  itemsPerPage = 10,
  apiRequest,
  config,
  setFormData,
  setIsEdit,
  isEdit = false,
  authUser,
  screenType,
}) => {
  const [loading, setLoading] = useState(false);
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const [totalElements, setTotalElements] = useState(0);
  const [rowItems, setRowItems] = useState<any[]>([]);
  const [queryData, setQueryData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const validationRules: ValidationRules = {
    q: { required: true, minLength: 2, maxLength: 50 },
  };

  const fetchData = async (
    params: any,
    query = "",
    page = 0,
    size = itemsPerPage
  ) => {
    try {
      setLoading(true);
      if (params?.url === "/doc/get/vessels") {
        const url = `${params.url}?page=${page}&size=${size}${query}`;
        const finalUrl = url.replace("&q=", "&vesselsNo=");
        const res = await apiRequest({ url: finalUrl, method: "GET" });
        if (res?.success?.content?.length > 0) {
          setRowItems(res.success.content);
          setCurrentPage(page);
          setTotalElements(res?.success?.totalElements);
        } else {
          setRowItems([]);
          setTotalElements(0);
        }
      } else {
        const exc = params?.exec ?? "";
        const url = `${params.url}?page=${page}&size=${size}${exc}${query}`;
        const res = await apiRequest({ url, method: "GET" });
        if (res?.content?.length > 0) {
          setRowItems(res.content);
          setCurrentPage(page);
          setTotalElements(res.totalElements);
        } else {
          setRowItems([]);
          setTotalElements(0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config) {
      fetchData(config, `&q=${config?.search ?? ""}`, 0, itemsPerPage);
      setQueryData({ q: config?.search ?? "" });
      setSelectedKey(config?.search ?? null);
    }
  }, [config]);

  const searchItem = useCallback(async () => {
    const { isValid, errors: errs } = validationRequest(
      queryData,
      validationRules
    );
    setErrors(errs);
    if (!isValid) {
      toast.error("Search key is missing or too short.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }
    setCurrentPage(0);
    fetchData(config, `&q=${queryData.q}`, 0, itemsPerPage);
  }, [config, queryData]);

  const resetItem = useCallback(async () => {
    setErrors({});
    setQueryData({});
    setCurrentPage(0);
    fetchData(config, "&q=", 0, itemsPerPage);
  }, [config]);

  const onPageChange = useCallback(
    (page: number, rows: number) => {
      setCurrentPage(page);
      setRowsPerPage(rows);
      fetchData(config, `&q=${queryData.q ?? ""}`, page, rows);
    },
    [config, queryData]
  );

  const onSelectRow = useCallback(
    async (rowData: Record<string, any>) => {
      try {
        setIsLoadingSet(true);
        const key = rowData?.[config?.columns?.[0]?.field ?? ""];
        setSelectedKey(key);
        
        if (config?.field === "containerNo") {
          
          setIsEdit?.(true);
          const containerNo = key;
          const response = await apiRequest({
            url: `/containerInPortDetails?containerNo=${containerNo}`,
            method: "GET",
          });
          const responseDetail = await apiRequest({
            url: `/service/charge/search?chitNo=${response?.chitNo}&containerNo=${response?.containerNo}`,
            method: "GET",
          });

          const detail = responseDetail?.success?.serviceDetails?.length
            ? responseDetail.success.serviceDetails.map((item: any) => {
              const rate = Number(item.rate) || 0;
              const days = calculateDays(
                moment(item.serviceFromDate, "DD/MM/YYYY").format(
                  "YYYY-MM-DD"
                ),
                moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD")
              );
              const amount = rate * days;
              const gstAmount = amount * 0.18;
              return {
                id: item?.id ?? "",
                cfsNo: item?.cfsNo ?? "",
                cfsDate: item.cfsDate
                  ? moment(item.cfsDate, "DD/MM/YYYY").format("YYYY-MM-DD")
                  : "",
                service: item?.serviceTypeCd,
                from: item.serviceFromDate
                  ? moment(item.serviceFromDate, "DD/MM/YYYY").format(
                    "YYYY-MM-DD"
                  )
                  : "",
                to: item.serviceToDate
                  ? moment(item.serviceToDate, "DD/MM/YYYY").format(
                    "YYYY-MM-DD"
                  )
                  : "",
                rate: item?.rate ?? 0,
                amount: item?.amount ?? 0,
                sgst: item?.sgst ?? 0,
                cgst: item?.cgst ?? 0,
                igst: item?.igst ?? 0,
                gst: Number(gstAmount.toFixed(2)),
                totalVal: item?.totalVal ?? 0,
                paymentNo: item?.paymentNo ?? "",
                paymentDate: item?.paymentDate ?? "",
                remarks: item?.serviceRemarks ?? "",
                cancelFlag: "N",
              };
            })
            : [];

          setFormData((prev: any) => ({
            ...prev,
            ...rowData,
            serviceDetails: detail,
            adChitNo: response?.chitNo,
            adTime: response?.gateInDateTime
              ? moment(response.gateInDateTime).format("YYYY-MM-DD")
              : "",
            containerNo: response?.containerNo,
            chAgentCode: response?.agentCode,
            chAgentName: response?.agentName,
            shipBillNo: response?.boeNo,
            containerSize: response?.containerSize,
            loadingStatus: response?.loadingStatus,
            foreignCoastalFlag: response?.foreignCoastalFlag,
            delDateTentive: responseDetail?.success?.tenDeliveryDate
              ? moment(
                responseDetail.success.tenDeliveryDate,
                "DD/MM/YYYY"
              ).format("YYYY-MM-DD")
              : "",
            delDateActual: "",
          }));
        } else if (config?.field === "vesselNo") { 

          console.log('vessel',config?.field)
          const value = key;
          const vesselNO = rowData?.vesselNo;
          const agentCode = screenType == "add" ? authUser?.loginId : "";
          let documents: any[] = [];
          try {
            const response = await apiRequest({ url: `/doc/get-doc?vesselsNo=${vesselNO}&agentCode=${agentCode}`, method: "GET" });
            documents = response?.success?.documents ?? [];
          } catch (error: any) {

            documents = [];

            isEdit ? toast.warning("No Document Details found") : ""
          }
          // console.log('config?.fieldconfig?.field',config?.field,value)
          setFormData((prev: any) => ({
            ...prev,
            ...rowData,
            ...(config?.columns?.length > 1 && config?.columns?.[1]?.field
              ? {
                [config.dispField ?? ""]:
                rowData?.[config.columns[1].field],
                documents: documents,
              }
              : {}),
              [config?.field ?? ""]: value,
          }));
          isEdit ? setIsEdit(true) : ""
          screenType == "view" ? setIsEdit(true) : ""
        } else {
          const value = key;
          console.log('config?.field',config?.field,config?.columns)
          setFormData((prev: any) => ({
            ...prev,
            ...rowData,
            ...(config?.columns?.length > 1 && config?.columns?.[1]?.field
              ? {
                [config.dispField ?? ""]: rowData?.[config.columns[1].field],
              }
              : {}),
              [config?.field ?? ""]: value,
          }));
        }

        onClose?.();
      } catch (err) {
        console.error("onSelectRow error:", err);
      } finally {
        setIsLoadingSet(false);
      }
    },
    [config, apiRequest, setFormData, setIsEdit, onClose, authUser, screenType]
  );

  /* ─── Derived pagination ─── */
  const totalPages = Math.ceil(totalElements / rowsPerPage);

  /* ─── Column helpers ─── */
  const radioBodyTemplate = (rowData: any) => {
    const key =
      config?.columns?.length > 1 && config?.columns?.[1]?.field
        ? rowData[config.columns[1].field]
        : rowData[config?.columns?.[0]?.field ?? ""];

    const checked = selectedKey === key;

    return (
      <div
        style={S.radioCell(checked)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectRow(rowData);
        }}
      >
        {checked && <div style={S.radioDot} />}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={S.overlay}
            onClick={onClose}
          />

          {/* Slide-in Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 0.68, 0, 1.1] }}
            style={S.panel}
          >
            {/* Header */}
            <div style={S.header}>
              <h5 style={S.headerTitle}>{config?.title ?? "Search"}</h5>
              <button style={S.backBtn} onClick={onClose}>
                Back
              </button>
            </div>

            {/* Search bar */}
            <div style={S.searchBar}>
              <input
                type="text"
                name="q"
                value={queryData?.q ?? ""}
                placeholder="Type to search..."
                style={S.input(!!errors?.q)}
                onChange={(e) => {
                  setQueryData((p) => ({ ...p, q: e.target.value }));
                  setErrors({});
                }}
                onKeyDown={(e) => e.key === "Enter" && searchItem()}
              />
              <button
                style={S.actionBtn(loading)}
                disabled={loading}
                onClick={searchItem}
              >
                {loading ? "Searching…" : "Search 🔍"}
              </button>
              <button
                style={S.actionBtn(loading)}
                disabled={loading}
                onClick={resetItem}
              >
                Reset 🔄
              </button>
            </div>

            {/* Table */}
            <div style={S.tableWrap}>
              <DataTable
                value={rowItems}
                size="small"
                stripedRows
                showGridlines
                loading={loading}
                emptyMessage={
                  loading ? (
                    <div style={{ textAlign: "center", padding: 32 }}>
                      <i
                        className="pi pi-spin pi-spinner"
                        style={{ fontSize: "1.8rem", color: "#021432" }}
                      />
                    </div>
                  ) : (
                    "No records found"
                  )
                }
                onRowClick={(e) => onSelectRow(e.data)}
                rowClassName={(rowData) => {
                  const key =
                    config?.columns?.length > 1 && config?.columns?.[1]?.field
                      ? rowData[config.columns[1].field]
                      : rowData[config?.columns?.[0]?.field ?? ""];
                  return selectedKey === key ? "selected-row" : "";
                }}
                style={{ fontSize: 12.5 }}
              >
                <PrimeColumn
                  header="Select"
                  style={{ width: "3rem", textAlign: "center" }}
                  headerStyle={S.tableHeader}
                  body={radioBodyTemplate}
                />
                {config?.columns?.map((col: any, index: number) => (
                  <PrimeColumn
                    key={col?.field ? `col-${col.field}` : `col-index-${index}`}
                    field={col.field}
                    header={col.header}
                    headerStyle={S.tableHeader}
                  />
                ))}
              </DataTable>
            </div>

            {/* Footer: total + paginator */}
            <div style={S.footerBar}>
              <span>Total Records: {totalElements}</span>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button
                    style={S.pageBtn(false, currentPage === 0)}
                    disabled={currentPage === 0}
                    onClick={() => onPageChange(currentPage - 1, rowsPerPage)}
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      const start = Math.max(
                        0,
                        Math.min(currentPage - 2, totalPages - 5)
                      );
                      const page = start + i;
                      return (
                        <button
                          key={`page-${page}`}
                          style={S.pageBtn(page === currentPage)}
                          onClick={() => onPageChange(page, rowsPerPage)}
                        >
                          {page + 1}
                        </button>
                      );
                    }
                  )}
                  <button
                    style={S.pageBtn(false, currentPage >= totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => onPageChange(currentPage + 1, rowsPerPage)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Copyright */}
            <div style={S.copyright}>
              © 2026 DCG Data-Core Systems (India) Private Limited. All rights
              reserved.
            </div>
          </motion.div>
        </>
      )}
      {isLoadingSet && <LoadingFetchLoader />}
    </AnimatePresence>
  );
};

export default CommonSelectModal;