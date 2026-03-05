export const transhipmentOption = [
    { value: "E", label: "Export" },
    { value: "I", label: "Import" },
    // { value: "T", label: "Transhipment" },
];

export const fromLocationOption = [
    { value: "LOC/61", label: "Blue Gate In (Admission)" },
    { value: "LOC/10", label: "Green Gate In (Admission)" },
    { value: "LOC/99", label: "Yellow Gate In (Admission)" },
    { value: "DPEGATEIN", label: "DPE Gate IN" },
];


export const fromLocationGateInOption = [
    // { value: "LOC/61", label: "Blue Gate In (Admission)" },
    // { value: "LOC/10", label: "Green Gate In (Admission)" },
    // { value: "LOC/99", label: "Yellow Gate In (Admission)" },
    { value: "LOC/201", label: "DPE Gate IN" },
];

export const fromLocationGateOutOption = [
    // { value: "LOC/61", label: "Blue Gate In (Admission)" },
    // { value: "LOC/10", label: "Green Gate In (Admission)" },
    // { value: "LOC/99", label: "Yellow Gate In (Admission)" },
    { value: "LOC/202", label: "DPE Gate Out" },
];

export const containerStatusOption = [
    { value: "20,Load", label: "20 Feet Load" },
    { value: "20,Empty", label: "20 Feet Empty" },
    { value: "40,Load", label: "40 Feet Load" },
    { value: "40,Empty", label: "40 Feet Empty" },
    { value: "Above 40,Load", label: "Above 40 Feet Load" },
    { value: "Above 40,Empty", label: "Above 40 Feet Empty" },
];


export const gateInContainerOption = [
    { value: "20,Load", label: "20 Feet Load" }, 
    { value: "40,Load", label: "40 Feet Load" }, 
    { value: "Above 40,Load", label: "Above 40 Feet Load" }, 
];
export const icdFcsOption = [
    { value: "C", label: "CFS" },
    { value: "I", label: "ICD" },
    { value: "F", label: "FCS" },
    { value: "N", label: "None" }
];
export const statusOption = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
];
export const gateInOption = [
    { value: "Road", label: "By Road" },
    { value: "Rail", label: "By Rail" },
];
export const securityOption = [
    { value: "I", label: "Inside" },
    { value: "O", label: "Outside" },
];
export const voyageOption = [
    { value: "F", label: "Foreign" },
    { value: "C", label: "Coastal" }
];