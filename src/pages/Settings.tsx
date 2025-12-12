import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    Loader2,
    Moon,
    Sun,
    LogOut,
    ChevronRight,
    UserX,
    X,
    Shuffle,
    Check,
    Sparkles,
    Briefcase,
    User,
    Target,
    GraduationCap,
    Laptop,
    Rocket,
    Home,
    Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

// Occupation options with SVG icons
const OCCUPATIONS = [
    { value: 'student', label: 'Pelajar/Mahasiswa', icon: GraduationCap },
    { value: 'employee', label: 'Karyawan', icon: Briefcase },
    { value: 'freelancer', label: 'Freelancer', icon: Laptop },
    { value: 'entrepreneur', label: 'Pengusaha', icon: Rocket },
    { value: 'homemaker', label: 'Ibu Rumah Tangga', icon: Home },
    { value: 'other', label: 'Lainnya', icon: Star },
];

// DiceBear avatar styles
const AVATAR_STYLES = [
    { id: 'thumbs', name: 'Thumbs' },
    { id: 'fun-emoji', name: 'Fun Emoji' },
    { id: 'bottts', name: 'Robots' },
    { id: 'adventurer', name: 'Adventurer' },
    { id: 'big-smile', name: 'Big Smile' },
    { id: 'lorelei', name: 'Lorelei' },
    { id: 'notionists', name: 'Notionists' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'croodles', name: 'Croodles' },
    { id: 'miniavs', name: 'Mini Avatars' },
];

