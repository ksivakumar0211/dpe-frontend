

import SubmitBtn from "@/components/Form/SubmitBtn";
import { faCancel, faReceipt, faRemove, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
interface Props {
    row: any;
    index: number;
    services: any[];
    errors: any;
    inserting?: any;
    handleRowChange: any;
    handleCalcChange: any;
    paymentRecord: any;
    deleteRow: (index: number) => void;
    saveRow: (index: number) => void;
    checkRowForPayment: (row: any) => void;
}

const DpeTableRow: React.FC<Props> = ({
    row,
    index,
    services,
    errors,
    handleRowChange,
    deleteRow,
    saveRow,
    inserting,
    checkRowForPayment,
    paymentRecord
}) => {
    const isDisabled = row?.paymentNo || "";
    const serviceSelected = !!row?.service;
    const fromSelected = !!row?.from;

    const disableFrom = isDisabled || !serviceSelected;
    const disableTo = isDisabled || !serviceSelected || !fromSelected;
    return (
        <tr>
            <td className="d-flex" width="1">
                <FontAwesomeIcon
                    className="mt-2"
                    onClick={() => {
                        if (!row?.id && index !== 0) {
                            deleteRow(index);
                        }
                    }}
                    style={{
                        fontSize: "20px",
                        color: row?.id || index === 0 ? "#ccc" : "#dc3545",
                        cursor: row?.id || index === 0 ? "not-allowed" : "pointer",
                        pointerEvents: row?.id || index === 0 ? "none" : "auto"
                    }}
                    icon={faRemove}

                />  
            </td>
            <td> <input value={row?.cfsNo || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input type="date" value={row?.cfsDate || ""} disabled={row?.id} onChange={(e) => handleRowChange(index, "cfsDate", e.target.value)} className={`form-control custom-form-control ${errors?.[`row_${index}`]?.cfsDate ? "is-invalid" : ""}`} />  {errors?.[`row_${index}`]?.cfsDate && (<small className="text-danger">{errors[`row_${index}`].cfsDate}</small>)}</td>
            <td>
                <Select
                    options={services}
                    isDisabled={isDisabled}
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPlacement="top"
                    styles={{
                        control: (base: any, state: any) => ({
                            ...base,
                            borderRadius: "0px",
                            minWidth: "103%",
                            boxSizing: "border-box",
                            fontSize: '11px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderColor: state.isDisabled
                                ? "#ced4da"
                                : errors?.[`row_${index}`]?.service
                                    ? "#dc3545"
                                    : state.isFocused
                                        ? "#86b7fe"
                                        : "#ced4da",
                            '&:hover': {
                                borderColor: errors?.[`row_${index}`]?.service ? "#dc3545" : "#86b7fe",
                                backgroundColor: state.isDisabled
                                    ? "#e9ecef"
                                    : base.backgroundColor
                            }
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                    value={
                        services.find((opt: any) => opt.value === row?.service) || null
                    }
                    onChange={(selected: any) =>
                        handleRowChange(index, "service", selected?.value || "", selected?.items)
                    }
                />
                {errors?.[`row_${index}`]?.service && (<small className="text-danger">{errors[`row_${index}`].service}</small>)}

            </td>
            <td> <input type="date" value={row?.from || ""} disabled={disableFrom} max={row?.to || undefined} onChange={(e) => handleRowChange(index, "from", e.target.value)} className={`form-control custom-form-control ${errors?.[`row_${index}`]?.from ? "is-invalid" : ""}`} /> {errors?.[`row_${index}`]?.from && (<small className="text-danger">{errors[`row_${index}`].from}</small>)} </td>
            <td> <input type="date" value={row?.to || ""} disabled={disableTo} min={row?.from || undefined} onChange={(e) => handleRowChange(index, "to", e.target.value)} className={`form-control custom-form-control ${errors?.[`row_${index}`]?.to ? "is-invalid" : ""}`} />  {errors?.[`row_${index}`]?.to && (<small className="text-danger">{errors[`row_${index}`].to}</small>)} </td>
            <td> <input value={row?.rate || ""} disabled className="form-control custom-form-control" /></td>
            <td> <input value={row?.amount || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input value={row?.cgst || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input value={row?.sgst || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input value={row?.gst || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input value={row?.totalVal || ""} disabled className="form-control custom-form-control" /> </td>
            <td> <input value={row?.paymentNo || ""} disabled={true} onChange={(e) => handleRowChange(index, "paymentNo", e.target.value)} className="form-control custom-form-control" /> </td>
            <td> <input value={row?.paymentDate || ""} disabled={true} onChange={(e) => handleRowChange(index, "paymentDate", e.target.value)} className="form-control custom-form-control" /> </td>
            <td> <input value={row?.remarks || ""} disabled={isDisabled} onChange={(e) => handleRowChange(index, "remarks", e.target.value)} className="form-control custom-form-control" /> </td>
        </tr >
    );
};

export default DpeTableRow;
