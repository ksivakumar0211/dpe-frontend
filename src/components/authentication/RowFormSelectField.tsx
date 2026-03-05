import React, { useState } from "react";
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
    value: string ;
    onChange: (selectedOption: OptionType | null, name: string) => void;
    isEdit?: boolean;
    error?: string;
    required?: boolean;
    isLoading?: boolean;
    pgNo?: number;
    formData?: any;
    onMenuScroll?: (formData: any, pgNo?: number) => void;
    col?: string;
    isTrue?: boolean;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    childCol?: string;
    chiCol?: string;
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
    col = "col-md-3",
    isTrue = false,
    onKeyDown,
    childCol = "col-sm-5 col-4",
    chiCol = "col-sm-7 col-8"
}) => {
    const [copySuccess, setCopySuccess] = useState<string>("");

    return (
        <div className="row pt-2"> 
            <div className="col-sm-9 col-md-12 col-xl-9">

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
                    styles={name === "selectedLoginId" ? rowSelectdOption : customSelectOption1}
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