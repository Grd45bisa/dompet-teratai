import { useState } from 'react';
import { Plus } from 'lucide-react';
import { UploadModal } from '../dashboard/UploadModal';

interface FloatingButtonProps {
    onClick?: () => void;
    label?: string;
}

export function FloatingButton({ onClick, label }: FloatingButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            {/* Desktop: bottom-right, Mobile: bottom-center above nav */}
            <button
                onClick={handleClick}
                className="
          fixed z-50
          w-14 h-14 rounded-full
          bg-primary text-white
          shadow-xl shadow-primary/30
          flex items-center justify-center
          hover:scale-110 hover:shadow-2xl hover:shadow-primary/40
          active:scale-95
          transition-all duration-200
          
          /* Mobile: centered above bottom nav */
          bottom-20 left-1/2 -translate-x-1/2
          
          /* Desktop: bottom-right */
          md:bottom-8 md:right-8 md:left-auto md:translate-x-0
        "
                aria-label={label || 'Tambah Pengeluaran'}
            >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* Upload Modal - only show if no custom onClick */}
            {!onClick && (
                <UploadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}

export default FloatingButton;
