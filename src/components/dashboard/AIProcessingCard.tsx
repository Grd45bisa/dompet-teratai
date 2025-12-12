import { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * AIProcessingCard - Shows when receipts are being processed by AI
 * Note: Real-time updates would need WebSocket or polling from backend
 */
export function AIProcessingCard() {
    const { user } = useAuth();
    const { showToast: _showToast } = useToast();
    const [processingCount, setProcessingCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // For now, AI processing is not implemented in the backend
        // This component will be functional when AI processing is added
        setProcessingCount(0);
    }, [user]);

    if (processingCount === 0) return null;

    return (
        <div className="ai-card">
            <div className="ai-card-content">
                <div className="ai-card-icon-wrapper">
                    <Loader2 className="ai-card-icon" />
                </div>
                <div className="ai-card-info">
                    <div className="ai-card-header">
                        <Sparkles className="ai-card-sparkle" />
                        <p className="ai-card-title">
                            Sedang memproses {processingCount} struk...
                        </p>
                    </div>
                    <p className="ai-card-subtitle">
                        AI sedang mengekstrak data dari foto struk Anda
                    </p>
                    {/* Progress bar animation */}
                    <div className="ai-card-progress">
                        <div className="ai-card-progress-fill" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIProcessingCard;
