// src/utils/menuUtils.ts

import { apiRequest } from "@/store/services/api";
import moment from "moment";

export type ParentMenu = {
  menuId: string;
  parentMenuId: string | null;
  menuNameTree: string;
  children: ParentMenu[];
};

export type ChildMenu = {
  moduleId: string;
  moduleName: string;
  menuId: string;
  menuName: string;
};

export const flattenMenus = (
  menus: ParentMenu[],
  moduleId: string,
  moduleName: string
): ChildMenu[] => {
  let result: ChildMenu[] = [];

  for (const menu of menus) {
    result.push({
      moduleId,
      moduleName,
      menuId: menu.menuId,
      menuName: menu.menuNameTree,
    });

    if (menu.children?.length) {
      result = result.concat(
        flattenMenus(menu.children, moduleId, moduleName)
      );
    }
  }

  return result;
};

export const fileTypeOptions: any = [
  { label: "PDF", value: ".pdf" },
  // { label: "Word (DOC)", key: ".doc" },
  // { label: "Word (DOCX)", key: ".docx" },
  // { label: "Excel (XLS)", key: ".xls" },
  // { label: "Excel (XLSX)", key: ".xlsx" }
];
export const searchConfig: any = {
  container: {
    title: 'Select Conatainer No',
    url: '/containerNoForServiceAdd',
    field: "containerNo",
    dispField: "containerNo",
    columns: [
      { field: 'name', header: 'Container No' },
    ]
  },
  port: {
    title: 'Select Port of Destination',
    url: '/ports',
    field: "portCode",
    dispField: "portName",
    columns: [
      { field: 'code', header: 'Code' },
      { field: 'name', header: 'Name' },
    ]
  },
  shipper: {
    title: 'Select Shipper',
    url: '/shippers',
    field: "shipperName",
    dispField: "shipperName",
    columns: [
      { field: 'name', header: 'Name' }
    ]
  },
  vessel: {
    title: 'Select Vessel',
    url: '/vessels',
    field: "vesselName",
    dispField: "vesselNo",
    columns: [
      { field: 'vesselName', header: 'Vessel Name' },
      { field: 'vesselNo', header: 'Vessel No' },
      { field: 'voyageNumber', header: 'Voyage No' }
    ]
  },
  vesselss: {
    title: 'Select Vessel',
    url: '/doc/get/vessels',
    field: "vesselNo",
    dispField: "vesselNo",
    columns: [
      { field: 'vesselNo', header: 'Vessel No' },
      { field: 'vesselName', header: 'Vessel Name' },
      { field: 'agentCustomerName', header: 'Agent Name' },
      { field: 'agentCustomerId', header: 'Agent Code' },
      { field: 'vcn', header: 'VCN' },
    ]
  },
  gateOutLocation: {
    title: 'Select To Location',
    url: '/locations',
    exec: "&exclude=LOC001",
    field: "locationCode",
    dispField: "fromLocationName",
    columns: [
      { field: 'code', header: 'Code' },
      { field: 'name', header: 'Name' },
    ]
  },
  location: {
    title: 'Select To Location',
    url: '/locations',
    exec: "&exclude=LOC001",
    field: "locationCode",
    dispField: "locationName",
    columns: [
      { field: 'code', header: 'Code' },
      { field: 'name', header: 'Name' },
    ]
  },
  agent: {
    title: 'Select CH Agent',
    url: '/agents',
    field: "agentNames",
    dispField: "agentCode",
    columns: [
      { field: 'name', header: 'Agent Name' },
      { field: 'code', header: 'Agent Code' },
    ]
  },
  cargo: {
    title: 'Select Cargo',
    url: '/cargo',
    field: "cargoCode",
    dispField: "cargoName",
    columns: [
      { field: 'code', header: 'Cargo Code' },
      { field: 'name', header: 'Cargo Name' },
    ]
  },
  liner: {
    title: 'Select Liner',
    url: '/liners',
    field: "linerCode",
    dispField: "linerName",
    columns: [
      { field: 'partyCode', header: 'Code' },
      { field: 'agentName', header: 'Name' },
    ]
  }

};
type FetchCommonDataOptions = {
  url: string;
  setForm: (cb: (prev: any) => any) => void;

  t_field_a?: string;
  t_field_b?: string;
  t_field_c?: string;

  field_a?: string;
  field_b?: string;
  field_c?: string;
};


export const extractUserId = (value: string): string => {

  if (!value) return ""; const parts = value.split("/"); return parts.length > 1 ? `${parts[0]}-${parts[1]}` : value;
};


