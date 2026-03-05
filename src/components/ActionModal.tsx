import React from "react";
import { Modal, Button, Form, Row } from "react-bootstrap";

interface ModalFormProps {
    show: boolean;
    title: string;
    formData: any;
    errors: any;
    onClose: () => void;
    onSubmit: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
    isSubmitting?: boolean
}

const ActionModal: React.FC<ModalFormProps> = ({ show, title, formData, errors, onClose, onSubmit, onChange, children, isSubmitting }) => {
    return (
        <Modal show={show} onHide={onClose} fullscreen>
            <Modal.Header closeButton className="bg-success">
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <div className="px-4 mx-auto text-bold text-end w-100 ">
                <span className="text-danger mandatorField">
                    (*) Indicates Mandatory Fields.
                </span>
            </div>
            <Modal.Body style={{ position: "relative", minHeight: "200px" }}>
                {isSubmitting && (
                    <div className="d-flex justify-content-center align-items-center"
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            background: "rgba(255, 255, 255, 0.5)",
                            zIndex: 10
                        }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                <Form style={{ opacity: isSubmitting ? 0.5 : 1 }}>
                    <Row className="mb-3">
                        {children}
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" className="btn-sm" onClick={onClose}>Close</Button>
                <Button variant="primary" className="btn-sm d-flex align-items-center justify-content-center" onClick={onSubmit} disabled={isSubmitting} style={{ minWidth: "100px" }}>
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving Changes...
                        </>
                    ) : 'Save Changes'}
                </Button>
            </Modal.Footer>

        </Modal>
    );
};

export default ActionModal;
