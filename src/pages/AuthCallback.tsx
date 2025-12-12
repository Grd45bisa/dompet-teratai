import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken } from '../lib/api';

/**
 * OAuth Callback Page
 * Handles the redirect from backend after Google OAuth
 */
export function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login?error=' + error, { replace: true });
            return;
        }

        if (token) {
            // Save token and redirect to dashboard or complete profile
            setToken(token);

            // Fetch user to check onboarding status
            fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        localStorage.setItem('expense_tracker_user', JSON.stringify(data.data));

                        // Use window.location.href for full page reload
                        // This ensures AuthContext loads fresh user data
                        if (data.data.onboarding_completed) {
                            window.location.href = '/dashboard';
                        } else {
                            window.location.href = '/complete-profile';
                        }
                    } else {
                        navigate('/login?error=auth_failed', { replace: true });
                    }
                })
                .catch(() => {
                    navigate('/login?error=auth_failed', { replace: true });
                });
        } else {
            navigate('/login?error=no_token', { replace: true });
        }
    }, [navigate, searchParams]);

    return (
        <div className="auth-callback-container">
            <Loader2 className="auth-callback-spinner" />
            <p className="auth-callback-text">
                Memproses login...
            </p>
        </div>
    );
}

export default AuthCallback;
