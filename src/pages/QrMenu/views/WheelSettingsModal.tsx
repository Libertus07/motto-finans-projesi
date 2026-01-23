import React from 'react';
import { X, Info, Settings } from 'lucide-react';
import { WheelPrize } from './qrMenu';

interface WheelSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    wheelPrizes: WheelPrize[];
    setWheelPrizes: (prizes: WheelPrize[]) => void;
    onSave: () => void;
}

const WheelSettingsModal: React.FC<WheelSettingsModalProps> = ({ isOpen, onClose, wheelPrizes, setWheelPrizes, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] p-6 relative shadow-[0_0_50px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                            <Settings size={20} className="text-[#D4AF37]" />
                        </div>
                        <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-wide">Çark Ayarları</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#FDFBF7]/40 hover:text-[#D4AF37] transition-all"><X size={20} /></button>
                </div>

                <div className="bg-[#D4AF37]/5 p-4 rounded-2xl border border-[#D4AF37]/20 mb-6 flex gap-3">
                    <Info size={20} className="text-[#D4AF37] shrink-0" />
                    <div className="text-[11px] text-[#FDFBF7]/60 leading-relaxed font-medium">
                        <span className="font-black text-[#D4AF37] block mb-1">Ağırlık (Olasılık) Nedir?</span>
                        Bu değer, dilimin gelme şansını belirler. Sayı ne kadar yüksekse, o ödülün çıkma ihtimali o kadar artar.
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 mb-6">
                    {wheelPrizes.map((prize, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4 group hover:border-[#D4AF37]/30 transition-all shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">DİLİM {index + 1}</span>
                                <div className="flex items-center gap-3">
                                    <label className="text-[10px] font-black text-[#FDFBF7]/30 uppercase tracking-widest">RENK</label>
                                    <div className="w-8 h-8 rounded-full border-2 border-white/10 overflow-hidden relative shadow-inner">
                                        <input
                                            type="color"
                                            value={prize.color}
                                            onChange={(e) => {
                                                const newPrizes = [...wheelPrizes];
                                                newPrizes[index].color = e.target.value;
                                                setWheelPrizes(newPrizes);
                                            }}
                                            className="absolute inset-[-4px] w-[150%] h-[150%] cursor-pointer border-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-[#FDFBF7]/40 block mb-1.5 uppercase tracking-widest">ÖDÜL ETİKETİ</label>
                                    <input
                                        type="text"
                                        value={prize.label}
                                        onChange={(e) => {
                                            const newPrizes = [...wheelPrizes];
                                            newPrizes[index].label = e.target.value;
                                            setWheelPrizes(newPrizes);
                                        }}
                                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-[#FDFBF7]/40 block mb-1.5 uppercase tracking-widest">OLASILIK</label>
                                    <input
                                        type="number"
                                        value={prize.weight}
                                        onChange={(e) => {
                                            const newPrizes = [...wheelPrizes];
                                            newPrizes[index].weight = Number(e.target.value);
                                            setWheelPrizes(newPrizes);
                                        }}
                                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-[#FDFBF7]/40 block mb-1.5 uppercase tracking-widest">VOLT DEĞERİ</label>
                                    <input
                                        type="number"
                                        value={prize.value}
                                        onChange={(e) => {
                                            const newPrizes = [...wheelPrizes];
                                            newPrizes[index].value = Number(e.target.value);
                                            if (Number(e.target.value) > 0) {
                                                newPrizes[index].type = 'points';
                                            }
                                            setWheelPrizes(newPrizes);
                                        }}
                                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-[#D4AF37] outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={onSave} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#8A6E2F] text-black py-4 rounded-xl font-black font-cinzel text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase">
                    AYARLARI KAYDET
                </button>
            </div>
        </div>
    );
};

export default WheelSettingsModal;