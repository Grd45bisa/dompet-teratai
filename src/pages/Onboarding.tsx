import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    ArrowRight,
    Plus,
    Target,
    Sparkles,
    CheckCircle2,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    tips: string[];
    colorClass: string;
}

const STEPS: OnboardingStep[] = [
    {
        icon: <Camera className="onboard-step-icon" />,
        title: 'Foto Struk Belanja',
        description: 'Cukup foto struk, AI akan membaca dan mengisi data otomatis!',
        tips: [
            'Foto struk dengan pencahayaan yang baik',
            'Pastikan semua angka terlihat jelas',
            'AI akan mendeteksi total, tanggal, dan kategori'
        ],
        colorClass: 'onboard-icon-blue',
    },
    {
        icon: <Plus className="onboard-step-icon" />,
        title: 'Atau Input Manual',
        description: 'Tidak ada struk? Input langsung dengan mudah dan cepat.',
        tips: [
            'Tekan tombol + di halaman utama',
            'Isi jumlah, kategori, dan deskripsi',
            'Simpan untuk tracking otomatis'
        ],
        colorClass: 'onboard-icon-green',
    },
    {
        icon: <Target className="onboard-step-icon" />,
        title: 'Pantau Budget',
        description: 'Lihat sisa budget dan dapat peringatan sebelum melebihi batas.',
        tips: [
            'Atur target budget bulanan di Pengaturan',
            'Dapatkan warning saat 80% terpakai',
            'Alert merah jika melebihi budget'
        ],
        colorClass: 'onboard-icon-amber',
    },
    {
        icon: <BarChart3 className="onboard-step-icon" />,
        title: 'Analisis & Laporan',
        description: 'Grafik yang mudah dipahami untuk mengontrol keuanganmu.',
        tips: [
            'Lihat grafik pengeluaran harian',
            'Cek kategori terbesar',
            'Export ke Excel kapan saja'
        ],
        colorClass: 'onboard-icon-purple',
    },
];

export function Onboarding() {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const isLastStep = currentStep === STEPS.length - 1;
    const step = STEPS[currentStep];

    const handleNext = async () => {
        if (isLastStep) {
            await updateUser({ onboarding_completed: true });
            navigate('/dashboard', { replace: true });
        } else {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
                setIsTransitioning(false);
            }, 200);
        }
    };

    const handleSkip = async () => {
        await updateUser({ onboarding_completed: true });
        navigate('/dashboard', { replace: true });
    };

    const handleDotClick = (index: number) => {
        if (index !== currentStep) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(index);
                setIsTransitioning(false);
            }, 200);
        }
    };

    return (
        <div className="onboard-container">
            {/* Header with Skip */}
            <div className="onboard-header">
                <div className="onboard-counter">
                    {currentStep + 1} dari {STEPS.length}
                </div>
                <button
                    onClick={handleSkip}
                    className="onboard-skip-btn"
                >
                    Lewati
                </button>
            </div>

            {/* Main Content - Centered Card */}
            <div className="onboard-content">
                <div className="onboard-content-inner">
                    {/* Card Container */}
                    <div className={`onboard-card ${isTransitioning ? 'onboard-card-transitioning' : ''}`}>
                        {/* Icon */}
                        <div className="onboard-icon-container">
                            <div className={`onboard-icon-wrapper ${step.colorClass}`}>
                                {step.icon}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="onboard-text-section">
                            <h2 className="onboard-title">
                                {step.title}
                            </h2>
                            <p className="onboard-description">
                                {step.description}
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="onboard-tips">
                            <div className="onboard-tips-header">
                                <Sparkles className="onboard-tips-icon" />
                                <span className="onboard-tips-label">
                                    Tips
                                </span>
                            </div>
                            <div className="onboard-tips-list">
                                {step.tips.map((tip, index) => (
                                    <div key={index} className="onboard-tip-item">
                                        <CheckCircle2 className="onboard-tip-icon" />
                                        <p className="onboard-tip-text">
                                            {tip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation - Fixed on mobile, relative on desktop */}
            <div className="onboard-nav">
                <div className="onboard-nav-inner">
                    {/* Progress Bar */}
                    <div className="onboard-progress">
                        <div
                            className="onboard-progress-fill"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    {/* Dots */}
                    <div className="onboard-dots">
                        {STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`onboard-dot ${index === currentStep ? 'onboard-dot-active' : ''}`}
                            />
                        ))}
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleNext}
                        className="onboard-next-btn"
                    >
                        {isLastStep ? (
                            <>
                                <Sparkles className="onboard-btn-icon" />
                                Mulai Menggunakan
                            </>
                        ) : (
                            <>
                                Selanjutnya
                                <ArrowRight className="onboard-btn-icon" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
