import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth Callback Page
 * Handles the redirect from backend after Google OAuth
 */
export function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { completeLogin } = useAuth();

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
                cache: 'no-store',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        completeLogin(data.data);

                        if (data.data.onboarding_completed) {
                            navigate('/dashboard', { replace: true });
                        } else {
                            navigate('/complete-profile', { replace: true });
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
    }, [completeLogin, navigate, searchParams]);

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
