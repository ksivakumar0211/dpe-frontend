import React, { Suspense, FC } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import routes from '@/router/routes'; 

 
interface appContentProps<T = any> {
  isToggle: boolean;
}
const AppContent: FC<appContentProps> = ({ isToggle }) => {

  return (
    <div className={`rk_content ${isToggle ? "rkToogleContent" : ""}`} id="kt_app_main">
      {/* <BredCrumbs /> */}
      <Suspense
        fallback={
          <div className="w-full h-screen text-gray-300 dark:text-gray-200 bg-base-100">
            Loading...
          </div>
        }
      >
        <Routes>
          {routes.map((route: any, idx: number) => {
            return (
              route.component && (
                <Route
                  key={idx}
                  path={route.url}
                  element={<route.component />}
                />

              )
            );
          })}
          <Route path="/" element={<Navigate to="backend/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>

  );
};

export default AppContent;
