import React, { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import "./AdvancedFilter.css"
interface PreferencesProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
}

const AdvancedFilter: React.FC<PreferencesProps> = ({
    isOpen,
    onClose,
    children
}) => {
    ;

    const handleSave = () => {
        // setItemsPerPage(tempItemsPerPage);
        // setSelectedColumns(tempSelectedColumns);
        // onClose();
    };

    return (
        <> 
            <motion.div
                initial={{ x: 300 }}
                animate={{ x: isOpen ? 0 : -300 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`preferences-panel ${isOpen ? 'visible' : 'hidden'}`}
            >
                <div className="preferences-content ">
                    <h5>Advanced Filter</h5>
                    <div className="advanced-search-container shadow-lg p-4" style={{
                        border: "1px solid"
                    }}> 
                        {children}
                        <div className="preferences-buttons">
                            <button className="cbtn-sm cbtn-c" onClick={onClose}>Cancel</button>
                            <button className="cbtn-sm cbtn-s" onClick={handleSave}>Save</button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </>
    );
};

export default AdvancedFilter;
