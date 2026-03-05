import React, { useMemo, useState } from "react";
import Select from "react-select";
import { customSelectOption, customSelectOption1, rowSelectdOption, SelectOption } from "@/utils/helper";

interface OptionType {
    value: string | number;
    label: string;
}

interface SelectFormInputProps {
    name: string;
    label: string;
    options: OptionType[];
    value: string;
    onChange: (selectedOption: OptionType | null, name: string) => void;
    isEdit?: boolean;
    error?: string;
    required?: boolean;
    isLoading?: boolean;
    pgNo?: number;
    formData?: any;
    onMenuScroll?: (formData: any, pgNo?: number) => void;
    row?: string;
    isTrue?: boolean;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    col1?: string;
    col2?: string;
}

const RowFormSelectField: React.FC<SelectFormInputProps> = ({
    name,
    label,
    options,
    value,
    onChange,
    isEdit = false,
    error,
    required = false,
    isLoading = false,
    pgNo,
    formData,
    onMenuScroll = () => console.log("Default"),
    isTrue = false,
    onKeyDown,
    row = "col-md-4",
    col1 = "col-sm-5 col-4",
    col2 = "col-sm-7 col-8"
}) => {
    const [copySuccess, setCopySuccess] = useState<string>("");



    const selectStyles = useMemo(
        () => ({
            container: (base: any) => ({
                ...base,
                borderRadius: 0,
                minWidth: '100%',
            }),
            //         control: (base, state) => ({
            //     ...base,
            //     height: 'calc(1em + .52rem + 0px)',
            //     minHeight: 'calc(1em + .52rem + 0px)',
            //     borderRadius: '0px',
            //     borderWidth: '1px',
                // borderColor: state.isDisabled
                //   ? "#4bce86ff"         
                //   : error
                //     ? "#dc3545"
                //     : state.isFocused
                //       ? "#86b7fe"
                //       : "#ced4da",
            //     backgroundColor: state.isDisabled
            //       ? "#e9ecef"
            //       : error
            //         ? "#fff5f5"
            //         : state.hasValue && !state.isFocused
            //           ? "#4bce86ff"
            //           : state.isFocused
            //             ? "#f2fbf7"
            //             : "#4bce86ff",

            //     opacity: state.isDisabled ? 1 : 1,
            //     cursor: state.isDisabled ? "not-allowed" : "pointer",
            // '&:hover': {
            //   borderColor: error ? "#dc3545" : "#86b7fe",
            //   backgroundColor: state.isDisabled
            //     ? "#e9ecef"
            //     : base.backgroundColor
            // },
            //   }),


            // }),

            control: (base: any, state: any) => ({
                ...base,
                borderRadius: "0px",
                minWidth: "103%",
                boxSizing: "border-box",
                height: 'calc(1em + .50rem + 5px)',
                minHeight: 'calc(1em + .50rem + 9px)',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0',
                 borderColor: state.isDisabled
                  ? "#4bce86ff"         
                  : error
                    ? "#dc3545"
                    : state.isFocused
                      ? "#86b7fe"
                      : "#ced4da",
                '&:hover': {
                    borderColor: error ? "#dc3545" : "#86b7fe",
                    backgroundColor: state.isDisabled
                        ? "#e9ecef"
                        : base.backgroundColor
                }, 
            }),

            // valueContainer: (base: any) => ({
            //     ...base,
            //     paddingLeft: "20px",   
            //     paddingRight: "2px",
            // }),

            // singleValue: (base: any) => ({
            //     ...base,
            //     marginLeft: 0,        // default margin remove
            //     paddingLeft: "20px",   // ✅ selected text
            //     textAlign: "left",
            // }),
            // input: (base: any) => ({
            //     ...base,
            //     fontSize: "10px", // typing text
            //     paddingLeft: "2px",
            // }),

            menu: (base: any) => ({
                ...base,
                zIndex: 9999,
            }),

            menuList: (base: any) => ({
                ...base,
                fontSize: "11px", // 🔥 dropdown list container
                padding: 0,
            }),
            dropdownIndicator: (base: any) => ({
                ...base,
                padding: "0 4px",
                marginTop: "2px",
                alignSelf: "center",
            }),

        }),
        [error, name]
    );

    return (
        <div className={`form-group ${row} d-flex `}>
            <label
                htmlFor="leave_type"
                className={`col-form-label ${col1}`}
                style={{ padding: '0px', fontSize: "10px", fontWeight: 'bold' }}
            >
                {label}{required && (<span className="text-danger text-bold">*</span>)}
            </label>
            <div className={col2}>

                <Select
                    className={`select_height w-100 custome-border ${error ? "is-invalid" : ""}`}
                    id={name}
                    name={name}
                    options={options}
                    value={
                        isEdit
                            ? { value: value, label: value }
                            : options.find((option) => option.value === value) || null
                    }
                    onChange={(selectedOption) => onChange(selectedOption as OptionType | null, name)}
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    onMenuScrollToBottom={() => onMenuScroll(formData, pgNo)}
                    isLoading={isLoading}
                    isDisabled={isTrue}
                    onKeyDown={onKeyDown}
                />
                {copySuccess && <span className="text-success ms-2">{copySuccess}</span>}

                {error && <span className="text-danger" style={{ fontSize: "11px", marginTop: "0" }}>{error}</span>}
            </div>
        </div>
    );
};

export default RowFormSelectField;