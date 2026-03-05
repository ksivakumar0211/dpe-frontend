import React, { memo, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { Col, Form } from "react-bootstrap";

interface InputFormFieldProps {
    label: string;
    type?: string;
    name?: string;
    inputValue: string;
    error?: string;
    placeholder?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    isDefault?: boolean;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    max?: number;
    onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
    row?: string;
    col1?: string;
    col2?: string;
}

const FilterInputField: React.FC<InputFormFieldProps> = memo(({
    label,
    placeholder,
    type = 'text',
    name,
    inputValue,
    onChange,
    error,
    isDefault = false,
    onBlur,
    required = false,
    max = 250,
    onKeyUp,
    row = "col-md-2",
    col1 = "col-sm-12 col-12",
    col2 = "col-sm-12 col-12"
}) => {

    const handleNumberInput = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        if (type === "number") {
            const numericValue = value.replace(/[^0-9.]/g, '');
            if (value !== numericValue || (numericValue.match(/\./g) || []).length > 1) {
                return;
            }
            e.target.value = numericValue;
        } else if (type === "str" || type === "string") {
            const alphanumericValue = value.replace(/[^a-zA-Z0-9-]/g, '');
            e.target.value = alphanumericValue.toUpperCase().trim();
        }

        if (onChange) {
            onChange(e);
        }
    };

    const inputType = type === "number" && max !== 250 ? 'text' : type;
    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => { if (onKeyUp) onKeyUp(e); };

    return (
        <div className={`form-group ${row} `}>
            <label htmlFor={name}
                className={`col-form-label ${col1}`}
                style={{ padding: '0px',fontSize: "10px", fontWeight:'bold' }}
            >
                {label}{required && (<span className="text-danger text-bold">*</span>)}
            </label>
            <div className={col2} style={{ padding: '0px 3px 3px 0px'}} >
                <input
                    type={inputType}
                    className={`form-control valid ${error ? 'is-invalid' : ''}`}
                    id={name}
                    disabled={isDefault}

                    name={name}
                    value={inputValue ?? ''}
                    onBlur={onBlur}
                    onKeyUp={handleKeyUp}
                    onChange={handleNumberInput}
                    maxLength={max}
                    min={0}
                    // placeholder={placeholder || `Enter ${label}`}
                    style={{
                        width:'105%',
                        textAlign: "left",
                        padding: "0 0 0 4px",
                        borderRadius:"0px",
                        ...(required
                            ? {
                                fontWeight: "400",
                                backgroundColor: isDefault ? "#fff" : "#fff",
                            }
                            : {}),
                    }}
                />
                {error && <span className="text-danger" style={{ fontSize: "11px", marginTop: "0" }}>{error}</span>}
            </div>
        </div>

    );
});

const areEqual = (prevProps: InputFormFieldProps, nextProps: InputFormFieldProps) => {
    return (
        prevProps.name === nextProps.name &&
        prevProps.error === nextProps.error &&
        prevProps.inputValue === nextProps.inputValue
    );
};

export default memo(FilterInputField, areEqual);
