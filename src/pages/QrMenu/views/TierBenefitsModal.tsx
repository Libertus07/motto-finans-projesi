import React from 'react';
import { X, Crown, ChevronRight, Star, Lock } from 'lucide-react';
import { CustomerProfile, LoyaltyTier } from '../../../types';
import { getTier, getNextTier, getTierBenefits, getTierDescription, getTierBadge, getTierThreshold, getTierColor } from '../../../utils/loyalty';

interface TierBenefitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: CustomerProfile | null;
}

const TierBenefitsModal: React.FC<TierBenefitsModalProps> = ({ isOpen, onClose, customerProfile }) => {
    if (!isOpen || !customerProfile) return null;

    const currentPoints = customerProfile.points || 0;
    const currentTier = getTier(currentPoints);
    const nextTier = getNextTier(currentTier);

    // Progress Calculation
    const currentTierThreshold = getTierThreshold(currentTier);
    const nextTierThreshold = nextTier ? getTierThreshold(nextTier) : currentPoints;
    const progress = nextTier
        ? Math.min(100, Math.max(0, ((currentPoints - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100))
        : 100;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#432818]/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-50 duration-300 max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-[#432818] p-6 flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Crown className="text-[#D4AF37]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-tight leading-none">Ayrıcalıklar</h2>
                            <p className="text-[#FDFBF7]/60 text-[10px] font-bold uppercase tracking-widest">Sadakat Durumu</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Current Status Card */}
                    <div className="text-center relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FDFBF7] to-[#e6e6e6] rounded-full shadow-lg flex items-center justify-center text-5xl border-4 border-[#D4AF37]/20 relative z-10">
                            {getTierBadge(currentTier)}
                        </div>
                        <h3 className="mt-4 text-2xl font-black text-[#432818] font-cinzel">{currentTier} Üye</h3>
                        <p className="text-xs text-[#432818]/60 font-medium max-w-[200px] mx-auto mt-1">
                            {getTierDescription(currentTier)}
                        </p>

                        {/* Progress Bar */}
                        {nextTier && (
                            <div className="mt-6 max-w-xs mx-auto">
                                <div className="flex justify-between text-[10px] font-bold text-[#432818]/50 mb-1">
                                    <span>{currentPoints} Volt</span>
                                    <span>{nextTierThreshold} Volt</span>
                                </div>
                                <div className="h-2 bg-[#432818]/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#D4AF37] transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-[#432818] mt-2 font-medium">
                                    <span className="font-bold">{nextTier}</span> seviyesine ulaşmak için <span className="font-bold text-[#D4AF37]">{nextTierThreshold - currentPoints} Volt</span> daha  gerekiyor.
                                </p>
                            </div>
                        )}
                        {!nextTier && (
                            <div className="mt-4 inline-block px-4 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30">
                                <span className="text-xs font-bold text-[#D4AF37]">Maksimum Seviye</span>
                            </div>
                        )}
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-[#432818] uppercase tracking-wider flex items-center gap-2">
                            <Star size={14} className="text-[#D4AF37]" fill="#D4AF37" />
                            Mevcut Ayrıcalıkların
                        </h4>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#432818]/5">
                            <ul className="space-y-3">
                                {getTierBenefits(currentTier).map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-[#432818]/80 font-medium">
                                        <div className="mt-1 min-w-[6px] min-h-[6px] rounded-full bg-[#D4AF37]" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Next Tier Teaser */}
                    {nextTier && (
                        <div className="space-y-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                            <h4 className="text-sm font-black text-[#432818] uppercase tracking-wider flex items-center gap-2">
                                <Lock size={14} />
                                Sıradaki Hedef: {nextTier}
                            </h4>
                            <div className="bg-[#432818]/5 rounded-2xl p-4 border border-[#432818]/5 border-dashed">
                                <ul className="space-y-3">
                                    {getTierBenefits(nextTier).map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-[#432818]/60 font-medium">
                                            <div className="mt-1 min-w-[6px] min-h-[6px] rounded-full bg-[#432818]/20" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TierBenefitsModal;
