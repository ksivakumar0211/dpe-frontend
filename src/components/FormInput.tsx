// import React from "react";
// import { Form } from "react-bootstrap";

// interface FormInputProps {
// label: string;
// name: string;
// type?: string;
// value: string;
// onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// error?: string;
// required?: boolean;
// placeholder?: string;
// }

// const FormInput: React.FC<FormInputProps> = ({
//   label,
//   name,
//   type = "text",
//   value,
//   onChange,
//   error,
//   required = false,
//   placeholder = "",
// }) => {
//   return (
//     <Form.Group controlId={name} className="mb-3">
//       <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
//       <Form.Control
// type={type}
// name={name}
// value={value}
// onChange={onChange}
// isInvalid={!!error}
// required={required}
// placeholder={placeholder || `Enter ${label}`}
//       />
//       {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
//     </Form.Group>
//   );
// };

// export default FormInput;




import React from "react";
import { Col, Form } from "react-bootstrap";

interface FormInputProps {


  inputType?: string;
  inputData?: { [key: string]: string | number };

  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  hasError?: (name: string) => boolean;
  errorMsg?: { [key: string]: string };
  isRequired?: boolean;
  isDefault?: boolean;
  max?: number;
  col?: string;
  row1?: string;
  row2?: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  inputType = "text",
  inputData,
  onChange,
  onBlur,
  handleKeyUp,
  hasError,
  errorMsg,
  required = false,
  isDefault = false,
  max,
  col = "col-",
  row1 = "",
  row2 = "",
  type,
  value,
  error,
  placeholder
}) => {
  return (
    <Form.Group className={`d-flex align-items-center mt-1 ${col}`} as={Col} md="3">
      <div className={row1}>
        <Form.Label className="pe-3 mb-0">
          {label}:
          {required && <span className="text-danger fw-bold">*</span>}
        </Form.Label>
      </div>
      <div className={row2}>
        <Form.Control
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          isInvalid={!!error}
          required={required}
          className="custome-input-height custome-border"
          placeholder={placeholder || `Enter ${label}`}
          style={
            required
              ? {
                fontWeight: "bold",
                backgroundColor: isDefault ? "#e9ecef" : "#eff3a800",
              }
              : {}
          }
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      </div>
    </Form.Group>
  );
};

export default FormInput;
