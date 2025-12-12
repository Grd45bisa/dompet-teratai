import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User,
    Loader2,
    Briefcase,
    Target,
    Sparkles,
    ArrowRight,
    GraduationCap,
    Laptop,
    Rocket,
    Home,
    Star,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    occupation: z.string().min(1, 'Pilih pekerjaan'),
    monthly_budget: z.number().min(100000, 'Budget minimal Rp100.000'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const OCCUPATIONS = [
    { value: 'student', label: 'Pelajar', icon: GraduationCap, color: '#3B82F6' },
    { value: 'employee', label: 'Karyawan', icon: Briefcase, color: '#10B981' },
    { value: 'freelancer', label: 'Freelancer', icon: Laptop, color: '#8B5CF6' },
    { value: 'entrepreneur', label: 'Wirausaha', icon: Rocket, color: '#F59E0B' },
    { value: 'housewife', label: 'Ibu Rumah Tangga', icon: Home, color: '#EC4899' },
    { value: 'other', label: 'Lainnya', icon: Star, color: '#6366F1' },
];

const BUDGET_PRESETS = [
    { value: 500000, label: '500rb' },
    { value: 1000000, label: '1jt' },
    { value: 2000000, label: '2jt' },
    { value: 3000000, label: '3jt' },
    { value: 5000000, label: '5jt' },
    { value: 10000000, label: '10jt' },
];

const FEATURES = [
    { icon: CheckCircle2, text: 'Pantau pengeluaran harian' },
    { icon: CheckCircle2, text: 'Foto struk, AI isi otomatis' },
    { icon: CheckCircle2, text: 'Laporan & grafik lengkap' },
    { icon: CheckCircle2, text: 'Export PDF & Excel' },
];

export function CompleteProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOccupation, setSelectedOccupation] = useState<string>('');
    const [selectedBudget, setSelectedBudget] = useState<number>(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            occupation: '',
            monthly_budget: 0,
        },
    });

    const handleOccupationSelect = (value: string) => {
        setSelectedOccupation(value);
        setValue('occupation', value, { shouldValidate: true });
    };

    const handleBudgetSelect = (value: number) => {
        setSelectedBudget(value);
        setValue('monthly_budget', value, { shouldValidate: true });
    };

    const handleBudgetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
        setSelectedBudget(value);
        setValue('monthly_budget', value, { shouldValidate: true });
    };

    const formatBudget = (value: number): string => {
        if (!value) return '';
        return value.toLocaleString('id-ID');
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateUser({
                full_name: data.full_name,
                business_type: data.occupation,
                monthly_budget: data.monthly_budget,
                onboarding_completed: true,
            });

            if (result.error) {
                setError(result.error.message || 'Gagal menyimpan profil');
                setIsLoading(false);
                return;
            }
        } catch (err) {
            setError('Terjadi kesalahan, coba lagi');
            setIsLoading(false);
            return;
        }

        navigate('/onboarding', { replace: true });
    };

    return (
        <div className="cp-container">
            {/* Container */}
            <div className="cp-card">

                {/* Left Panel - Branding (Desktop only) */}
                <div className="cp-left-panel">
                    <div>
                        {/* Logo */}
                        <div className="cp-logo-section">
                            <img
                                src="/Logotrans-Teratai.webp"
                                alt="Dompet Teratai"
                                className="cp-logo"
                            />
                            <div>
                                <h2 className="cp-brand-title">
                                    <span className="text-primary">Dompet</span> Teratai
                                </h2>
                                <p className="cp-brand-subtitle">
                                    Expense Tracker
                                </p>
                            </div>
                        </div>

                        <h3 className="cp-features-title">
                            Fitur Unggulan
                        </h3>

                        {/* Features */}
                        <div className="cp-features-list">
                            {FEATURES.map((feature, index) => {
                                const IconComponent = feature.icon;
                                return (
                                    <div key={index} className="cp-feature-item">
                                        <IconComponent className="cp-feature-icon" />
                                        <span className="cp-feature-text">{feature.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom text */}
                    <p className="cp-bottom-text">
                        Gratis selamanya, tanpa iklan
                    </p>
                </div>

                {/* Right Panel - Form */}
                <div className="cp-right-panel">
                    {/* Mobile Header */}
                    <div className="cp-mobile-header">
                        <img
                            src="/Logotrans-Teratai.webp"
                            alt="Dompet Teratai"
                            className="cp-mobile-logo"
                        />
                        <h1 className="cp-mobile-title">
                            Lengkapi Profil
                        </h1>
                        <p className="cp-mobile-subtitle">Satu langkah lagi!</p>
                    </div>

                    {/* Desktop Header */}
                    <div className="cp-desktop-header">
                        <h1 className="cp-desktop-title">
                            Lengkapi Profil
                        </h1>
                        <p className="cp-desktop-subtitle">
                            Personalisasi pengalaman Anda
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="cp-error">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="cp-form">
                        {/* Name Input */}
                        <div className="cp-form-group">
                            <label className="cp-label">
                                <User className="cp-label-icon" />
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                placeholder="Siapa namamu?"
                                {...register('full_name')}
                                className={`cp-input ${errors.full_name ? 'cp-input-error' : ''}`}
                            />
                            {errors.full_name && (
                                <p className="cp-error-text">{errors.full_name.message}</p>
                            )}
                        </div>

                        {/* Occupation Picker */}
                        <div className="cp-form-group">
                            <label className="cp-label">
                                <Briefcase className="cp-label-icon" />
                                Kamu seorang...
                            </label>
                            <input type="hidden" {...register('occupation')} />
                            <div className="cp-occupation-grid">
                                {OCCUPATIONS.map((occ) => {
                                    const IconComponent = occ.icon;
                                    const isSelected = selectedOccupation === occ.value;
                                    return (
                                        <button
                                            key={occ.value}
                                            type="button"
                                            onClick={() => handleOccupationSelect(occ.value)}
                                            className={`cp-occupation-btn ${isSelected ? 'cp-occupation-btn-selected' : ''}`}
                                        >
                                            <IconComponent
                                                className="cp-occupation-icon"
                                                style={{ color: isSelected ? occ.color : '#9CA3AF' }}
                                            />
                                            <span className={`cp-occupation-label ${isSelected ? 'cp-occupation-label-selected' : ''}`}>
                                                {occ.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.occupation && (
                                <p className="cp-error-text">{errors.occupation.message}</p>
                            )}
                        </div>

                        {/* Budget Input */}
                        <div className="cp-form-group">
                            <label className="cp-label">
                                <Target className="cp-label-icon" />
                                Budget Bulanan
                            </label>
                            <input type="hidden" {...register('monthly_budget')} />

                            {/* Preset Buttons */}
                            <div className="cp-budget-presets">
                                {BUDGET_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => handleBudgetSelect(preset.value)}
                                        className={`cp-budget-preset-btn ${selectedBudget === preset.value ? 'cp-budget-preset-btn-selected' : ''}`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Input */}
                            <div className="cp-budget-input-wrapper">
                                <span className="cp-budget-prefix">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    value={formatBudget(selectedBudget)}
                                    onChange={handleBudgetInput}
                                    placeholder="Masukkan budget custom"
                                    className={`cp-input cp-budget-input ${errors.monthly_budget ? 'cp-input-error' : ''}`}
                                />
                            </div>
                            {errors.monthly_budget && (
                                <p className="cp-error-text">{errors.monthly_budget.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cp-submit-btn"
                        >
                            {isLoading ? (
                                <Loader2 className="cp-spinner" />
                            ) : (
                                <>
                                    <Sparkles className="cp-submit-icon" />
                                    Mulai Sekarang
                                    <ArrowRight className="cp-submit-icon" />
                                </>
                            )}
                        </button>

                        <p className="cp-privacy-text">
                            Data Anda aman dan tidak akan dibagikan
                        </p>
                    </form>
                </div>
            </div >
        </div >
    );
}

export default CompleteProfile;
