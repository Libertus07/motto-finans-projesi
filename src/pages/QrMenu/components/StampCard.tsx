import React, { useState } from 'react';
import { Gift, Lock, Coffee, Check } from 'lucide-react';
import { CustomerProfile } from '../views/qrMenu';
import StampCardModal from '../views/StampCardModal';

interface StampCardProps {
    isMember: boolean;
    customerProfile: CustomerProfile | null;
    onOpenAuth: () => void;
}

const StampCard: React.FC<StampCardProps> = ({ isMember, customerProfile, onOpenAuth }) => {
    const [showModal, setShowModal] = useState(false);
    const totalStamps = customerProfile?.coffeeStamps || 0;
    const target = 8;
    // Döngüsel ilerleme (8'den sonra başa döner)
    const currentStamps = totalStamps % target;
    const earnedRewards = Math.floor(totalStamps / target);

    return (
        <>
            <div className="px-4 mt-6">
                <div
                    className="relative rounded-[2rem] overflow-hidden transition-all duration-300 group shadow-[0_10px_30px_rgba(67,40,24,0.15)] cursor-pointer hover:scale-[1.01]"
                    onClick={() => isMember ? setShowModal(true) : onOpenAuth()}
                >
                    {/* Card Background */}
                    <div className="absolute inset-0 bg-[#1a110d]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        {/* Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                        <Coffee size={14} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="font-black text-lg text-[#FDFBF7] font-cinzel tracking-wider">KAHVE KART</h3>
                                </div>
                                <p className="text-[#D4AF37]/60 text-xs font-medium pl-1">
                                    {isMember
                                        ? "Her 8 kahvede 1 ikram kazanın"
                                        : "Üye olun, kahveleri biriktirin"}
                                </p>
                            </div>
                            {isMember && (
                                <div className="text-right">
                                    <div className="text-3xl font-black text-[#D4AF37] font-cinzel leading-none">
                                        {currentStamps}<span className="text-lg text-white/20">/{target}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stamps Track */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                            <div className="flex justify-between items-center relative">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -translate-y-1/2 rounded-full"></div>

                                {/* Stamps */}
                                {[...Array(target)].map((_, i) => {
                                    const active = i < currentStamps;
                                    const isLast = i === target - 1;

                                    return (
                                        <div key={i} className="relative z-10 group/stamp">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active
                                                    ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110'
                                                    : 'bg-[#1a110d] border-white/10'
                                                    }`}
                                            >
                                                {active ? (
                                                    <Coffee size={14} className="text-[#1a110d]" strokeWidth={3} />
                                                ) : isLast ? (
                                                    <Gift size={14} className="text-[#D4AF37] opacity-50 group-hover/stamp:scale-110 transition-transform" />
                                                ) : (
                                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                                )}
                                            </div>
                                            {/* Number Label */}
                                            <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold transition-colors ${active ? 'text-[#D4AF37]' : 'text-white/20'}`}>
                                                {i + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Info */}
                        {isMember && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                                        <Check size={8} className="text-[#D4AF37]" />
                                    </div>
                                    <span>Toplam {totalStamps} kahve içildi.</span>
                                </div>
                                {currentStamps === 0 && totalStamps > 0 && (
                                    <div className="flex items-center gap-1 text-[#D4AF37] text-[10px] font-bold animate-pulse">
                                        <Gift size={12} />
                                        <span>Ödül Hazır!</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Guest Overlay */}
                    {!isMember && (
                        <div className="absolute inset-0 z-20 bg-[#1a110d]/60 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                            <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl rotate-3 flex items-center justify-center shadow-lg mb-3 border border-[#FDFBF7]/20">
                                <Lock size={24} className="text-[#1a110d]" />
                            </div>
                            <h4 className="text-white font-bold font-cinzel text-lg mb-1">Sadakat Programı</h4>
                            <p className="text-white/80 text-xs mb-5 max-w-[200px] leading-relaxed">
                                Motto Club'a katıl, her 8 kahvede 1 kahve bizden hediye olsun!
                            </p>
                            <button className="bg-[#D4AF37] text-[#1a110d] px-8 py-3 rounded-xl font-bold font-cinzel text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95">
                                HEMEN BAŞLA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <StampCardModal
                isOpen={showModal && isMember}
                onClose={() => setShowModal(false)}
                totalStamps={totalStamps}
                currentStamps={currentStamps}
                target={target}
                earnedRewards={earnedRewards}
                customerProfile={customerProfile}
            />
        </>
    );
};

export default StampCard;
