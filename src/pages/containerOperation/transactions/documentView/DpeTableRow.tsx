import Select from "react-select";
import React from "react";

interface Props {
    row: any;
    index: number;
    services: any[];
    errors: any;
    handleRowChange: any;
    formData: any;
    setFormData: any;
}

const DpeTableRow: React.FC<Props> = ({
    row,
    index,
    services,
    errors,
    handleRowChange,
    formData,
    setFormData,
}) => {

    const isDisabled = !!row?.paymentNo;

    // ✅ DELETE ROW
    const handleDeleteRow = (index: number) => {
        if (!window.confirm("Are you sure you want to delete this row?")) return;

        const updatedRows = [...formData.details];
        updatedRows.splice(index, 1);

        setFormData({
            ...formData,
            details: updatedRows,
        });
    };

    // ✅ FILE UPLOAD
    const handleFileChange = (e: any, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const updatedRows = [...formData.details];
        updatedRows[index] = {
            ...updatedRows[index],
            file: file,
        };

        setFormData({
            ...formData,
            details: updatedRows,
        });
    };

    // ✅ REMOVE FILE
    const handleRemoveFile = (index: number) => {
        const updatedRows = [...formData.details];
        updatedRows[index] = {
            ...updatedRows[index],
            file: null,
        };

        setFormData({
            ...formData,
            details: updatedRows,
        });
    };

    // ✅ DOWNLOAD LINK
    const getDownloadUrl = () => {
        if (row.file instanceof File) {
            return URL.createObjectURL(row.file);
        }
        if (row.fileUrl) {
            return row.fileUrl;
        }
        return null;
    };

    const downloadUrl = getDownloadUrl();

    return (
        <tr>
            <td className="d-flex gap-1">
                <button
                    style={{ cursor: "pointer" }}
                    disabled={row?.id || index === 0}
                    onClick={() => handleDeleteRow(index)}
                    className="btn btn-sm btn-danger  custom-form-control pointer"
                >
                    X
                </button>
            </td>
            <td>
                <Select
                    options={services}
                    isDisabled={isDisabled}
                    menuPortalTarget={document.body}
                    menuPlacement={"top"}
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
                                ? "#4bce86ff"
                                : errors?.[`row_${index}`]?.service
                                    ? "#dc3545"
                                    : state.isFocused
                                        ? "#86b7fe"
                                        : "#ced4da",
                            '&:hover': {
                                borderColor: errors?.[`row_${index}`]?.documentType ? "#dc3545" : "#86b7fe",
                                backgroundColor: state.isDisabled
                                    ? "#e9ecef"
                                    : base.backgroundColor
                            }
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                    value={
                        services.find((opt: any) => opt.value === row?.documentType) || null
                    }
                    onChange={(selected: any) =>
                        handleRowChange(index, "documentType", selected?.value || "")
                    }
                />
                {errors?.[`row_${index}`]?.documentType && (
                    <small className="text-danger">
                        {errors[`row_${index}`].documentType}
                    </small>
                )}
            </td>

            {/* FROM */}
            <td>
                <input
                    type="text"
                    value={row?.documentRemarks || ""}
                    disabled={isDisabled}
                    onChange={(e) =>
                        handleRowChange(index, "documentRemarks", e.target.value)
                    }
                    className={`form-control custom-form-control ${errors?.[`row_${index}`]?.documentRemarks ? "is-invalid" : ""
                        }`}
                />
            </td>
 
            <td>
                <input
                    type="text" 
                    value={row?.documentUpDate || ""}
                    disabled={true}
                    style={{border:"none"}}
                    onChange={(e) => handleRowChange(index, "documentUpDate", e.target.value)}
                    className={`custom-form-control ${errors?.[`row_${index}`]?.documentUpDate ? "is-invalid" : ""}`}
                />
            </td>
 
            <td>
                <div className="file-upload-wrapper">

                    {!row.file && !isDisabled && (
                        <label className="upload-btn form-control custom-form-control">
                            Upload
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileChange(e, index)}
                            />
                        </label>
                    )}

                    {row.file && (
                        <>
                            <span className="file-name">
                                {row.file.name}
                            </span>

                            {!isDisabled && (
                                <button
                                    type="button"
                                    className="remove-file-btn"
                                    onClick={() => handleRemoveFile(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </>
                    )}
                </div>
            </td>

            {/* DOWNLOAD */}
            <td>
                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        download={row.file?.name || "download"}
                        className="download-link"
                        target="_blank"
                        rel="noreferrer"
                    >
                        ⬇ File Link
                    </a>
                )}
            </td>

        </tr>
    );
};

export default DpeTableRow;
