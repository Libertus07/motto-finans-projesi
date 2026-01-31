import React, { useState } from 'react';
import { Gift, Lock, Coffee, Check, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const currentStamps = totalStamps % target;
    const earnedRewards = Math.floor(totalStamps / target);
    const remaining = target - currentStamps;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative rounded-[2.5rem] overflow-hidden transition-all duration-500 group shadow-[0_20px_50px_rgba(67,40,24,0.2)] cursor-pointer hover:scale-[1.02] border border-[#D4AF37]/10"
                onClick={() => isMember ? setShowModal(true) : onOpenAuth()}
            >
                {/* Background Layer with Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a110d] via-[#2c1a0f] to-[#1a110d]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }}>
                    </div>
                </div>

                {/* Glassy Content Container */}
                <div className="relative z-10 p-6 sm:p-7">
                    {/* Header: Brand & Progress Summary */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#BB9457] p-[1px] shadow-lg shadow-[#D4AF37]/20">
                                <div className="w-full h-full rounded-[0.9rem] bg-[#1a110d] flex items-center justify-center">
                                    <Coffee size={18} className="text-[#D4AF37]" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-black text-sm text-[#FDFBF7] font-cinzel tracking-[0.2em]">KAHVE KARTI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                                    <p className="text-[#D4AF37]/80 text-[10px] font-black uppercase tracking-widest leading-none">
                                        {currentStamps === 0 ? 'YENİ SERÜVEN BAŞLADI' : `${remaining} KAHVE SONRA İKRAM`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isMember && (
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-3xl font-black text-white font-cinzel leading-none">{currentStamps}</span>
                                    <span className="text-sm font-black text-white/30 font-cinzel tracking-tighter">/{target}</span>
                                </div>
                                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">PULLAR</span>
                            </div>
                        )}
                    </div>

                    {/* Symmetric 2x4 Grid Map */}
                    <div className="relative grid grid-cols-4 gap-3 sm:gap-4 p-4 rounded-[2rem] bg-black/30 border border-white/5 backdrop-blur-md shadow-inner">
                        <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-[2rem] pointer-events-none"></div>

                        {[...Array(target)].map((_, i) => {
                            const active = i < currentStamps;
                            const isNext = i === currentStamps;
                            const isLast = i === target - 1;

                            return (
                                <div key={i} className="relative aspect-square">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: active ? [1, 1.1, 1] : 1,
                                            rotate: active ? [0, 5, 0] : 0
                                        }}
                                        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden ${active
                                                ? 'bg-gradient-to-br from-[#D4AF37] via-[#F5E6AD] to-[#BB9457] shadow-[0_8px_20px_rgba(212,175,55,0.4)] border-none'
                                                : isNext && isMember
                                                    ? 'bg-white/10 border-2 border-dashed border-[#D4AF37]/40 animate-pulse'
                                                    : 'bg-[#1a110d]/60 border border-white/10'
                                            }`}
                                    >
                                        {active ? (
                                            <>
                                                <Coffee size={16} className="text-[#1a110d] relative z-10" strokeWidth={3} />
                                                <motion.div
                                                    animate={{ x: ['100%', '-100%'] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="absolute inset-0 bg-white/30 skew-x-12 translate-x-full"
                                                />
                                            </>
                                        ) : isLast ? (
                                            <Gift size={16} className={`opacity-40 transition-all duration-500 ${isNext && isMember ? 'opacity-100 text-[#D4AF37]' : 'text-[#D4AF37]/50'}`} />
                                        ) : (
                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isNext && isMember ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
                                        )}
                                    </motion.div>

                                    {/* Number Badge */}
                                    <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-black leading-none ${active ? 'bg-[#1a110d] text-[#D4AF37]' : 'bg-black/50 text-white/30 border border-white/10'}`}>
                                        {i + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Smart Footer Section */}
                    {isMember && (
                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#BB9457] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                                    <Trophy size={14} className="text-[#1a110d] animate-bounce" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white/90 leading-tight uppercase tracking-wide">
                                        {earnedRewards > 0 ? `${earnedRewards} ÖDÜL KAZANILDI` : 'İLK ÖDÜLE DOĞRU'}
                                    </span>
                                    <span className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-70">
                                        TOPLAM {totalStamps} KAHVE
                                    </span>
                                </div>
                            </div>

                            {currentStamps >= target - 2 && (
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#D4AF37] text-[#1a110d] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                >
                                    <Sparkles size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">BİTMEYE YAKIN!</span>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Refined Premium Guest Overlay */}
                {!isMember && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 sm:p-8 animate-in fade-in zoom-in duration-500">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] via-[#F5E6AD] to-[#BB9457] rounded-3xl flex items-center justify-center shadow-2xl mb-4 border border-white/20"
                            >
                                <Lock size={28} className="text-[#1a110d]" strokeWidth={2.5} />
                            </motion.div>
                            <h4 className="text-[#D4AF37] font-black font-cinzel text-xl mb-1 uppercase tracking-[0.2em] drop-shadow-lg">AYRICALIKLI ÜYELİK</h4>
                            <p className="text-[#FDFBF7]/70 text-[11px] font-bold mb-6 max-w-[220px] leading-relaxed uppercase tracking-wider text-center">
                                Motto Club'a katıl, her 8 kahvede bir ikram kazan!
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="group relative bg-[#D4AF37] text-[#1a110d] px-10 py-3.5 rounded-2xl font-black font-cinzel text-xs overflow-hidden shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.5)] transition-all"
                            >
                                <span className="relative z-10 tracking-[0.2em]">HEMEN BAŞLA</span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>

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
