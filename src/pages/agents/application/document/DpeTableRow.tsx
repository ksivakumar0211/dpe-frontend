import Select from "react-select";
import React from "react";
import { fileTypeOptions } from "@/utils/commonHelper";
import "./DpeTableRow.css";
import moment from "moment";
interface Props {
    row: any;
    index: number;
    errors: any;
    handleRowChange: any;
    formData: any;
    setFormData: any;
    setErrors: any;
    downloadReport?: any;
}

const DpeTableRow: React.FC<Props> = ({
    row,
    index,
    errors,
    handleRowChange,
    formData,
    setFormData,
    setErrors,
    downloadReport
}) => {

    const isDisabled = false
    const handleDeleteRow = (index: number) => {
        if (!window.confirm("Are you sure you want to delete this row?")) return;

        const updatedRows = [...formData.documents];
        updatedRows.splice(index, 1);

        setFormData({
            ...formData,
            documents: updatedRows,
        });
    };

    const handleFileChange = (e: any, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const updatedRows = [...formData.documents];
        updatedRows[index] = {
            ...updatedRows[index],
            docFile: file,
        };

        setFormData({
            ...formData,
            documents: updatedRows,
        });

        setErrors((prev: any) => {
            const updatedErrors = { ...prev };
            if (updatedErrors[`row_${index}`]) {
                delete updatedErrors[`row_${index}`].docFile;
            }
            return updatedErrors;
        });
    };

    const handleRemoveFile = (index: number) => {
        const updatedRows = [...formData.documents];
        updatedRows[index] = {
            ...updatedRows[index],
            docFile: null,
        };

        setFormData({
            ...formData,
            documents: updatedRows,
        });
    };

    const getDownloadUrl = () => {
        if (row.docFile instanceof File) {
            return URL.createObjectURL(row.docFile);
        }
        if (row.docUpLink) {
            return row.docUpLink;
        }
        return null;
    };

    const downloadUrl = getDownloadUrl();

    const formatToInputDate = (date: string) => {
        return date ? moment(date, "DD-MM-YYYY").format("YYYY-MM-DD") : "";
    };
    // const uploadedDate = 
    return (
        <tr>
            <td className="d-flex gap-1">
                <button
                    style={{ cursor: "pointer" }}
                    disabled={!!row?.srlNo || index === 0}
                    onClick={() => handleDeleteRow(index)}
                    className="btn btn-sm btn-danger custom-form-control pointer"
                >
                    X
                </button>
            </td>
            <td>
                <Select
                    options={fileTypeOptions}
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
                                : errors?.[`row_${index}`]?.documentType
                                    ? "#dc3545"
                                    : state.isFocused
                                        ? "#86b7fe"
                                        : "#ced4da",
                            '&:hover': {
                                borderColor: errors?.[`row_${index}`]?.documentType ? "#dc3545" : "#86b7fe",
                                backgroundColor: state.isDisabled ? "#e9ecef" : base.backgroundColor
                            }
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                    value={fileTypeOptions.find((opt: any) => opt.value === row?.documentType) || null}
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
            <td>
                <input
                    type="text"
                    value={row?.documentRemarks || ""}
                    disabled={isDisabled}
                    onChange={(e) =>
                        handleRowChange(index, "documentRemarks", e.target.value)
                    }
                    className={`form-control custom-form-control ${errors?.[`row_${index}`]?.documentRemarks ? "is-invalid" : ""}`}
                />
                {errors?.[`row_${index}`]?.documentRemarks && (
                    <small className="text-danger">
                        {errors[`row_${index}`].documentRemarks}
                    </small>
                )}
            </td>

            {/* UPLOAD DATE */}
            <td>
                <input
                    type="date"
                    value={formatToInputDate(row?.docUploadDate)}
                    style={{ border: "none" }}
                    onChange={(e) => handleRowChange(index, "docUploadDate", e.target.value)}
                    className={`custom-form-control ${errors?.[`row_${index}`]?.docUploadDate ? "is-invalid" : ""}`}
                />
                {errors?.[`row_${index}`]?.docUploadDate && (
                    <small className="text-danger">
                        {errors[`row_${index}`].docUploadDate}
                    </small>
                )}
            </td>

            {/* FILE UPLOAD */}
            <td>
                <div className="file-upload-wrapper">
                    {!row.docFile && !isDisabled && (
                        <label
                            className={`file-drop-zone${errors?.[`row_${index}`]?.docFile ? " file-drop-zone--error" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add("file-drop-zone--dragging");
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.classList.remove("file-drop-zone--dragging");
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove("file-drop-zone--dragging");
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                    const syntheticEvent = { target: { files: [file] } } as any;
                                    handleFileChange(syntheticEvent, index);
                                }
                            }}
                        >
                            <svg className="file-drop-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1v9M5 4l3-3 3 3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="file-drop-label">Upload</span>
                            <input
                                accept={row?.documentType}
                                type="file"
                                hidden
                                onChange={(e) => handleFileChange(e, index)}
                            />
                        </label>
                    )}

                    {row.docFile && (
                        <div className="file-preview">
                            <svg className="file-preview__icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="file-preview__name" title={(row.docFile as File).name}>
                                {(row.docFile as File).name}
                            </span>
                            <div className="file-preview__actions">
                                {downloadUrl && (
                                    <a
                                        href={downloadUrl}
                                        download={(row.docFile as File)?.name || "download"}
                                        className="file-preview__btn file-preview__btn--download"
                                        title="Download"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 1v9M5 10l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                )}
                                {!isDisabled && (
                                    <button
                                        type="button"
                                        className="file-preview__btn file-preview__btn--remove"
                                        title="Remove file"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!row?.docFile && row?.dccFileName && row?.dccDownLink && (
                        <div className="file-preview"> 
                            <div className="file-preview__actions">
                                {row?.dccDownLink && (
                                    <a
                                        href={downloadUrl}
                                        onClick={(e) => { e.preventDefault(); downloadReport(row) }}
                                        download={"download"}
                                        className="file-preview__btn file-preview__btn--download"
                                        title="Download"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 1v9M5 10l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                )}
                               
                            </div>
                        </div>
                    )}
                </div>
                {errors?.[`row_${index}`]?.docFile && (
                    <small className="text-danger">
                        {errors[`row_${index}`].docFile}
                    </small>
                )}
            </td>

            {/* <td>
                {row.dccDownLink && (
                    <button
                        onClick={(e) => { e.preventDefault(); downloadReport(row) }}
                        className="download-link"
                    >
                        ⬇ File Link
                    </button>
                )}
                {!row.docFile && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download="download"
                        className="download-link"
                        target="_blank"
                        rel="noreferrer"
                    >
                        ⬇ File Link
                    </a>
                )}
            </td> */}
        </tr>
    );
};

export default DpeTableRow;
