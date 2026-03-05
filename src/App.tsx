import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingLoader from './components/LoadingLoader';
import LoadingFetchLoader from './components/LoadingFetchLoader';

const AuthRoute = lazy(() => import('@/layouts/AuthRoute'));
const DefaultLayout = lazy(() => import('@/layouts/DefaultLayout')); 
const AuthLogin = lazy(() => import('@/pages/authentication/Index'));
// import { persistor } from "./store";
const App: React.FC = () => {
    const isAuthenticated = true;

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
