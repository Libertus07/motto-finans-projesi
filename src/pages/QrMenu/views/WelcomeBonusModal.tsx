import React from 'react';
import { X, Zap } from 'lucide-react';

interface WelcomeBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    newWelcomeBonus: string;
    setNewWelcomeBonus: (val: string) => void;
    onSave: () => void;
}

const WelcomeBonusModal: React.FC<WelcomeBonusModalProps> = ({ isOpen, onClose, newWelcomeBonus, setNewWelcomeBonus, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-sm rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Bonus Sistemi</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-xs text-[#432818]/60 font-medium leading-relaxed">Yeni üye olan kullanıcılara verilecek hediye puan miktarını belirleyin.</p>

                    <div className="relative group">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-[#432818]" size={20} />
                        <input
                            type="number"
                            value={newWelcomeBonus}
                            onChange={(e) => setNewWelcomeBonus(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#432818] font-black text-[#432818] text-xl tabular-nums transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#432818]/40 uppercase tracking-widest">VOLT</span>
                    </div>

                    <button onClick={onSave} className="w-full bg-[#432818] text-white py-4 rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all tracking-wide text-sm">
                        DEĞİŞİKLİKLERİ KAYDET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBonusModal;