import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    MessageCircle,
    Bot,
    Upload,
    Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi, ChatHistoryItem, ChatPendingAction } from '../../lib/api';
import { UploadModal } from '../dashboard/UploadModal';

interface ChatMessageItem {
    id: string;
    role: 'assistant' | 'user';
    text: string;
}

function toChatHistory(messages: ChatMessageItem[]): ChatHistoryItem[] {
    return messages.map((message) => ({
        role: message.role,
        text: message.text,
    }));
}

const defaultChatSuggestions = [
    'Bantu catat pengeluaran',
    'Cara pakai chatbot',
    'Cek fungsi chatbot',
];

const initialChatMessages: ChatMessageItem[] = [
    {
        id: 'assistant-welcome',
        role: 'assistant',
        text: 'Halo, aku bisa bantu jelasin fitur dan bantu siapkan pencatatan pengeluaran dari chat.',
    },
];

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
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(initialChatMessages);
    const [chatInput, setChatInput] = useState('');
    const [chatSuggestions, setChatSuggestions] = useState<string[]>(defaultChatSuggestions);
    const [chatPendingAction, setChatPendingAction] = useState<ChatPendingAction | null>(null);
    const [chatSending, setChatSending] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement | null>(null);

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

    const closeChatbot = useCallback(() => {
        if (location.hash === '#chat') {
            navigate(-1);
            return;
        }

        setChatbotOpen(false);
    }, [location.hash, navigate]);

    const openUploadModal = () => {
        setQuickActionsOpen(false);
        setChatbotOpen(false);
        setUploadModalOpen(true);
    };

    const openChatbot = () => {
        setQuickActionsOpen(false);
        if (location.hash !== '#chat') {
            navigate(`${location.pathname}${location.search}#chat`);
            return;
        }

        setChatbotOpen(true);
    };

    const toggleChatbot = () => {
        setQuickActionsOpen(false);
        if (chatbotOpen) {
            closeChatbot();
            return;
        }

        openChatbot();
    };

    const toggleQuickActions = () => {
        setChatbotOpen(false);
        setQuickActionsOpen((open) => !open);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setQuickActionsOpen(false);
                closeChatbot();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeChatbot]);

    useEffect(() => {
        setMobileMenuOpen(false);
        setQuickActionsOpen(false);
        setChatbotOpen(location.hash === '#chat');
    }, [location.pathname, location.hash]);

    useEffect(() => {
        if (!chatbotOpen || !chatBodyRef.current) {
            return;
        }

        const node = chatBodyRef.current;
        requestAnimationFrame(() => {
            node.scrollTop = node.scrollHeight;
        });
    }, [chatMessages, chatSending, chatPendingAction, chatbotOpen]);

    const appendChatMessage = (role: ChatMessageItem['role'], text: string) => {
        setChatMessages((current) => [
            ...current,
            {
                id: `${role}-${Date.now()}-${current.length}`,
                role,
                text,
            },
        ]);
    };

    const handleSendChat = async (messageText?: string, pendingActionOverride?: ChatPendingAction | null) => {
        const finalMessage = (messageText ?? chatInput).trim();
        if (!finalMessage || chatSending) {
            return;
        }

        const historyBeforeSend = toChatHistory(chatMessages);
        const activePendingAction = pendingActionOverride !== undefined ? pendingActionOverride : null;

        appendChatMessage('user', finalMessage);
        setChatInput('');
        setChatSending(true);

        if (pendingActionOverride === undefined) {
            setChatPendingAction(null);
        }

        if (isDemoMode) {
            setTimeout(() => {
                appendChatMessage('assistant', 'Chatbot belum tersedia di mode demo. Masuk dengan akun biasa supaya aku bisa baca data pengeluaranmu.');
                setChatSuggestions(defaultChatSuggestions);
                setChatSending(false);
            }, 250);
            return;
        }

        try {
            const result = await chatApi.sendMessage(finalMessage, historyBeforeSend, activePendingAction);

            if (result.success && result.data) {
                appendChatMessage('assistant', result.data.reply);
                setChatPendingAction(result.data.pending_action || null);
                setChatSuggestions(result.data.suggested_prompts?.length ? result.data.suggested_prompts : defaultChatSuggestions);
            } else {
                appendChatMessage('assistant', result.error || 'Tadi ada gangguan kecil. Coba ulangi pesanmu sebentar lagi ya.');
            }
        } catch (error) {
            console.error('Chat send failed:', error);
            appendChatMessage('assistant', 'Koneksi chat lagi goyang sedikit. Kirim lagi pesannya ya.');
        } finally {
            setChatSending(false);
        }
    };

    const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await handleSendChat();
    };

    return (
        <div className="layout-container">
            {/* ===== DESKTOP SIDEBAR (≥768px) ===== */}
            <aside className="layout-desktop-sidebar">
                {/* Logo */}
                <div className="sidebar-logo-section">
                    <img
                        src="/Logotrans-Teratai.webp"
                        alt="Kampung Jati"
                        className="sidebar-logo-image"
                    />
                        <span className="sidebar-logo-text">Kampung Jati</span>
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
                            alt="Kampung Jati"
                            className="layout-mobile-header-logo-img"
                        />
                        <span className="layout-mobile-header-title">Kampung Jati</span>
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
                                    alt="Kampung Jati"
                                    className="layout-mobile-drawer-logo"
                                />
                                <span className="layout-mobile-header-title">Kampung Jati</span>
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
            <div className="layout-desktop-fab-wrapper">
                {quickActionsOpen && (
                    <>
                        <button
                            className="layout-quick-actions-backdrop"
                            aria-label="Tutup menu cepat"
                            onClick={() => setQuickActionsOpen(false)}
                        />
                        <div className="layout-quick-actions-menu" role="menu">
                            <button
                                type="button"
                                className="layout-quick-action-item"
                                onClick={openUploadModal}
                                role="menuitem"
                            >
                                <span className="layout-quick-action-icon layout-quick-action-icon-upload">
                                    <Upload />
                                </span>
                                <span className="layout-quick-action-text">
                                    <strong>Upload Struk</strong>
                                    <small>Scan foto atau PDF</small>
                                </span>
                            </button>
                            <button
                                type="button"
                                className="layout-quick-action-item"
                                onClick={openChatbot}
                                role="menuitem"
                            >
                                <span className="layout-quick-action-icon layout-quick-action-icon-chat">
                                    <MessageCircle />
                                </span>
                                <span className="layout-quick-action-text">
                                    <strong>Chatbot</strong>
                                    <small>Tanya soal keuangan</small>
                                </span>
                            </button>
                        </div>
                    </>
                )}
                <button
                    onClick={toggleQuickActions}
                    className={`layout-desktop-fab ${quickActionsOpen ? 'layout-desktop-fab-open' : ''}`}
                    aria-label="Buka menu tambah"
                    aria-expanded={quickActionsOpen}
                >
                    <Plus className="layout-fab-icon" strokeWidth={2.5} />
                </button>
            </div>

            {!chatbotOpen && (
                <button
                    type="button"
                    className="layout-mobile-chat-fab"
                    aria-label="Buka chatbot"
                    aria-expanded={false}
                    onClick={toggleChatbot}
                >
                    <MessageCircle className="layout-chat-fab-icon" />
                </button>
            )}

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
                        onClick={openUploadModal}
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

            {chatbotOpen && (
                <div className="layout-chatbot-panel" role="dialog" aria-label="Chatbot keuangan">
                    <div className="layout-chatbot-header">
                        <div className="layout-chatbot-title">
                            <span className="layout-chatbot-avatar">
                                <Bot />
                            </span>
                            <div className="layout-chatbot-title-copy">
                                <p>Asisten Kampung Jati</p>
                                <span>Teman ngobrol soal pengeluaran harian</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="layout-chatbot-close"
                            onClick={closeChatbot}
                            aria-label="Tutup chatbot"
                        >
                            <X />
                        </button>
                    </div>
                    <div className="layout-chatbot-status">
                        <span className="layout-chatbot-status-dot" />
                        <span>Mode preview aktif</span>
                    </div>
                    <div className="layout-chatbot-body" ref={chatBodyRef}>
                        <div className="layout-chatbot-intro-card">
                            <p className="layout-chatbot-intro-title">Bisa bantu apa?</p>
                            <div className="layout-chatbot-suggestion-list">
                                {chatSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        className="layout-chatbot-suggestion-chip"
                                        onClick={() => handleSendChat(suggestion)}
                                        disabled={chatSending}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {chatMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`layout-chatbot-message-row ${message.role === 'assistant' ? 'layout-chatbot-message-row-bot' : 'layout-chatbot-message-row-user'}`}
                            >
                                <span className="layout-chatbot-message-badge">
                                    {message.role === 'assistant' ? 'Asisten' : 'Kamu'}
                                </span>
                                <div
                                    className={`layout-chatbot-message ${message.role === 'assistant' ? 'layout-chatbot-message-bot' : 'layout-chatbot-message-user'}`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {chatSending && (
                            <div className="layout-chatbot-message-row layout-chatbot-message-row-bot">
                                <span className="layout-chatbot-message-badge">Asisten</span>
                                <div className="layout-chatbot-message layout-chatbot-message-bot layout-chatbot-message-loading">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}
                        {chatPendingAction && (
                            <div className="layout-chatbot-confirm-card">
                                <p className="layout-chatbot-confirm-title">Konfirmasi pencatatan</p>
                                <div className="layout-chatbot-confirm-grid">
                                    <span>Toko</span>
                                    <strong>{chatPendingAction.draft.toko || '-'}</strong>
                                    <span>Jumlah</span>
                                    <strong>Rp{Math.round(chatPendingAction.draft.amount).toLocaleString('id-ID')}</strong>
                                    <span>Tanggal</span>
                                    <strong>{chatPendingAction.draft.expense_date}</strong>
                                    <span>Kategori</span>
                                    <strong>{chatPendingAction.draft.category_name}</strong>
                                </div>
                                {chatPendingAction.draft.description && (
                                    <p className="layout-chatbot-confirm-note">{chatPendingAction.draft.description}</p>
                                )}
                                <div className="layout-chatbot-confirm-actions">
                                    <button
                                        type="button"
                                        className="layout-chatbot-confirm-secondary"
                                        onClick={() => handleSendChat('Batal dulu', chatPendingAction)}
                                        disabled={chatSending}
                                    >
                                        Tidak jadi
                                    </button>
                                    <button
                                        type="button"
                                        className="layout-chatbot-confirm-primary"
                                        onClick={() => handleSendChat('Ya, catat', chatPendingAction)}
                                        disabled={chatSending}
                                    >
                                        Ya, catat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <form className="layout-chatbot-input-row" onSubmit={handleChatSubmit}>
                        <div className="layout-chatbot-input-shell">
                            <input
                                className="layout-chatbot-input"
                                placeholder="Tulis pertanyaan kamu di sini..."
                                value={chatInput}
                                onChange={(event) => setChatInput(event.target.value)}
                                disabled={chatSending}
                            />
                            <button
                                type="submit"
                                className="layout-chatbot-send"
                                disabled={chatSending || !chatInput.trim()}
                                aria-label="Kirim pesan"
                            >
                                <Send />
                            </button>
                        </div>
                        <p className="layout-chatbot-input-hint">
                            Kamu bisa tanya fitur atau kirim detail pengeluaran untuk disiapkan pencatatannya.
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Layout;
