import React from 'react';
import { Landmark, Search, ShoppingBag, Bell, CreditCard, Sparkles } from 'lucide-react';

interface BottomNavProps {
    view: string;
    setView: (view: string) => void;
    cartCount: number;
    onOpenService: () => void;
    onResetCategory: () => void;
    t: (key: string) => string;
    onPaymentClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ view, setView, cartCount, onOpenService, onResetCategory, t, onPaymentClick }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t-2 border-[#432818]/5 shadow-[0_-10px_40px_rgba(67,40,24,0.05)] z-40 pb-safe">
            <div className="flex justify-between items-end h-20 px-6 max-w-md mx-auto relative">
                <button onClick={() => { setView('home'); onResetCategory(); }} className={`flex flex-col items-center justify-center w-14 h-14 mb-2 transition-colors ${view === 'home' ? 'text-[#432818]' : 'text-[#432818]/40'}`}><Landmark size={24} strokeWidth={view === 'home' ? 2.5 : 2} /><span className={`text-[9px] mt-1 font-cinzel ${view === 'home' ? 'font-bold' : 'font-medium'}`}>{t('home')}</span></button>
                <button onClick={() => setView('search')} className={`flex flex-col items-center justify-center w-14 h-14 mb-2 transition-colors ${view === 'search' ? 'text-[#432818]' : 'text-[#432818]/40'}`}><Search size={24} strokeWidth={view === 'search' ? 2.5 : 2} /><span className={`text-[9px] mt-1 font-cinzel ${view === 'search' ? 'font-bold' : 'font-medium'}`}>{t('search')}</span></button>

                {/* CART - Central Button */}
                <button onClick={() => setView('cart')} className="relative -top-8 group">
                    <div id="cart-nav-button" className="w-16 h-16 bg-[#432818] rounded-[2rem] rotate-45 flex items-center justify-center shadow-xl border-[4px] border-[#FDFBF7] group-active:scale-95 transition-transform overflow-hidden">
                        <div className="-rotate-45 flex flex-col items-center relative">
                            <ShoppingBag size={24} color="#D4AF37" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-[#D4AF37] text-[#432818] text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#432818]">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-[#432818] absolute -bottom-6 left-1/2 -translate-x-1/2 mt-1 font-cinzel tracking-tighter">{t('cart')}</span>
                </button>

                <button onClick={onOpenService} className="flex flex-col items-center justify-center w-14 h-14 mb-2 transition-colors text-[#432818]/40 hover:text-[#432818]"><Bell size={24} strokeWidth={2} /><span className="text-[9px] font-medium mt-1 font-cinzel">Garson</span></button>

                {/* PAYMENT - Moved here */}
                <button
                    onClick={onPaymentClick}
                    className={`flex flex-col items-center justify-center w-14 h-14 mb-2 transition-colors text-[#432818]/40 hover:text-[#432818]`}
                >
                    <CreditCard size={24} strokeWidth={2} />
                    <span className={`text-[9px] mt-1 font-cinzel font-medium`}>Ödeme</span>
                </button>
            </div>
        </div>
    );
};

export default BottomNav;
