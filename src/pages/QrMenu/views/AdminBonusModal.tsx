import React from 'react';
import { X, Zap, Gift } from 'lucide-react';

interface AdminBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    newReferrerReward: string;
    setNewReferrerReward: (val: string) => void;
    newRefereeReward: string;
    setNewRefereeReward: (val: string) => void;
    onSave: () => void;
}

const AdminBonusModal: React.FC<AdminBonusModalProps> = ({
    isOpen, onClose, newReferrerReward, setNewReferrerReward, newRefereeReward, setNewRefereeReward, onSave
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#050302] w-full max-w-sm rounded-[2.5rem] relative shadow-[0_0_50px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/10 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-[#FDFBF7] font-cinzel tracking-tight uppercase">Ödül Yapısı</h2>
                            <div className="h-0.5 w-8 bg-[#D4AF37] mt-1 rounded-full opacity-40"></div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 text-[#FDFBF7]/40 hover:text-[#D4AF37] hover:bg-white/10 rounded-2xl transition-all"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] leading-relaxed">Davet sistemindeki ödül miktarlarını belirleyin.</p>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#D4AF37]/60 uppercase tracking-widest px-2">Referans Ödülü (Davet Eden)</label>
                            <div className="relative group">
                                <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-60 group-focus-within:opacity-100 transition-all" size={20} />
                                <input
                                    type="number"
                                    value={newReferrerReward}
                                    onChange={(e) => setNewReferrerReward(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-[#D4AF37] font-black text-[#FDFBF7] text-lg font-cinzel transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#D4AF37]/60 uppercase tracking-widest px-2">Yeni Üye Ödülü (Davet Edilen)</label>
                            <div className="relative group">
                                <Gift className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-60 group-focus-within:opacity-100 transition-all" size={20} />
                                <input
                                    type="number"
                                    value={newRefereeReward}
                                    onChange={(e) => setNewRefereeReward(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-[#D4AF37] font-black text-[#FDFBF7] text-lg font-cinzel transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button onClick={onSave} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-black font-cinzel shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-all tracking-[0.2em] text-xs">
                        DEĞİŞİKLİKLERİ KAYDET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBonusModal;