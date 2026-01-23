import React from 'react';
import { X, CreditCard, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../../../types';

interface CardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: Card[];
    isAddingCard: boolean;
    setIsAddingCard: (val: boolean) => void;
    newCard: { holderName: string; number: string; expiry: string; cvc: string };
    setNewCard: (card: { holderName: string; number: string; expiry: string; cvc: string }) => void;
    cardLoading: boolean;
    onAddCard: (e: React.FormEvent) => void;
    onDeleteCard: (id: string) => void;
}

const CardsModal: React.FC<CardsModalProps> = ({
    isOpen, onClose, cards, isAddingCard, setIsAddingCard, newCard, setNewCard, cardLoading, onAddCard, onDeleteCard
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => { onClose(); setIsAddingCard(false); }} />
            <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] relative shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/30 flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#D4AF37]/20 flex justify-between items-center bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                            <CreditCard size={20} className="text-[#D4AF37]" />
                        </div>
                        <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-wide">Ödeme Yöntemleri</h2>
                    </div>
                    <button onClick={() => { onClose(); setIsAddingCard(false); }} className="p-2 hover:bg-[#D4AF37]/10 rounded-full text-[#FDFBF7]/60 hover:text-[#D4AF37] transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {isAddingCard ? (
                        <form onSubmit={onAddCard} className="space-y-6">
                            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-6 rounded-2xl relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-[#FDFBF7] border border-[#D4AF37]/30">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <div className="mb-8 flex justify-between items-center opacity-80 relative z-10">
                                    <CreditCard size={24} className="text-[#D4AF37]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] font-cinzel">Motto Card</span>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-transparent border-b border-[#FDFBF7]/20 px-0 py-2 text-xl font-mono font-bold text-[#FDFBF7] placeholder:text-[#FDFBF7]/20 outline-none focus:border-[#D4AF37] transition-all"
                                            value={newCard.number}
                                            onChange={e => {
                                                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                setNewCard({ ...newCard, number: v.replace(/(\d{4})(?=\d)/g, '$1 ') });
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="AA/YY"
                                                className="w-full bg-transparent border-b border-[#FDFBF7]/20 px-0 py-2 font-mono font-bold text-[#FDFBF7] placeholder:text-[#FDFBF7]/20 outline-none focus:border-[#D4AF37] transition-all"
                                                value={newCard.expiry}
                                                onChange={e => {
                                                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                                    setNewCard({ ...newCard, expiry: v });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="CVC"
                                                className="w-full bg-transparent border-b border-[#FDFBF7]/20 px-0 py-2 font-mono font-bold text-[#FDFBF7] placeholder:text-[#FDFBF7]/20 outline-none focus:border-[#D4AF37] transition-all text-right"
                                                value={newCard.cvc}
                                                onChange={e => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="KART SAHİBİ"
                                            className="w-full bg-transparent border-b border-[#FDFBF7]/20 px-0 py-2 font-bold text-[#FDFBF7] placeholder:text-[#FDFBF7]/20 outline-none focus:border-[#D4AF37] transition-all uppercase text-sm"
                                            value={newCard.holderName}
                                            onChange={e => setNewCard({ ...newCard, holderName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCard(false)}
                                    className="flex-1 py-4 rounded-xl font-bold text-[#FDFBF7]/60 hover:bg-white/5 hover:text-[#FDFBF7] transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={cardLoading}
                                    className="flex-1 bg-[#D4AF37] text-black py-4 rounded-xl font-black font-cinzel hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {cardLoading ? <Loader2 className="animate-spin" /> : 'KAYDET'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {cards.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 group hover:border-[#D4AF37]/30 transition-colors">
                                    <CreditCard size={40} className="mx-auto text-white/10 mb-3 group-hover:text-[#D4AF37]/40 transition-colors" />
                                    <p className="text-white/40 font-bold text-sm">Kayıtlı kartınız yok.</p>
                                </div>
                            ) : (
                                cards.map(card => (
                                    <div key={card.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm group hover:border-[#D4AF37]/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20">
                                                <CreditCard size={20} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#FDFBF7] text-sm font-mono tracking-wider">{card.maskedNumber}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">{card.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteCard(card.id)}
                                            className="p-2.5 text-[#FDFBF7]/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                            <button
                                onClick={() => setIsAddingCard(true)}
                                className="w-full py-4 border border-dashed border-[#D4AF37]/30 rounded-2xl text-[#D4AF37] font-bold flex items-center justify-center gap-2 hover:bg-[#D4AF37]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus size={18} strokeWidth={2.5} /> YENİ KART EKLE
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardsModal;