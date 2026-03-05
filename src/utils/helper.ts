import { StylesConfig } from 'react-select';

export const customSelectOption: StylesConfig = {
    control: (base, state) => ({
        ...base,
        height: 'calc(1em + .50rem + 2px)',
        minHeight: 'calc(1em + .50rem + 2px)',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0',
        minWidth: '40%',
        boxSizing: 'border-box',
        backgroundColor: state.isDisabled ? '#e9ecef' : '#6ee9a4',
        color: state.isDisabled ? '#6ee9a4' : 'black',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 9px',
        justifyContent: 'flex-start',
        height: '130%',
        boxSizing: 'border-box',
        minWidth: '40%',
        fontSize: '11px',
        fontWeight: 'bold',
    }),
    singleValue: (base) => ({
        ...base,
        minWidth: '80%',
        margin: '0',
        textAlign: 'left',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: '13px',
        alignItems: 'end',
        padding: '0',
        height: '40%',
        display: 'flex',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'black',
        fontSize: '5px',
        padding: '0px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),
    menu: (base) => ({
        ...base,
        fontSize: '11px',
        whiteSpace: 'nowrap',
        width: 'auto',
        minWidth: '80%',
        maxWidth: '250px',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '13px',
        backgroundColor: state.isDisabled ? '#d3d3d3' : state.isSelected ? '#6ee9a4' : 'white',
        color: 'black',
    }),
    input: (base) => ({
        ...base,
        fontSize: '11px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
};


export const customSelectOption1: StylesConfig = {
    control: (base, state) => ({
        ...base,
        height: 'calc(2em + .50rem + 2px)',
        minHeight: 'calc(1em + .50rem + 2px)',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0',
        minWidth: '80%',
        boxSizing: 'border-box',
        // backgroundColor: state.isDisabled ? '#e9ecef' : '#6ee9a4',
        color: state.isDisabled ? '#6ee9a4' : 'black',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 9px',
        justifyContent: 'flex-start',
        height: '130%',
        boxSizing: 'border-box',
        minWidth: '40%',
        fontSize: '11px',
        fontWeight: 'bold',
    }),
    singleValue: (base) => ({
        ...base,
        // minWidth: '%',
        margin: '0',
        textAlign: 'left',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }),
    placeholder: (base) => ({
        ...base,
        fontSize: '13px',
        alignItems: 'end',
        padding: '0',
        height: '40%',
        display: 'flex',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: 'black',
        fontSize: '5px',
        padding: '0px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),
    menu: (base) => ({
        ...base,
        fontSize: '11px',
        whiteSpace: 'nowrap',
        width: 'auto',
        minWidth: '100%',
        maxWidth: '100%',
    }),
    option: (base, state) => ({
        ...base,
        fontSize: '13px',
        backgroundColor: state.isDisabled ? '#d3d3d3' : state.isSelected ? '#6ee9a4' : 'white',
        color: 'black',
    }),
    input: (base) => ({
        ...base,
        fontSize: '11px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
};


export const SelectOption: StylesConfig = {
    ...customSelectOption,
    menuList: (provided) => ({
        ...provided,
        maxHeight: '110px',
        overflowY: 'auto',
    }),
};


export const rowSelectdOption: StylesConfig = {
    ...customSelectOption,
    menuList: (provided) => ({
        ...provided,
        maxHeight: '200px',
        overflowY: 'auto',
    }),
};

export interface Column {
    key: string;
    label: string;
    order: number;
    isActive: boolean;
  }