import React, { FC, useEffect, useState } from 'react';
import AppHeader from "@/layouts/AppHeader";
import AppSidebar from "@/layouts/AppSidebar";
import AppContent from "@/layouts/AppContent";
import AppFooter from './AppFooter';
const DefaultLayout: FC = () => {
    const [isToggle, setIsToggle] = useState<boolean>(() => { 
        return localStorage.getItem("sidebarToggle") === "true";
      });
      useEffect(() => {
        console.log("console .log ",isToggle)
        localStorage.setItem("sidebarToggle", String(isToggle));
      }, [isToggle]);
    return (<>
        <AppHeader isToggle={isToggle}  setIsToggle={setIsToggle} />
        <AppSidebar isToggle={isToggle} />
        <AppContent isToggle={isToggle} />
        <AppFooter />
    </>
    );
};

export default DefaultLayout;
