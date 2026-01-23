import React from 'react';
import { X, Gift, Share2 } from 'lucide-react';
import { CustomerProfile } from './qrMenu';

interface InviteFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: CustomerProfile | null;
    showToast: (msg: string, type: 'success' | 'error') => void;
    t: (key: string) => string;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose, customerProfile, showToast, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#050302] w-full max-w-sm rounded-[2.5rem] relative shadow-[0_0_50px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/10 overflow-hidden text-center">
                <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2.5 bg-white/5 text-[#FDFBF7]/40 hover:text-[#D4AF37] hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>

                    <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)] border border-[#D4AF37]/20 transform -rotate-6">
                        <Gift size={36} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-widest uppercase mb-2">{t('invite_title')}</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 px-8">{t('invite_desc')}</p>

                    <div
                        className="bg-black/40 p-6 rounded-3xl border-2 border-dashed border-[#D4AF37]/20 mb-8 relative group cursor-pointer hover:border-[#D4AF37]/40 transition-all active:scale-[0.98]"
                        onClick={() => {
                            navigator.clipboard.writeText((customerProfile as any)?.personalInviteCode || '...');
                            showToast('Davet kodu kopyalandı!', 'success');
                        }}
                    >
                        <span className="text-2xl font-black text-[#D4AF37] font-mono tracking-[0.3em]">{(customerProfile as any)?.personalInviteCode || 'YÜKLENİYOR...'}</span>
                        <div className="absolute inset-0 flex items-center justify-center bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{t('copy_code')}</span>
                        </div>
                    </div>

                    <button onClick={() => {
                        const inviteCode = (customerProfile as any)?.personalInviteCode || '';
                        const shareUrl = window.location.href;
                        const shareText = `☕️ Motto Club'a Davetlisin!\n\nSana özel davet kodumla üye ol, ilk siparişinde 50 Volt (5 TL) kazan! 🎁\n\n🔑 Davet Kodum: ${inviteCode}\n\n👇 Hemen sipariş ver:`;

                        if (navigator.share) {
                            navigator.share({
                                title: 'Motto Club Daveti',
                                text: shareText,
                                url: shareUrl
                            }).catch(() => { });
                        } else {
                            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                            showToast('Davet linki kopyalandı.', 'success');
                        }
                    }} className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-black font-cinzel shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 tracking-widest text-xs">
                        <Share2 size={18} strokeWidth={2.5} />
                        DAVET ET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendModal;