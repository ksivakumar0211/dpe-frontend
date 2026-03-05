import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          border: "1px solid grey",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem" }}>🚧</div>
        <h1>Protected 404</h1>
        <p>This page does not exist or is restricted.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
