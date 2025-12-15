import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet, Loader2, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100/api';

/**
 * LoginPage - Redirect-based Google OAuth with Demo Access
 */
export function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading } = useAuth();
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for error from OAuth callback
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            const errorMessages: Record<string, string> = {
                oauth_denied: 'Login dibatalkan',
                no_code: 'Gagal mendapatkan kode dari Google',
                callback_failed: 'Gagal memproses login',
                auth_failed: 'Autentikasi gagal',
                no_token: 'Token tidak ditemukan',
            };
            setError(errorMessages[errorParam] || 'Terjadi kesalahan');
        }
    }, [searchParams]);

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    // Redirect to backend for Google OAuth
    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleDemoAccess = () => {
        setIsDemoLoading(true);
        localStorage.setItem('demo_mode', 'true');

        const demoExpenses = [
            {
                id: 'demo-1',
                user_id: 'demo',
                category_id: 'cat-1',
                amount: 150000,
                description: 'Belanja bahan makanan',
                expense_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                category: { id: 'cat-1', name: 'Makanan & Minuman', color: '#E91E63' },
            },
            {
                id: 'demo-2',
                user_id: 'demo',
                category_id: 'cat-2',
                amount: 50000,
                description: 'Bensin motor',
                expense_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                category: { id: 'cat-2', name: 'Transportasi', color: '#2196F3' },
            },
        ];

        const demoCategories = [
            { id: 'cat-1', name: 'Makanan & Minuman', color: '#E91E63', is_default: true },
            { id: 'cat-2', name: 'Transportasi', color: '#2196F3', is_default: true },
            { id: 'cat-3', name: 'Belanja', color: '#FF9800', is_default: true },
            { id: 'cat-4', name: 'Tagihan', color: '#9C27B0', is_default: true },
        ];

        const demoProfile = {
            id: 'demo',
            full_name: 'User Demo',
            business_type: 'UMKM Demo',
            onboarding_completed: true,
        };

        localStorage.setItem('demo_expenses', JSON.stringify(demoExpenses));
        localStorage.setItem('demo_categories', JSON.stringify(demoCategories));
        localStorage.setItem('demo_profile', JSON.stringify(demoProfile));

        setTimeout(() => {
            navigate('/dashboard');
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgSoft dark:bg-darkBg">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-bgSoft to-primary-light/20 dark:from-darkBg dark:via-darkBg dark:to-primary-dark/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Expense<span className="text-primary">Tracker</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Catat pengeluaran UMKM Anda dengan mudah
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-darkCard rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isDemoLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Masuk dengan Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-sm text-gray-400">atau</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Demo Access Button */}
                    <button
                        onClick={handleDemoAccess}
                        disabled={isDemoLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors disabled:opacity-50"
                    >
                        {isDemoLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        Coba Demo
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Mode demo menggunakan data contoh, tidak tersimpan
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    © 2024 ExpenseTracker. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
