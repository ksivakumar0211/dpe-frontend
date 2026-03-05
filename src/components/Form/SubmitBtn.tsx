import React from "react";
interface SubmitBtnProps {
  loading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const SubmitBtn: React.FC<SubmitBtnProps> = ({
  loading,
  disabled,
  children,
  className = "",
  onClick,
  type = "button",
}) => {
  const isLoading = loading && !disabled;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      style={{ position: "relative" }}
    >
      {isLoading && <span className="quad-loader" />}

      <span style={{ visibility: isLoading ? "hidden" : "visible" }}>
        {children}
      </span>
    </button>
  );
};

export default SubmitBtn;
