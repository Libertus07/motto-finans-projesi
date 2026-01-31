import React from 'react';
import { X, Lock, Medal } from 'lucide-react';
import { Badge, CustomerProfile } from '../../../types';
import { SYSTEM_BADGES } from '../../../utils/gamification';

interface BadgesModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: CustomerProfile | null;
}

const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose, customerProfile }) => {
    if (!isOpen) return null;

    const earnedBadges = customerProfile?.badges || [];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#432818]/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-50 duration-300">
                {/* Header */}
                <div className="bg-[#432818] p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Medal className="text-[#D4AF37]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-tight leading-none">Rozet Koleksiyonu</h2>
                            <p className="text-[#FDFBF7]/60 text-[10px] font-bold uppercase tracking-widest">Başarıların</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Badges Grid */}
                <div className="p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {SYSTEM_BADGES.map(badge => {
                        const isEarned = earnedBadges.includes(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-3 ${isEarned
                                        ? 'bg-white border-[#D4AF37]/20 shadow-lg scale-100'
                                        : 'bg-[#FDFBF7] border-[#432818]/5 opacity-60 grayscale'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner relative overflow-hidden ${isEarned ? 'bg-gradient-to-br from-[#FDFBF7] to-[#D4AF37]/10' : 'bg-gray-100'
                                    }`}>
                                    {isEarned ? (
                                        <span className="animate-in zoom-in duration-500">{badge.icon}</span>
                                    ) : (
                                        <Lock size={24} className="text-gray-300" />
                                    )}

                                    {/* Shine effect for earned */}
                                    {isEarned && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className={`font-bold text-sm ${isEarned ? 'text-[#432818]' : 'text-gray-400'}`}>
                                        {badge.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 leading-tight px-2">
                                        {badge.description}
                                    </p>
                                </div>

                                {isEarned && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BadgesModal;