export const isCheckedChild = async (row: any, menuId: string) => { return row.some((element: any) => element.menuId !== menuId && element.checked === 1 && element.leaf === 1); }
export const checkParentMenuCheck = async (row: any, menuId: string) => {

  return row.some((element: any) => element.menuId !== menuId && element.checked === 1 && element.leaf === 1);
}


export const checkParentNodeMenuCheck = async (row: any, menuId: string) => {
  const currentItem = row.find((item: any) => item.menuId === menuId);
  if (!currentItem) return false;

  return row.some((element: any) =>
    element.moduleId === currentItem.moduleId &&
    element.menuId !== menuId &&
    element.leaf === 1 &&
    element.checked === 1
  );
};

// export const checkParentMenuCheck = async (row: any, menuId: string) => {
//   return row.some((element: any) => element.menuId !== menuId && element.checked === 1 && element.leaf === 1);
// }
export const fetchCommonData = async ({
  url,
  setForm,
  t_field_a,
  t_field_b,
  t_field_c,
  field_a,
  field_b,
  field_c,
}: FetchCommonDataOptions) => {
  try {
    const response = await apiRequest({ url, method: "GET" });
    const records = response?.content ?? [];
    const count = records.length;

    if (count === 0) return;

    const data = records[0];

    setForm((prev: any) => ({
      ...prev,
      ...(field_a && t_field_a && data[field_a] !== undefined && {
        [t_field_a]: data[field_a],
      }),
      ...(field_b && t_field_b && data[field_b] !== undefined && {
        [t_field_b]: data[field_b],
      }),
      ...(field_c && t_field_c && data[field_c] !== undefined && {
        [t_field_c]: data[field_c],
      }),
    }));

  } catch (error) {
    console.error(error);
  }
};


export const calculateDays = (from?: string, to?: string) => {
  if (!from || !to) return 0;

  const start = new Date(from);
  const end = new Date(to);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};






export const fetchContainerServiceData = async (containerNo: string) => {
  const response = await apiRequest({
    url: `/containerInPortDetails?containerNo=${containerNo}`,
    method: "GET"
  });

  const responseDetail = await apiRequest({
    url: `/service/charge/search?chitNo=${response?.chitNo}&containerNo=${response?.containerNo}`,
    method: "GET"
  });

  let serviceOptions = [];

  if (response?.containerSize && response?.loadingStatus && response?.foreignCoastalFlag) {

    const servicesList = await apiRequest({
      url: `/services?countSize=${response.containerSize}&loadingStatus=${response.loadingStatus}&origin=${response.foreignCoastalFlag}&serviceId=`
    });

    serviceOptions = servicesList?.length
      ? servicesList.map((row: any) => ({
        label: row.serviceName,
        value: row.serviceId,
        items: row
      }))
      : [{ label: "Service not available", value: "" }];
  }

  const serviceDetailsRaw = responseDetail?.success?.serviceDetails || [];

  const detail = await Promise.all(
    serviceDetailsRaw.map(async (item: any) => {
      const rate = Math.ceil(item.amount || 0 + Number.EPSILON);
      // const rate = Number(item.amount) || 0;
      const amount = rate;
      const gstAmount = amount * 0.18;

      const services = await apiRequest({
        url: `/services?countSize=${response.containerSize}&loadingStatus=${response.loadingStatus}&origin=${response.foreignCoastalFlag}&serviceId=${item.serviceTypeCd}`
      });
      const serviceType = services?.[0]?.serviceType;
      return {
        id: item?.id || "",
        cfsNo: item?.cfsNo || "",
        cfsDate: item.cfsDate ? moment(item.cfsDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
        service: item?.serviceTypeCd,
        from: item.serviceFromDate ? moment(item.serviceFromDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
        to: item.serviceToDate ? moment(item.serviceToDate, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
        ...(serviceType !== "R" && { rate }),
        ...(serviceType == "R" && { amount: rate }),
        ...(serviceType !== "R" && { amount:  rate }),
        sgst: Math.ceil(item.sgst || 0 + Number.EPSILON),
        cgst: Math.ceil(item.cgst || 0 + Number.EPSILON),
        igst: Math.ceil(item.igst || 0 + Number.EPSILON),
        gst: (Math.ceil(item.sgst || 0 + Number.EPSILON) + Math.ceil(item.cgst || 0)),
        totalVal: (Math.ceil(item.sgst || 0 + Number.EPSILON) + Math.ceil(item.cgst || 0 + Number.EPSILON) + Number(item?.amount || 0)),
        paymentNo: item?.paymentNo || "",
        paymentDate: item?.paymentDate || "",
        remarks: item?.serviceRemarks || "",
        cancelFlag: "N",
        serviceType: serviceType || ""
      };
    })
  );

  return {
    containerResponse: response,
    serviceOptions,
    serviceDetails: detail,
    responseDetail
  };
};