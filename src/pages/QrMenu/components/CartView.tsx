import React from 'react';
import { Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, CreditCard, Wallet, Trash2 } from 'lucide-react';
import { QrCartItem } from '../../../types';

interface CartViewProps {
    cart: any[];
    setCart: (cart: any[]) => void;
    setView: (view: string) => void;
    isMember: boolean;
    setAuthMode: (mode: 'login' | 'register') => void;
    setIsAuthModalOpen: (isOpen: boolean) => void;
    handlePlaceOrder: (method: 'cash' | 'online') => void;
    t: (key: string) => string;
}

const CartView: React.FC<CartViewProps> = ({
    cart, setCart, setView, isMember, setAuthMode, setIsAuthModalOpen, handlePlaceOrder, t
}) => {

    const updateQuantity = (uniqueId: string, delta: number) => {
        const newCart = cart.map(item => {
            if (item.uniqueId === uniqueId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0);
        setCart(newCart);
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(cart.filter(item => item.uniqueId !== uniqueId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-40 h-40 bg-[#432818]/5 rounded-full flex items-center justify-center mb-8 relative">
                <ShoppingBag size={64} className="text-[#432818]/20" strokeWidth={1} />
                <div className="absolute top-8 right-8 w-4 h-4 bg-[#D4AF37] rounded-full animate-ping"></div>
            </div>
            <h2 className="text-2xl font-black text-[#432818] mb-3 font-cinzel tracking-wide">{t('cart_empty_title')}</h2>
            <p className="text-[#432818]/60 text-sm leading-relaxed max-w-xs mb-10 font-medium">
                {t('cart_empty_desc')}
            </p>
            <button
                onClick={() => setView('home')}
                className="px-10 py-4 bg-[#432818] text-[#D4AF37] rounded-xl font-bold font-cinzel shadow-xl hover:bg-[#2c1a0f] active:scale-95 transition-all text-sm tracking-widest"
            >
                {t('return_menu')}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-40 flex flex-col">
            {/* Header */}
            <div className="p-6 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md z-20 flex items-center justify-between border-b border-[#432818]/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('home')}
                        className="w-10 h-10 rounded-full bg-[#432818]/5 flex items-center justify-center text-[#432818] hover:bg-[#432818]/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-[#432818] font-cinzel tracking-wide">{t('cart_title')}</h1>
                </div>
                <div className="bg-[#432818] text-[#D4AF37] px-3 py-1 rounded text-xs font-bold font-mono">
                    {cart.reduce((a, b) => a + b.quantity, 0)} {t('product_count')}
                </div>
            </div>

            {/* Cart Items */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {cart.map((item, index) => (
                    <div
                        key={item.uniqueId}
                        className="group bg-white rounded-2xl p-3 border border-[#432818]/5 shadow-sm hover:border-[#D4AF37]/30 transition-all flex gap-4 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                        style={{ animationDelay: `${index * 50} ms` }}
                    >
                        {/* Image */}
                        <div className="w-24 h-24 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-4xl shrink-0 shadow-inner">
                            {item.image}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-[#432818] font-cinzel text-lg leading-tight">{item.name}</h3>
                                    <button
                                        onClick={() => removeFromCart(item.uniqueId)}
                                        className="text-[#432818]/20 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {item.customization?.notes && (
                                    <p className="text-xs text-[#432818]/50 italic mt-1 line-clamp-1">"{item.customization.notes}"</p>
                                )}
                            </div>

                            <div className="flex items-end justify-between">
                                <span className="font-black text-[#432818] text-lg font-cinzel">{item.price * item.quantity} ₺</span>

                                <div className="flex items-center gap-3 bg-[#FDFBF7] rounded-lg p-1 border border-[#432818]/5">
                                    <button
                                        onClick={() => updateQuantity(item.uniqueId, -1)}
                                        className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#432818] shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="font-black text-[#432818] w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.uniqueId, 1)}
                                        className="w-8 h-8 rounded bg-[#432818] flex items-center justify-center text-[#D4AF37] shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Checkout Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(67,40,24,0.15)] z-50 p-6 pb-safe-bottom animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-[#432818]/10 rounded-full mx-auto mb-6"></div>

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[#432818]/40 text-xs font-bold uppercase tracking-widest mb-1">{t('total_amount')}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[#432818] font-cinzel tracking-tight">{totalAmount}</span>
                            <span className="text-xl font-bold text-[#432818]">₺</span>
                        </div>
                    </div>
                    {isMember && (
                        <div className="text-right">
                            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">{t('will_earn')}</p>
                            <div className="flex items-center justify-end gap-1 text-[#D4AF37]">
                                <span className="text-2xl font-black font-cinzel">+{Math.floor(totalAmount)}</span>
                                <span className="text-sm font-bold">VOLT</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            if (!isMember) {
                                setAuthMode('register');
                                setIsAuthModalOpen(true);
                            } else {
                                handlePlaceOrder('online');
                            }
                        }}
                        className={`w - full py - 4 rounded - xl font - bold flex items - center justify - between px - 6 transition - all active: scale - [0.98] ${isMember
                            ? 'bg-[#432818] text-[#D4AF37] shadow-lg shadow-[#432818]/20'
                            : 'bg-[#FDFBF7] border-2 border-[#432818]/10 text-[#432818]/40'
                            } `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p - 2 rounded - lg ${isMember ? 'bg-[#D4AF37]/20' : 'bg-[#432818]/5'} `}>
                                <CreditCard size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block leading-none font-cinzel text-lg">{t('pay_online')}</span>
                                {!isMember && <span className="text-[10px] font-bold font-sans opacity-70">{t('members_only')}</span>}
                            </div>
                        </div>
                        {isMember && <ArrowRight size={20} />}
                    </button>

                    <button
                        onClick={() => handlePlaceOrder('cash')}
                        className="w-full bg-[#D4AF37] text-[#432818] py-4 rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-[#432818]/10">
                                <Wallet size={24} />
                            </div>
                            <span className="text-lg font-cinzel">{t('pay_cash')}</span>
                        </div>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartView;
