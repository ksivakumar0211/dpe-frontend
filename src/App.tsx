import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingFetchLoader from './components/LoadingFetchLoader';

const AuthRoute = lazy(() => import('@/layouts/AuthRoute'));
const DefaultLayout = lazy(() => import('@/layouts/DefaultLayout'));
const AuthLogin = lazy(() => import('@/pages/authentication/Index'));
const App: React.FC = () => {
    const isAuthenticated = true;
    useEffect(() => {
        const handleContextMenu = (e: any) => {
            e.preventDefault();
        };
        const handleKeyDown = (e: any) => {
            if (e.key === "F12") {
                e.preventDefault();
            }
            // if ((e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || (e.ctrlKey && e.key === "U")) {
            //     e.preventDefault();
            // }
        };
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    return (
        <Router basename="/apps">
            <Suspense fallback={<LoadingFetchLoader />}>
                <Routes>
                    <Route path="/login" element={<AuthLogin />} />
                    <Route
                        path="*"
                        element={
                            <AuthRoute isAuthenticated={isAuthenticated}>
                                <DefaultLayout />
                            </AuthRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
