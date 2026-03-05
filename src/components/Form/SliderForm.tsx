import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./SliderForm.css";
import { Column } from "@/utils/helper";
import { Modal, Button, Form, Row } from "react-bootstrap";

interface SettingsModalProps {
    show: boolean;
    title: string;
    errors: any;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
    isSubmitting?: boolean
}

const SliderForm: React.FC<SettingsModalProps> = ({
    show, title, errors, onClose, onSubmit, onChange, children, isSubmitting
}) => {

    console.log('chanfed')


    return (
        <>
            {show && <div className="modal-overlay" onClick={onClose}></div>}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: show ? '0%' : '100%' }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="form-modal"
            >
                <div className="form-modal " style={{ backgroundColor: "ghostwhite" }}>
                    <div className="modalheader d-flex justify-content-between align-items-center">
                        <h5 className="modal-title text-white">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="px-4 mx-auto text-bold text-end w-100 " style={{ backgroundColor: "ghostwhite" }}>
                        <span className="text-danger mandatorField">
                            (*) Indicates Mandatory Fields.
                        </span>
                    </div>
                    <div className="mx-auto px-4 shadow-lg p-4">
                    {children}
                    </div>

                    <div className="modal-footer p-2" style={{ backgroundColor: "ghostwhite" }}>
                        <button type="button" className="btn-sm btn btn-danger mx-2" onClick={onClose} data-bs-dismiss="modal">
                            Close
                        </button>
                        <button className="btn-sm btn btn-primary submit_button mx-2" onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving Changes...
                            </>
                        ) : 'Save Changes'}</button>
                    </div>

                </div>
            </motion.div>
        </>
    );
};

export default SliderForm;
