import React, { memo, FocusEvent, KeyboardEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface InputFormFieldProps {
    label: string;
    name?: string;
    inputValue?: any;
    error?: string;
    placeholder?: string;
    onChange?: any;
    isDefault?: boolean;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
    row?: string;
    col1?: string;
    col2?: string;
    minDate?: any;
}

const RowFormDateTimeField: React.FC<InputFormFieldProps> = memo(({
    label,
    placeholder,
    name,
    inputValue,
    onChange,
    error,
    isDefault = false,
    onBlur,
    required = false,
    onKeyUp,
    row = "col-md-4",
    col1 = "col-sm-5 col-4",
    col2 = "col-sm-7 col-8",
    minDate = ""
}) => {

    return (
        <div className={`form-group ${row} d-flex`}>
            <label
                htmlFor={name}
                className={`col-form-label ${col1}`}
                style={{ padding: '0px', fontSize: "10px", fontWeight: 'bold' }}
            >
                {label}
                {required && <span className="text-danger">*</span>}
            </label>

            <div className={col2} style={{ padding: '0px 3px 3px 0px' }}>
                <DatePicker
                    id={name}
                    selected={inputValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={isDefault}
                    minDate={minDate}
                    placeholderText="dd/MM/yyyy HH:mm:ss"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    wrapperClassName="w-100 custom-wrapper"
                />

                {error && (
                    <span className="text-danger" style={{ fontSize: "11px" }}>
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
});

const areEqual = (prev: InputFormFieldProps, next: InputFormFieldProps) => (
    prev.name === next.name &&
    prev.error === next.error &&
    prev.inputValue === next.inputValue && 
     prev.minDate === next.minDate

);

export default memo(RowFormDateTimeField, areEqual);
