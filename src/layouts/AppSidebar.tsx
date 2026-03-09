import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "react-bootstrap";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { RootState } from "@/store";
import "./AppSidebar.css";
// import { fetchMenu } from "@/store/apiSlice/menuSlice";

interface MenuItem {
  name: string;
  path: string;
  menuNameTree:string;
  menuLinkName:string;
  children?: MenuItem[];
}

interface SidebarProps {
  isToggle: boolean;
}



const Sidebar: React.FC<SidebarProps> = ({ isToggle }) => {
  const menu = useSelector((state: RootState) => state.menu.items, shallowEqual); 
  const location = useLocation();
  const currentPath = location.pathname;

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeMenus, setActiveMenus] = useState<Record<string, boolean>>({});

 
  const toggleMenu = useCallback((path: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));

  }, []);
  const auth = JSON.parse(localStorage.getItem("auth_data") || "null");

  useEffect(() => {
    const openState: Record<string, boolean> = {};
    const activeState: Record<string, boolean> = {};

    const traverse = (
      items: MenuItem[],
      level = 0,
      parentKey = ""
    ): boolean => {
      return items?.some((item, index) => {
        const key = `${parentKey}${level}-${index}-${item?.name}`;
        const selfActive = currentPath === item.menuLinkName;

        let childActive = false;

        if (item.children?.length) {
          childActive = traverse(
            item.children,
            level + 1,
            key + "-"
          );
          if (childActive) openState[key] = true;
        }

        if (selfActive || childActive) {
          activeState[key] = true;
          return true;
        }

        return false;
      });
    };

    traverse(menu);
    setOpenMenus(openState);
    setActiveMenus(activeState);
  }, [currentPath, menu]);



  // 🔁 recursive render
  const renderMenu = (
    items: MenuItem[],
    level = 0,
    parentKey = ""
  ) => (
    <ul className={`menu-level menu-level-${level}`}>
      {items?.map((item, index) => {
        const key = `${parentKey}${level}-${index}-${item?.name}`;
        const hasChildren = !!item?.children?.length;
        const isOpen = openMenus[key];
        const isActive = activeMenus[key];

        return (
          <li key={key}>
            <div
              className={`menu-item ${hasChildren ? "parent" : "child"} ${isActive ? "active" : ""
                }`}
              onClick={() => hasChildren && toggleMenu(key)}
            >
              {hasChildren ? (
                <>
                  <span>{item.menuNameTree}</span>
                  <FontAwesomeIcon
                    icon={isOpen ? faAngleDown : faAngleRight}
                    className="menu-arrow"
                  />
                </>
              ) : (
                <Link to={item?.menuLinkName} className="menu-link">
                  {item?.menuNameTree}
                </Link>
              )}
            </div>

            {hasChildren && (
              <Collapse in={isOpen}>
                <div>
                  {renderMenu(item.children!, level + 1, key + "-")}
                </div>
              </Collapse>
            )}
          </li>
        );
      })}
    </ul>
  );


  return (
    <aside className={`rk_sidebar ${isToggle ? "sidebarToogleCls" : ""}`}>
      <div className="sidebar_fixed">
        <div className="sidebar_logo_container text-center">
          <img src="/public/logo.png" alt="Logo" className="sidebar-logo" />
          <strong className="user-name">
            V.O. Chidambaranar Port Authority
          </strong>
          <p className="user-role">Welcome, {auth?.username}</p>
        </div>

        <div className="sidebar_routes_container">
          {renderMenu(menu)}
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
