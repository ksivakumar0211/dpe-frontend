import React, { memo, FocusEvent } from 'react';

interface Option {
    label: string;
    value: string;
}

interface SelectionFieldProps {
    label: string;
    name?: string;
    value?: any;
    options: Option[]; // 👈 dynamic options
    type?: "radio" | "checkbox";
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDefault?: boolean;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    row?: string;
    col1?: string;
    col2?: string;
}

const RowFormSelectionField: React.FC<SelectionFieldProps> = memo(({
    label,
    name,
    value,
    options = [],
    type = "radio",
    onChange,
    error,
    isDefault = false,
    onBlur,
    required = false,
    row = "col-md-4",
    col1 = "col-sm-5 col-4",
    col2 = "col-sm-7 col-8"
}) => {

    return (
        <div className={`form-group ${row} d-flex`}>
            <label
                className={`col-form-label ${col1}`}
                style={{ padding: '0px', fontSize: "10px", fontWeight: 'bold' }}
            >
                {label}
                {required && <span className="text-danger">*</span>}
            </label>

            <div
                className={col2}
                style={{
                    padding: "0px 3px 3px 0px",
                    display: "flex",
                    alignItems: "center"
                }}
            >
                <div className="smooth-toggle">
                    {options.map((opt, index) => (
                        <React.Fragment key={opt.value}>
                            <input
                                type={type}
                                id={`${name}-${opt.value}`}
                                name={name}
                                value={opt.value}
                                checked={value == opt.value}
                                onChange={onChange}
                                disabled={isDefault}
                            />
                            <label htmlFor={`${name}-${opt.value}`}>
                                {opt.label}
                            </label>
                        </React.Fragment>
                    ))}

                    <span
                        className="slider"
                        style={{
                            width: `${100 / options.length}%`,
                            transform: `translateX(${options.findIndex(o => o.value === value) * 100}%)`
                        }}
                    ></span>
                </div>

                {error && (
                    <span className="text-danger ms-2" style={{ fontSize: "11px" }}>
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
});

const areEqual = (prev: SelectionFieldProps, next: SelectionFieldProps) => (
    prev.name === next.name &&
    prev.error === next.error &&
    prev.value === next.value
);

export default memo(RowFormSelectionField, areEqual);