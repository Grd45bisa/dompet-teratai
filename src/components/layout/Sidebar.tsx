import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    FolderTree,
    Settings,
    LogOut,
    BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transaksi' },
    { path: '/categories', icon: FolderTree, label: 'Kategori' },
    { path: '/reports', icon: BarChart3, label: 'Laporan' },
    { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { signOut, user } = useAuth();

    // Demo mode support
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const demoProfile = isDemoMode ? JSON.parse(localStorage.getItem('demo_profile') || '{}') : null;
    const displayProfile = isDemoMode ? demoProfile : user;

    const handleSignOut = async () => {
        if (isDemoMode) {
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
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="flex flex-col" style={{ height: '100%' }}>
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
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
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
                                <span className="sidebar-user-avatar-text">
                                    {displayProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
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
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
