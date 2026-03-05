

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
    const inserted = row?.id || "";
    return (
        <tr>
            <td className="d-flex gap-1">
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

                {/* <FontAwesomeIcon disabled={row?.id || index === 0}
                    onClick={() => deleteRow(index)} className="pointer" style={{ fontSize: "20px", color: "#dc3545" }} icon={faRemove} /> */}
                {/* <button
                    style={{ cursor: "pointer" }}
                    disabled={row?.id || index === 0}
                    onClick={() => deleteRow(index)}
                    className="btn btn-sm btn-danger   pointer"
                >
                    X
                </button> */}
                {/* <button
                    type="button"
                    className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${inserting?.isInserting && inserting?.index === index ? "loading" : ""}`}
                    disabled={isDisabled || (inserting?.isInserting && inserting?.index === index)}
                    onClick={() => saveRow(index)}
                    style={{ minWidth: "80px" }}
                >
                    {inserting?.isInserting && inserting?.index === index ? (<span className="spinner-center"></span>) : (
                        <span className="btn-text">
                            {isDisabled ? "Paid" : "Insert"}
                        </span>
                    )}
                </button> */}
                {
                    (row?.paymentNo && row?.paymentDate) && <FontAwesomeIcon className="mt-2" style={{ fontSize: "20px", color: "#86b7fe" }} icon={faReceipt} />

                }
                {
                   !(row?.paymentNo && row?.paymentDate) && row?.id && (
                        <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={paymentRecord?.some(
                                (item: any) =>
                                    item?.id?.chitNo === row?.id?.chitNo &&
                                    item?.id?.srlNo === row?.id?.srlNo
                            )}
                            onChange={() => checkRowForPayment(row)}
                            className="ml-3 custom-form-control"
                            style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "0px",
                                cursor: "pointer",
                            }}
                        />
                    )
                }

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
                        handleRowChange(index, "service", selected?.value || "")
                    }
                />
                {errors?.[`row_${index}`]?.service && (<small className="text-danger">{errors[`row_${index}`].service}</small>)}

            </td>
            <td> <input type="date" value={row?.from || ""} disabled={isDisabled} max={row?.to || undefined} onChange={(e) => handleRowChange(index, "from", e.target.value)} className={`form-control custom-form-control ${errors?.[`row_${index}`]?.from ? "is-invalid" : ""}`} /> {errors?.[`row_${index}`]?.from && (<small className="text-danger">{errors[`row_${index}`].from}</small>)} </td>
            <td> <input type="date" value={row?.to || ""} disabled={isDisabled} min={row?.from || undefined} onChange={(e) => handleRowChange(index, "to", e.target.value)} className={`form-control custom-form-control ${errors?.[`row_${index}`]?.to ? "is-invalid" : ""}`} />  {errors?.[`row_${index}`]?.to && (<small className="text-danger">{errors[`row_${index}`].to}</small>)} </td>
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
