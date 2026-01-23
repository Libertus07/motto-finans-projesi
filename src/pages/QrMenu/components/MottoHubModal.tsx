import React from 'react';
import { X, TrendingUp, Music, MessageSquare, HelpCircle, Bell, Sparkles } from 'lucide-react';

interface MottoHubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenFeature: (feature: 'trends' | 'jukebox' | 'guestbook' | 'trivia' | 'service') => void;
}

const MottoHubModal: React.FC<MottoHubModalProps> = ({ isOpen, onClose, onOpenFeature }) => {
    if (!isOpen) return null;

    const hubItems = [
        { id: 'trends', label: 'Canlı Trendler', icon: TrendingUp, color: 'bg-orange-500', desc: 'Motto\'da şu an ne içiliyor?' },
        { id: 'jukebox', label: 'Motto Jukebox', icon: Music, color: 'bg-rose-500', desc: 'Müziği sen yönet.' },
        { id: 'guestbook', label: 'Anı Defteri', icon: MessageSquare, color: 'bg-emerald-500', desc: 'Bir mesaj bırak.' },
        { id: 'trivia', label: 'Motto Trivia', icon: HelpCircle, color: 'bg-amber-500', desc: 'Oyna ve Volt kazan.' },
        { id: 'service', label: 'Masa Servisi', icon: Bell, color: 'bg-blue-500', desc: 'Hızlı servis isteği.' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#1a110d]/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl animate-in zoom-in-95 duration-500">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                {/* Header */}
                <div className="p-8 pb-4 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl rotate-6 flex items-center justify-center shadow-lg border border-white/20">
                                <Sparkles size={24} className="text-[#1a110d]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white font-cinzel tracking-widest">MOTTO HUB</h2>
                                <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Experience Center</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="px-6 pb-10 relative z-10">
                    <div className="grid grid-cols-1 gap-3">
                        {hubItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onOpenFeature(item.id as any);
                                    onClose();
                                }}
                                className="group relative flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="block font-black text-white font-cinzel text-xs tracking-wider">{item.label}</span>
                                    <span className="block text-white/40 text-[10px] font-medium mt-0.5">{item.desc}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] transition-colors">
                                    <Sparkles size={14} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="px-8 pb-8 text-center opacity-40">
                    <p className="text-white text-[9px] font-black tracking-[0.4em] uppercase font-cinzel">
                        EST. 2023 • Premium Roastery
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MottoHubModal;
