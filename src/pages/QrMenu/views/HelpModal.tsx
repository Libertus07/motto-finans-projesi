import React from 'react';
import { X, MessageCircle, Phone } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#050302] w-full max-w-sm rounded-[2.5rem] relative shadow-[0_0_50px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/10 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-[#FDFBF7] font-cinzel tracking-tight uppercase">Motto Destek</h2>
                            <div className="h-0.5 w-8 bg-[#D4AF37] mt-1 rounded-full opacity-40"></div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 text-[#FDFBF7]/40 hover:text-[#D4AF37] hover:bg-white/10 rounded-2xl transition-all"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                            <h3 className="font-black text-[#D4AF37] font-cinzel text-xs tracking-widest uppercase mb-2">Puanlarımı nasıl harcarım?</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight leading-relaxed">Ödeme ekranında veya kasada QR kodunuzu okutarak puanlarınızı kullanabilirsiniz.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                            <h3 className="font-black text-[#D4AF37] font-cinzel text-xs tracking-widest uppercase mb-2">Siparişim gecikti ne yapmalıyım?</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight leading-relaxed">"Haberci" butonunu kullanarak garson çağırabilir veya durum sorgulayabilirsiniz.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <h3 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] font-cinzel text-center mb-6">{t('contact_us')}</h3>
                        <button className="w-full bg-[#25D366] text-white p-5 rounded-3xl font-black font-cinzel flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:opacity-90 active:scale-[0.98] transition-all tracking-widest text-xs">
                            <MessageCircle size={22} strokeWidth={2.5} /> WHATSAPP DESTEK
                        </button>
                        <button className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-3xl font-black font-cinzel flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all tracking-widest text-xs">
                            <Phone size={22} strokeWidth={2.5} className="text-[#D4AF37]" /> BİZİ ARAYIN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;