// Generate DiceBear avatar URL
function getDiceBearUrl(style: string, seed: string): string {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

// Generate random seed
function generateRandomSeed(): string {
    return Math.random().toString(36).substring(2, 10);
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function Settings() {
    const navigate = useNavigate();
    const { user, signOut, updateUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Profile state
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [occupation, setOccupation] = useState(user?.occupation || '');
    const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget?.toString() || '500000');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Avatar picker state
    const [previewAvatars, setPreviewAvatars] = useState<{ style: string; seed: string; url: string }[]>([]);
    const [useDefaultAvatar, setUseDefaultAvatar] = useState(!user?.avatar_url);

    // Delete account modal
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [deleteAccountInput, setDeleteAccountInput] = useState('');

    // Generate preview avatars when picker opens
    useEffect(() => {
        if (showAvatarPicker) {
            const seed = user?.id || generateRandomSeed();
            const previews = AVATAR_STYLES.map(style => ({
                style: style.id,
                seed,
                url: getDiceBearUrl(style.id, seed),
            }));
            setPreviewAvatars(previews);
        }
    }, [showAvatarPicker, user?.id]);

    // Update profile form when user changes
    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setOccupation(user.occupation || '');
            setMonthlyBudget(user.monthly_budget?.toString() || '500000');
            setAvatarUrl(user.avatar_url || null);
            setUseDefaultAvatar(!user.avatar_url);
        }
    }, [user]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setAvatarUrl(e.target.result as string);
                    setUseDefaultAvatar(false);
                }
            };
            reader.readAsDataURL(file);
            showToast('info', 'Foto berhasil dipilih');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('error', 'Gagal memuat foto');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDiceBearAvatar = (style: string, seed: string) => {
        const url = getDiceBearUrl(style, seed);
        setAvatarUrl(url);
        setUseDefaultAvatar(false);
    };

    const handleRandomizeAvatars = () => {
        const newSeed = generateRandomSeed();
        const previews = AVATAR_STYLES.map(style => ({
            style: style.id,
            seed: newSeed,
            url: getDiceBearUrl(style.id, newSeed),
        }));
        setPreviewAvatars(previews);
    };

    const handleUseDefaultAvatar = () => {
        setAvatarUrl(null);
        setUseDefaultAvatar(true);
    };

    const handleSaveAvatar = async () => {
        setIsLoading(true);
        try {
            const { error } = await updateUser({ avatar_url: avatarUrl });
            if (error) throw error;
            showToast('success', 'Avatar berhasil diubah');
            setShowAvatarPicker(false);
        } catch (error) {
            showToast('error', 'Gagal menyimpan avatar');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setMonthlyBudget(value);
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const budgetNumber = parseInt(monthlyBudget) || 500000;
            const { error } = await updateUser({
                full_name: fullName,
                occupation: occupation,
                monthly_budget: budgetNumber,
            });

            if (error) throw error;
            showToast('success', 'Profil berhasil disimpan');
            setShowProfileEdit(false);
        } catch (error) {
            showToast('error', 'Gagal menyimpan profil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    const handleDeleteAccount = async () => {
        if (deleteAccountInput !== 'Hapus akun') {
            showToast('error', 'Ketik "Hapus akun" dengan benar untuk konfirmasi');
            return;
        }

        setIsLoading(true);
        try {
            // Import the API
            const { authApi } = await import('../lib/api');
            const result = await authApi.deleteAccount();

            if (result.success) {
                showToast('success', 'Akun berhasil dihapus');
                setShowDeleteAccountModal(false);
                setDeleteAccountInput('');
                // Redirect to login
                navigate('/login', { replace: true });
            } else {
                showToast('error', result.error || 'Gagal menghapus akun');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            showToast('error', 'Gagal menghapus akun');
        } finally {
            setIsLoading(false);
        }
    };

    const getOccupationLabel = () => {
        const occ = OCCUPATIONS.find(o => o.value === occupation);
        return occ ? occ.label : 'Belum diatur';
    };

    return (
        <div className="settings-container">
            {/* Simple Header */}
            <div className="settings-header">
                <h1 className="settings-title">Pengaturan</h1>
                <p className="settings-subtitle">Kelola akun dan preferensi</p>
            </div>

            {/* Profile Section */}
            <div className="settings-card">
                <div className="settings-profile-row">
                    {/* Avatar - Click to open picker */}
                    <div
                        onClick={() => setShowAvatarPicker(true)}
                        className="settings-avatar"
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="settings-avatar-img" />
                        ) : (
                            <span className="settings-avatar-letter">
                                {fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        )}
                        <div className="settings-avatar-overlay">
                            <Camera className="settings-avatar-camera" />
                        </div>
                    </div>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="settings-hidden"
                    />

                    {/* Info */}
                    <div className="settings-profile-info">
                        <h2 className="settings-profile-name">
                            {fullName || 'User'}
                        </h2>
                        <p className="settings-profile-occupation">{getOccupationLabel()}</p>
                        <p className="settings-profile-budget">
                            Budget: Rp {formatCurrency(parseInt(monthlyBudget) || 500000)}/bulan
                        </p>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => setShowProfileEdit(true)}
                        className="settings-profile-edit-btn"
                    >
                        <ChevronRight className="settings-icon-sm" />
                    </button>
                </div>
            </div>

            {/* Appearance - Dark Mode Toggle */}
            <div className="settings-card">
                <div
                    onClick={toggleTheme}
                    className="settings-toggle-row"
                >
                    <div className="settings-toggle-left">
                        <div className={`settings-toggle-icon-wrapper ${isDark ? 'settings-toggle-icon-dark' : 'settings-toggle-icon-light'}`}>
                            {isDark ? (
                                <Moon className="settings-toggle-icon settings-icon-indigo" />
                            ) : (
                                <Sun className="settings-toggle-icon settings-icon-amber" />
                            )}
                        </div>
                        <div>
                            <p className="settings-toggle-title">Mode Gelap</p>
                            <p className="settings-toggle-subtitle">{isDark ? 'Aktif' : 'Nonaktif'}</p>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className={`settings-switch ${isDark ? 'settings-switch-on' : ''}`}>
                        <div className={`settings-switch-thumb ${isDark ? 'settings-switch-thumb-on' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="settings-card settings-card-actions">
                <button
                    onClick={handleLogout}
                    className="settings-action-btn"
                >
                    <div className="settings-action-icon-wrapper">
                        <LogOut className="settings-action-icon" />
                    </div>
                    <span className="settings-action-text">Keluar dari Akun</span>
                </button>

                <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="settings-action-btn settings-action-btn-danger"
                >
                    <div className="settings-action-icon-wrapper settings-action-icon-wrapper-danger">
                        <UserX className="settings-action-icon settings-action-icon-danger" />
                    </div>
                    <span className="settings-action-text">Hapus Akun</span>
                </button>
            </div>

            {/* App Info */}
            <div className="settings-app-info">
                <p className="settings-app-name">ExpenseTracker</p>
                <p className="settings-app-version">Versi 1.0.0</p>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal-backdrop" onClick={() => setShowAvatarPicker(false)} />
                    <div className="settings-modal settings-modal-avatar">
                        <div className="settings-modal-header">
                            <h3 className="settings-modal-title">
                                <Camera className="settings-icon-primary" />
                                Pilih Avatar
                            </h3>
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="settings-modal-close"
                            >
                                <X className="settings-icon-sm" />
                            </button>
                        </div>

                        {/* Preview Current */}
                        <div className="settings-avatar-preview-container">
                            <div className="settings-avatar-preview">
                                {avatarUrl && !useDefaultAvatar ? (
                                    <img src={avatarUrl} alt="Preview" className="settings-avatar-preview-img" />
                                ) : (
                                    <span className="settings-avatar-preview-letter">
                                        {fullName.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Default Avatar Option */}
                        <button
                            onClick={handleUseDefaultAvatar}
                            className={`settings-avatar-option-btn ${useDefaultAvatar ? 'settings-avatar-option-btn-active' : ''}`}
                        >
                            <Sparkles className="settings-icon-sm" />
                            Pakai Huruf Default
                            {useDefaultAvatar && <Check className="settings-icon-sm" />}
                        </button>

                        {/* Randomize Button */}
                        <button
                            onClick={handleRandomizeAvatars}
                            className="settings-avatar-randomize-btn"
                        >
                            <Shuffle className="settings-icon-sm" />
                            Acak Avatar
                        </button>

                        {/* Avatar Grid */}
                        <div className="settings-avatar-grid">
                            {previewAvatars.map((preview) => {
                                const styleInfo = AVATAR_STYLES.find(s => s.id === preview.style);
                                const isSelected = avatarUrl === preview.url && !useDefaultAvatar;
                                return (
                                    <button
                                        key={preview.style}
                                        onClick={() => handleSelectDiceBearAvatar(preview.style, preview.seed)}
                                        className={`settings-avatar-grid-item ${isSelected ? 'settings-avatar-grid-item-selected' : ''}`}
                                    >
                                        <div className="settings-avatar-grid-img-wrapper">
                                            <img
                                                src={preview.url}
                                                alt={styleInfo?.name}
                                                className="settings-avatar-grid-img"
                                            />
                                        </div>
                                        <span className="settings-avatar-grid-name">
                                            {styleInfo?.name}
                                        </span>
                                        {isSelected && (
                                            <div className="settings-avatar-grid-check">
                                                <Check className="settings-avatar-grid-check-icon" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Upload Custom Option */}
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            className="settings-avatar-upload-btn"
                        >
                            <Camera className="settings-icon-sm" />
                            Upload Foto Sendiri
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveAvatar}
                            disabled={isLoading}
                            className="settings-modal-save-btn"
                        >
                            {isLoading ? <Loader2 className="settings-icon-spin" /> : 'Simpan Avatar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {showProfileEdit && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal-backdrop" onClick={() => setShowProfileEdit(false)} />
                    <div className="settings-modal">
                        <div className="settings-modal-header">
                            <div>
                                <h3 className="settings-modal-title">Edit Profil</h3>
                                <p className="settings-modal-subtitle">Perbarui informasi profilmu</p>
                            </div>
                            <button
                                onClick={() => setShowProfileEdit(false)}
                                className="settings-modal-close"
                            >
                                <X className="settings-icon-sm" />
                            </button>
                        </div>

                        <div className="settings-modal-form">
                            {/* Name */}
                            <div className="settings-form-group">
                                <label className="settings-form-label">
                                    <User className="settings-icon-xs" />
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Siapa namamu?"
                                    className="settings-form-input"
                                />
                            </div>

                            {/* Occupation */}
                            <div className="settings-form-group">
                                <label className="settings-form-label">
                                    <Briefcase className="settings-icon-xs" />
                                    Pekerjaan
                                </label>
                                <div className="settings-occupation-grid">
                                    {OCCUPATIONS.map((occ) => {
                                        const IconComponent = occ.icon;
                                        return (
                                            <button
                                                key={occ.value}
                                                onClick={() => setOccupation(occ.value)}
                                                className={`settings-occupation-btn ${occupation === occ.value ? 'settings-occupation-btn-active' : ''}`}
                                            >
                                                <IconComponent className="settings-icon-xs" />
                                                <span className="settings-occupation-label">{occ.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Monthly Budget */}
                            <div className="settings-form-group">
                                <label className="settings-form-label">
                                    <Target className="settings-icon-xs" />
                                    Target Budget Bulanan
                                </label>
                                <div className="settings-budget-input-wrapper">
                                    <span className="settings-budget-prefix">
                                        Rp
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatCurrency(parseInt(monthlyBudget) || 0)}
                                        onChange={handleBudgetChange}
                                        placeholder="500.000"
                                        className="settings-form-input settings-budget-input"
                                    />
                                </div>
                                <p className="settings-form-hint">
                                    <Sparkles className="settings-icon-xs" />
                                    Default Rp 500.000 jika tidak diisi
                                </p>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={isLoading}
                                className="settings-modal-save-btn"
                            >
                                {isLoading ? <Loader2 className="settings-icon-spin" /> : 'Simpan Profil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteAccountModal && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal-backdrop" onClick={() => setShowDeleteAccountModal(false)} />
                    <div className="settings-modal">
                        <button
                            onClick={() => setShowDeleteAccountModal(false)}
                            className="settings-modal-close settings-modal-close-absolute"
                        >
                            <X className="settings-icon-sm" />
                        </button>

                        <div className="settings-delete-header">
                            <div className="settings-delete-icon-wrapper">
                                <UserX className="settings-delete-icon" />
                            </div>
                            <h3 className="settings-delete-title">
                                Hapus Akun?
                            </h3>
                            <p className="settings-delete-text">
                                Semua data Anda akan dihapus permanen dan tidak dapat dikembalikan.
                            </p>
                        </div>

                        <div className="settings-modal-form">
                            <div className="settings-form-group">
                                <label className="settings-form-label">
                                    Ketik <span className="settings-text-danger">"Hapus akun"</span> untuk konfirmasi:
                                </label>
                                <input
                                    type="text"
                                    value={deleteAccountInput}
                                    onChange={(e) => setDeleteAccountInput(e.target.value)}
                                    placeholder="Hapus akun"
                                    className="settings-form-input settings-form-input-danger"
                                />
                            </div>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading || deleteAccountInput !== 'Hapus akun'}
                                className="settings-delete-btn"
                            >
                                {isLoading ? (
                                    <Loader2 className="settings-icon-spin" />
                                ) : (
                                    <>
                                        <UserX className="settings-icon-sm" />
                                        Hapus Akun Saya
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
