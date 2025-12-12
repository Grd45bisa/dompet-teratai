import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Check if in demo mode
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    // Show loading spinner while checking auth
    if (loading && !isDemoMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgSoft dark:bg-darkBg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Allow access if in demo mode
    if (isDemoMode) {
        return <>{children}</>;
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but onboarding not complete → redirect to complete-profile
    if (!user.onboarding_completed && location.pathname !== '/onboarding') {
        return <Navigate to="/complete-profile" replace />;
    }

    // All good → render children
    return <>{children}</>;
}

export default ProtectedRoute;
