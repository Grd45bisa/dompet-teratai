import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Settings,
    LogOut,
    X,
    Home,
    List,
    PieChart,
    Plus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UploadModal } from '../dashboard/UploadModal';

// Navigation items for desktop sidebar
const sidebarItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transaksi' },
    { path: '/reports', icon: BarChart3, label: 'Laporan' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

// Navigation items for mobile bottom nav (2 on left, 2 on right of center button)
const mobileNavLeft = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: List, label: 'Transaksi' },
];

const mobileNavRight = [
    { path: '/reports', icon: PieChart, label: 'Laporan' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

export function Layout() {
    const location = useLocation();
    const { signOut, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Demo mode support
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const demoProfile = isDemoMode ? JSON.parse(localStorage.getItem('demo_profile') || '{}') : null;
    const displayProfile = isDemoMode ? demoProfile : user;

    const handleSignOut = async () => {
        if (isDemoMode) {
            // Clear demo data
            localStorage.removeItem('demo_mode');
            localStorage.removeItem('demo_expenses');
            localStorage.removeItem('demo_categories');
            localStorage.removeItem('demo_profile');
            window.location.href = '/login';
        } else {
            await signOut();
        }
    };

    return (
        <div className="layout-container">
            {/* ===== DESKTOP SIDEBAR (≥768px) ===== */}
            <aside className="layout-desktop-sidebar">
                {/* Logo */}
                <div className="sidebar-logo-section">
                    <img
                        src="/Logotrans-Teratai.webp"
                        alt="Dompet Teratai"
                        className="sidebar-logo-image"
                    />
                    <span className="sidebar-logo-text">
                        <span className="sidebar-logo-text-primary">Dompet</span> Teratai
                    </span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                            >
                                <item.icon className="sidebar-nav-item-icon" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="sidebar-user-section">
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-avatar">
                            {displayProfile?.avatar_url ? (
                                <img
                                    src={displayProfile.avatar_url}
                                    alt="Avatar"
                                    className="sidebar-user-avatar-img"
                                />
                            ) : (
                                <span className="sidebar-user-avatar-text">
                                    {displayProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="sidebar-user-details">
                            <p className="sidebar-user-name">
                                {displayProfile?.full_name || 'User'}
                            </p>
                            <p className="sidebar-user-business">
                                {displayProfile?.business_type || 'Business'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="sidebar-logout-btn"
                    >
                        <LogOut className="sidebar-nav-item-icon" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* ===== MOBILE HEADER (<768px) ===== */}
            <header className="layout-mobile-header">
                <div className="layout-mobile-header-content">
                    <div className="layout-mobile-header-logo">
                        <img
                            src="/Logotrans-Teratai.webp"
                            alt="Dompet Teratai"
                            className="layout-mobile-header-logo-img"
                        />
                        <span className="layout-mobile-header-title">
                            <span className="sidebar-logo-text-primary">Dompet</span> Teratai
                        </span>
                    </div>
                </div>
            </header>

            {/* ===== MOBILE MENU DRAWER ===== */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="layout-mobile-drawer-overlay"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="layout-mobile-drawer">
                        {/* Drawer Header */}
                        <div className="layout-mobile-drawer-header">
                            <div className="layout-mobile-header-logo">
                                <img
                                    src="/Logotrans-Teratai.webp"
                                    alt="Dompet Teratai"
                                    className="layout-mobile-drawer-logo"
                                />
                                <span className="layout-mobile-header-title">
                                    <span className="sidebar-logo-text-primary">Dompet</span> Teratai
                                </span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="layout-mobile-drawer-close"
                            >
                                <X style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        {/* Drawer Nav */}
                        <nav className="layout-mobile-drawer-nav">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                                    >
                                        <item.icon className="sidebar-nav-item-icon" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Drawer User */}
                        <div className="layout-mobile-drawer-user">
                            <div className="layout-mobile-drawer-user-info">
                                <div className="sidebar-user-avatar">
                                    <span className="sidebar-user-avatar-text">
                                        {displayProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="sidebar-user-details">
                                    <p className="sidebar-user-name">
                                        {displayProfile?.full_name || 'User'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="sidebar-logout-btn"
                            >
                                <LogOut className="sidebar-nav-item-icon" />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ===== MAIN CONTENT ===== */}
            <main className="layout-main">
                <div className="layout-content">
                    <Outlet />
                </div>
            </main>

            {/* ===== DESKTOP FLOATING BUTTON (≥768px) ===== */}
            <button
                onClick={() => setUploadModalOpen(true)}
                className="layout-desktop-fab"
                aria-label="Tambah Pengeluaran"
            >
                <Plus className="layout-fab-icon" strokeWidth={2.5} />
            </button>

            {/* ===== MOBILE BOTTOM NAV WITH CENTER BUTTON (<768px) ===== */}
            <nav className="layout-mobile-bottom-nav">
                <div className="layout-mobile-bottom-nav-content">
                    {/* Left nav items */}
                    {mobileNavLeft.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`layout-mobile-nav-item ${isActive ? 'layout-mobile-nav-item-active' : ''}`}
                            >
                                <Icon className="layout-mobile-nav-icon" />
                                <span className="layout-mobile-nav-label">{item.label}</span>
                            </NavLink>
                        );
                    })}

                    {/* CENTER ADD BUTTON */}
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="layout-mobile-center-fab"
                        aria-label="Tambah Pengeluaran"
                    >
                        <Plus className="layout-fab-icon-lg" strokeWidth={2.5} />
                    </button>

                    {/* Right nav items */}
                    {mobileNavRight.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`layout-mobile-nav-item ${isActive ? 'layout-mobile-nav-item-active' : ''}`}
                            >
                                <Icon className="layout-mobile-nav-icon" />
                                <span className="layout-mobile-nav-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Upload Modal */}
            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
        </div>
    );
}

export default Layout;
