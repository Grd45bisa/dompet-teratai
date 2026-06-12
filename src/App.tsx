import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Main app shell and pages - lazy loaded to keep auth flow light
const Layout = lazy(() => import('./components/layout/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Auth pages - lazy loaded (only needed once)
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Loading fallback component
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bgSoft dark:bg-darkBg">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Memuat...</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />

                                {/* Semi-protected routes */}
                                <Route path="/complete-profile" element={<CompleteProfile />} />
                                <Route path="/onboarding" element={<Onboarding />} />

                                {/* Protected routes with Layout */}
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <SocketProvider>
                                                <Layout />
                                            </SocketProvider>
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="transactions" element={<Transactions />} />
                                    <Route path="expenses" element={<Transactions />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="categories" element={<Settings />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>

                                {/* Catch-all redirect */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </ToastProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
