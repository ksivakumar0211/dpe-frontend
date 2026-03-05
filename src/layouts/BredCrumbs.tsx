import React from "react";
import { useSelector } from "react-redux";
// import { useAppSelector } from "../store/hooks";

const BreadCrumbs: React.FC = () => {
  const items = useSelector((state:any) => state.breadcrumbs.items);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <a href="/apps/dashboard">Dashboard</a>
        </li>

        {items?.map((item:any, index:number) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={`breadcrumb-item ${isLast ? "active" : ""}`}
              aria-current={isLast ? "page" : undefined}
            >
              {item.path && !isLast ? (
                <a href={item.path}>{item.label}</a>
              ) : (
                item.label
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadCrumbs;
