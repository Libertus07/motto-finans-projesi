import React from 'react';
import { Sparkles, Trophy, ChevronRight, Zap } from 'lucide-react';

interface MottoGameWidgetProps {
    onWheelClick: () => void;
    onOracleClick: () => void;
    onScratchClick: () => void;
}

const MottoGameWidget: React.FC<MottoGameWidgetProps> = ({
    onWheelClick,
    onOracleClick,
    onScratchClick
}) => {
    return (
        <div className="relative rounded-[2rem] overflow-hidden group shadow-[0_10px_30px_rgba(67,40,24,0.12)] border border-[#432818]/5 flex flex-col h-full bg-[#FDFBF7]">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#D4AF37]/10 transition-colors"></div>

            <div className="relative z-10 p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-[#432818] flex items-center justify-center border border-[#432818]">
                            <Sparkles size={12} className="text-[#D4AF37]" />
                        </div>
                        <h3 className="font-black text-sm text-[#432818] font-cinzel tracking-wider uppercase">DENEYİM</h3>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={onWheelClick}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#432818] to-[#2a1810] text-[#D4AF37] hover:scale-[1.02] active:scale-95 transition-all shadow-md group/btn"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🎡</span>
                            <span className="text-[10px] font-black font-cinzel tracking-tight">ŞANS ÇARKI</span>
                        </div>
                        <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={onOracleClick}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#432818]/5 shadow-sm hover:border-[#D4AF37]/30 transition-all active:scale-95"
                        >
                            <span className="text-lg mb-1">🔮</span>
                            <span className="text-[8px] font-black font-cinzel text-[#432818]/60">KAHİN</span>
                        </button>
                        <button
                            onClick={onScratchClick}
                            className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 via-[#F5E6AD]/10 to-[#D4AF37]/20 border border-[#D4AF37]/30 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95 overflow-hidden group"
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            {/* Animated icon with glow */}
                            <div className="relative">
                                <div className="absolute inset-0 blur-md">
                                    <span className="text-lg animate-pulse">✨</span>
                                </div>
                                <span className="relative text-lg mb-1 animate-[float_3s_ease-in-out_infinite]">✨</span>
                            </div>

                            <span className="relative text-[8px] font-black font-cinzel text-[#D4AF37] tracking-tight">SİL SÜPÜR</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Tagline */}
            <div className="bg-[#432818]/5 py-2 px-4 border-t border-[#432818]/5">
                <div className="flex items-center gap-1">
                    <Zap size={10} className="text-[#D4AF37]" />
                    <span className="text-[7px] font-bold text-[#432818]/40 uppercase tracking-widest">Eğlenceyi Keşfet</span>
                </div>
            </div>
        </div>
    );
};

export default MottoGameWidget;
