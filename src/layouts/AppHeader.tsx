import React, { useEffect, useState } from "react";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faBell,
    faUser,
    faMoon,
    faSun,
    faGlobe,
    faExpand,
    faCompress,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import BredCrumbs from "./BredCrumbs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface HeaderProps<T = any> {
    toggleSidebar?: () => void;
    setIsToggle: React.Dispatch<React.SetStateAction<T>>;
    isToggle: boolean;
}

const Header: React.FC<HeaderProps> = ({ setIsToggle, isToggle }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState("en");
    const navigate = useNavigate();
    const handleProfileClick = () => setShowProfileModal(true);
    const handleCloseProfileModal = () => setShowProfileModal(false); 
    const logout = (e:any) => {
        e.preventDefault()
        localStorage.clear()
        toast.success("Logout Successfully", { position: "top-right", autoClose: 6000 });
        navigate("/login"); 
    };
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode', !isDarkMode);
    };
    const changeLanguage = (lang: string) => setLanguage(lang);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const handleNotificationClick = async () => {
        try {
            if (document.fullscreenElement) { 
                await document.exitFullscreen();
                setIsFullscreen(false);
            } else { 
                const docElem = document.documentElement as HTMLElement & {
                    mozRequestFullScreen?: () => Promise<void>;
                    webkitRequestFullscreen?: () => Promise<void>;
                    msRequestFullscreen?: () => Promise<void>;
                };

                if (docElem.requestFullscreen) {
                    await docElem.requestFullscreen();
                } else if (docElem.mozRequestFullScreen) {
                    await docElem.mozRequestFullScreen();
                } else if (docElem.webkitRequestFullscreen) {
                    await docElem.webkitRequestFullscreen();
                } else if (docElem.msRequestFullscreen) {
                    await docElem.msRequestFullscreen();
                }
                setIsFullscreen(true);
            }
        } catch (error) {
            console.error("Fullscreen toggle failed", error);
        }
    };

    useEffect(() => { 
        document.body.classList.toggle('dark-mode', isDarkMode);
        const sidebar = document.querySelector('.rk_sidebar');
        if (sidebar) {
            sidebar.classList.toggle('dark-mode', isDarkMode);
        } 
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);


    return (
        <div className={`header-container d-flex justify-content-between align-items-center p-3 sticky-header ${isToggle ? "headerToggleContainer" : ""}`}>
            {/* Left Section: Sidebar Toggle + Breadcrumbs */}
            <div className="d-flex align-items-center">
                <button className="sidebar-toggle btn btn-light me-2" onClick={() => setIsToggle(!isToggle)}>
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button> 
                <BredCrumbs />

            </div> 
            <div className="d-flex align-items-center">

                <div className="theme-toggle me-3" onClick={toggleTheme}>
                    <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} size="lg" className="text-primary" />
                </div>
                <div className="notification me-3" onClick={handleNotificationClick} style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} size="lg" className="text-primary" />
                </div>

                <Dropdown align="end" >
                    <Dropdown.Toggle style={{ backgroundColor: "#2343" }} id="dropdown-profile" className="profile-dropdown-toggle">
                        <FontAwesomeIcon icon={faUser} size="lg" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleProfileClick} className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faUser} />
                            <span>Profile</span>
                        </Dropdown.Item>

                        <Dropdown.Item
                            onClick={(e) => logout(e)}
                            className="d-flex align-items-center gap-2 text-danger"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} />
                            <span>Logout</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>

                </Dropdown>
            </div>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>User profile details...</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseProfileModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Header;
