import React from "react";
import "./LoadingFetchLoader.css"
const LoadingFetchLoader: React.FC = () => {
    return <div className="internet-loader-overlay">
        <div className="internet-spinner"></div>
        <div className="mt-2 text-muted" style={{ fontSize: "12px" }}>
            {/* Loading... */}
        </div>
    </div>
};
export default LoadingFetchLoader;
