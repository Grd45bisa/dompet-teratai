import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Play, CheckCircle2, Camera, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Features list
const FEATURES = [
    {
        icon: Camera,
        title: 'Foto Struk',
        desc: 'Foto struk, AI isi otomatis'
    },
    {
        icon: BarChart3,
        title: 'Laporan Lengkap',
        desc: 'Grafik & export ke PDF/Excel'
    },
    {
        icon: Shield,
        title: 'Aman & Gratis',
        desc: 'Data tersimpan aman, gratis selamanya'
    },
];

export function Login() {
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

    // Handle redirect after auth
    useEffect(() => {
        if (!loading && user) {
            if (user.onboarding_completed) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/complete-profile', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    // Redirect to backend for Google OAuth
    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleDemoAccess = () => {
        setIsDemoLoading(true);
        localStorage.setItem('demo_mode', 'true');

        const today = new Date();
        const demoExpenses = [
            {
                id: 'demo-1',
                user_id: 'demo',
                category_id: 'cat-1',
                amount: 150000,
                description: 'Belanja bahan makanan',
                expense_date: today.toISOString().split('T')[0],
                created_at: today.toISOString(),
                category: { id: 'cat-1', name: 'Makanan & Minuman', color: '#E91E63' },
            },
            {
                id: 'demo-2',
                user_id: 'demo',
                category_id: 'cat-2',
                amount: 50000,
                description: 'Bensin motor',
                expense_date: today.toISOString().split('T')[0],
                created_at: today.toISOString(),
                category: { id: 'cat-2', name: 'Transportasi', color: '#2196F3' },
            },
            {
                id: 'demo-3',
                user_id: 'demo',
                category_id: 'cat-3',
                amount: 250000,
                description: 'Stok dagangan',
                expense_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                created_at: new Date(Date.now() - 86400000).toISOString(),
                category: { id: 'cat-3', name: 'Belanja', color: '#FF9800' },
            },
            {
                id: 'demo-4',
                user_id: 'demo',
                category_id: 'cat-4',
                amount: 100000,
                description: 'Bayar listrik',
                expense_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                created_at: new Date(Date.now() - 172800000).toISOString(),
                category: { id: 'cat-4', name: 'Tagihan', color: '#9C27B0' },
            },
            {
                id: 'demo-5',
                user_id: 'demo',
                category_id: 'cat-1',
                amount: 35000,
                description: 'Makan siang',
                expense_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                created_at: new Date(Date.now() - 259200000).toISOString(),
                category: { id: 'cat-1', name: 'Makanan & Minuman', color: '#E91E63' },
            },
        ];

        const demoCategories = [
            { id: 'cat-1', name: 'Makanan & Minuman', color: '#E91E63', is_default: true },
            { id: 'cat-2', name: 'Transportasi', color: '#2196F3', is_default: true },
            { id: 'cat-3', name: 'Belanja', color: '#FF9800', is_default: true },
            { id: 'cat-4', name: 'Tagihan', color: '#9C27B0', is_default: true },
            { id: 'cat-5', name: 'Hiburan', color: '#00BCD4', is_default: true },
            { id: 'cat-6', name: 'Kesehatan', color: '#F44336', is_default: true },
            { id: 'cat-7', name: 'Lainnya', color: '#757575', is_default: true },
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
            <div className="login-loading-container">
                <div className="login-loading-content">
                    <img
                        src="/Logotrans-Teratai.webp"
                        alt="Dompet Teratai"
                        className="login-loading-logo"
                    />
                    <Loader2 className="login-loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            {/* Desktop Layout */}
            <div className="login-desktop-layout">
                {/* Left Panel - Branding */}
                <div className="login-branding-panel">
                    <div>
                        {/* Logo */}
                        <div className="login-logo-section">
                            <img
                                src="/Logotrans-Teratai.webp"
                                alt="TERATAI"
                                className="login-logo-image"
                            />
                            <div>
                                <span className="login-logo-text"><span className="login-logo-text-primary">Dompet</span> Teratai</span>
                                <p className="login-logo-subtitle">Expense Tracker</p>
                            </div>
                        </div>

                        {/* Main Text */}
                        <div className="login-main-text">
                            <h1 className="login-headline">
                                Catat Pengeluaran, Kelola Keuangan
                            </h1>
                            <p className="login-description">
                                Aplikasi untuk mencatat keuangan usaha dan pribadi.<br></br>
                                Sederhana, mudah digunakan, cocok untuk semua kalangan.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="login-features-list">
                            {FEATURES.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={index} className="login-feature-item">
                                        <div className="login-feature-icon-wrapper">
                                            <IconComponent className="login-feature-icon" />
                                        </div>
                                        <div>
                                            <h3 className="login-feature-title">{feature.title}</h3>
                                            <p className="login-feature-desc">{feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="login-footer-text">
                        © {new Date().getFullYear()} Dompet Teratai. Dikhususkan untuk UMKM Desa Teratai Asri Legok Permai
                    </p>
                </div>

                {/* Right Panel - Login Form */}
                <div className="login-form-panel">
                    <div className="login-form-container">
                        <h2 className="login-form-title">
                            Selamat Datang
                        </h2>
                        <p className="login-form-subtitle">
                            Masuk untuk mulai mencatat pengeluaran Anda
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div className="login-error-message">
                                {error}
                            </div>
                        )}

                        {/* Google Sign In Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="login-google-btn"
                        >
                            <svg className="login-google-icon" viewBox="0 0 24 24">
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
                        <div className="login-divider">
                            <div className="login-divider-line" />
                            <span className="login-divider-text">atau</span>
                            <div className="login-divider-line" />
                        </div>

                        {/* Demo Access Button */}
                        <button
                            onClick={handleDemoAccess}
                            disabled={isDemoLoading}
                            className="login-demo-btn"
                        >
                            {isDemoLoading ? (
                                <Loader2 className="login-demo-icon animate-spin" />
                            ) : (
                                <>
                                    <Play className="login-demo-icon" />
                                    <span>Coba Demo Dulu</span>
                                </>
                            )}
                        </button>
                        <p className="login-demo-hint">
                            Lihat contoh aplikasi tanpa perlu login
                        </p>

                        {/* Terms */}
                        <p className="login-terms-text">
                            Dengan masuk, Anda menyetujui{' '}
                            <a href="#" className="login-terms-link">Syarat & Ketentuan</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="login-mobile-layout">
                {/* Header */}
                <div className="login-mobile-header">
                    <img
                        src="/Logotrans-Teratai.webp"
                        alt="Dompet Teratai"
                        className="login-mobile-logo"
                    />
                    <h1 className="login-mobile-title">
                        <span className="login-logo-text-primary">Dompet</span> Teratai
                    </h1>
                    <p className="login-mobile-tagline">
                        Teknologi Ekonomi Rakyat Aplikasi Transaksi Akurat Indonesia
                    </p>
                    <p className="login-mobile-hint">
                        Catat keuangan dengan mudah & gratis
                    </p>
                </div>

                {/* Main Content */}
                <div className="login-mobile-content">
                    {/* Error Message */}
                    {error && (
                        <div className="login-error-message">
                            {error}
                        </div>
                    )}

                    {/* Features */}
                    <div className="login-mobile-features">
                        {FEATURES.map((feature, index) => (
                            <div key={index} className="login-mobile-feature-item">
                                <CheckCircle2 className="login-mobile-feature-icon" />
                                <span className="login-mobile-feature-text">{feature.title} - {feature.desc}</span>
                            </div>
                        ))}
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="login-google-btn"
                    >
                        <svg className="login-google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Masuk dengan Google
                    </button>

                    {/* Divider */}
                    <div className="login-divider">
                        <div className="login-divider-line" />
                        <span className="login-divider-text">atau</span>
                        <div className="login-divider-line" />
                    </div>

                    {/* Demo Access Button */}
                    <button
                        onClick={handleDemoAccess}
                        disabled={isDemoLoading}
                        className="login-demo-btn"
                    >
                        {isDemoLoading ? (
                            <Loader2 className="login-demo-icon animate-spin" />
                        ) : (
                            <>
                                <Play className="login-demo-icon" />
                                Coba Demo
                            </>
                        )}
                    </button>
                    <p className="login-demo-hint">
                        Tanpa perlu login
                    </p>
                </div>

                {/* Footer */}
                <div className="login-mobile-footer">
                    <p className="login-mobile-terms">
                        Dengan masuk, Anda menyetujui Syarat & Ketentuan
                    </p>
                    <p className="login-mobile-copyright">
                        © 2024 Dompet Teratai
                    </p>
                </div>
            </div>
        </div >
    );
}

export default Login;
