import React from 'react';
import { X, Ticket, Copy, Timer, Loader2 } from 'lucide-react';
import { Deal } from '../../../types';

interface DealsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deals: Deal[];
    isLoadingDeals: boolean;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

const DealsModal: React.FC<DealsModalProps> = ({ isOpen, onClose, deals, isLoadingDeals, showToast }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Kampanyalar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {isLoadingDeals ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#432818]/40" size={32} /></div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-12">
                            <Ticket size={40} className="mx-auto text-[#432818]/10 mb-3" />
                            <p className="text-[#432818]/40 font-bold text-sm">Aktif kampanya bulunmuyor.</p>
                        </div>
                    ) : (
                        deals.map((deal) => (
                            <div key={deal.id} className="bg-white p-4 rounded-2xl border border-[#432818]/5 relative shadow-sm hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-3xl shrink-0">
                                        {deal.image || '🎟️'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#432818] text-sm uppercase mb-1">{deal.title}</h3>
                                        <p className="text-[10px] text-[#432818]/60 mb-3 line-clamp-2">{deal.description}</p>

                                        <div className="flex items-center justify-between bg-[#FDFBF7] px-3 py-2 rounded-xl border border-[#432818]/5 border-dashed">
                                            <div className="flex items-center gap-2">
                                                <Ticket size={14} className="text-[#432818]/40" />
                                                <span className="font-mono font-bold text-[#432818] text-sm tracking-widest">{deal.code}</span>
                                            </div>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(deal.code); showToast('Kupon kodu kopyalandı!', 'success'); }}
                                                className="p-1.5 bg-[#432818]/5 text-[#432818] hover:bg-[#432818] hover:text-white rounded-lg transition-all"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        {deal.expiresAt && (
                                            <div className="flex items-center gap-1.5 mt-3 text-[9px] text-[#432818]/40 font-bold uppercase tracking-wide">
                                                <Timer size={10} strokeWidth={2.5} />
                                                <span>Son: {new Date(deal.expiresAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealsModal;