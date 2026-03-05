// import React, { ReactNode } from "react";
// import { Navigate } from "react-router-dom";

// interface AuthRouteProps {
//   children: ReactNode;
// }

// const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
//   const isAuthenticated = false; 
//   return isAuthenticated ? children : <Navigate to="/" />;
// };

// export default AuthRoute;


import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const AuthRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) { 
    return <Navigate to="/" replace />;  
  }
  return <>{children}</>;
};

export default AuthRoute;

