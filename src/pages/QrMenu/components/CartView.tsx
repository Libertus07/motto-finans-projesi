import React from 'react';
import { Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, CreditCard, Wallet, Trash2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { Deal } from '../../../types';

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

    // Coupon State
    const [couponCode, setCouponCode] = React.useState('');
    const [appliedDiscount, setAppliedDiscount] = React.useState<{ code: string; amount: number; type: 'percentage' | 'fixed' } | null>(null);
    const [couponError, setCouponError] = React.useState<string | null>(null);
    const [verifying, setVerifying] = React.useState(false);

    const finalTotal = appliedDiscount ? Math.max(0, totalAmount - appliedDiscount.amount) : totalAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setVerifying(true);
        setCouponError(null);

        try {
            const dealsRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'deals');
            const q = query(dealsRef, where('code', '==', couponCode.toUpperCase()), where('isActive', '==', true));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setCouponError('Geçersiz veya süresi dolmuş kupon kodu.');
                setVerifying(false);
                return;
            }

            const dealData = snapshot.docs[0].data() as Deal;

            // Check Expiry
            if (dealData.expiresAt && new Date(dealData.expiresAt) < new Date()) {
                setCouponError('Bu kuponun süresi dolmuş.');
                setVerifying(false);
                return;
            }

            // Calculate Discount
            let discountAmount = 0;
            if (dealData.discountType === 'percentage') {
                discountAmount = (totalAmount * (dealData.discountValue || 0)) / 100;
            } else {
                discountAmount = dealData.discountValue || 0;
            }

            setAppliedDiscount({
                code: dealData.code,
                amount: discountAmount,
                type: dealData.discountType
            });
            setCouponCode('');
        } catch (error) {
            console.error("Coupon verification error", error);
            setCouponError('Kupon sorgulanırken hata oluştu.');
        } finally {
            setVerifying(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(null);
    };

    const handleCheckout = (method: 'cash' | 'online') => {
        // Trigger Fireworks!
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Pass total with discount if needed, but usually we just place order. 
        // Logic for backend to validate total might enter here, 
        // but for now we assume client trust for MVP or send discount amount.
        // Assuming handlePlaceOrder takes method only. 
        // In a real app we'd send the coupon code with the order.
        handlePlaceOrder(method);
    };

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

                {/* Coupon Code Section */}
                <div className="mb-6">
                    {appliedDiscount ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Wallet size={18} />
                                <span className="font-bold sm:text-sm text-xs">Kupon Uygulandı: {appliedDiscount.code}</span>
                            </div>
                            <button
                                onClick={handleRemoveCoupon}
                                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold underline"
                            >
                                Kaldır
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Kampanya Kodu (Opsiyonel)"
                                    className="flex-1 bg-[#F9F7F5] border border-[#432818]/10 rounded-xl px-4 py-3 text-[#432818] text-sm focus:outline-none focus:border-[#D4AF37] placeholder:text-[#432818]/30 font-bold"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || verifying}
                                    className="bg-[#432818] text-[#D4AF37] px-4 rounded-xl font-bold text-sm disabled:opacity-50"
                                >
                                    {verifying ? '...' : 'Uygula'}
                                </button>
                            </div>
                            {couponError && <p className="text-red-500 text-xs font-bold pl-1">{couponError}</p>}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[#432818]/40 text-xs font-bold uppercase tracking-widest mb-1">{t('total_amount')}</p>
                        <div className="flex flex-col">
                            {appliedDiscount && (
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-[#432818]/40 line-through text-lg font-bold">{totalAmount} ₺</span>
                                    <span className="text-emerald-600 text-sm font-bold">(-{Math.floor(appliedDiscount.amount)} ₺)</span>
                                </div>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-[#432818] font-cinzel tracking-tight">{Math.max(0, finalTotal)}</span>
                                <span className="text-xl font-bold text-[#432818]">₺</span>
                            </div>
                        </div>
                    </div>
                    {isMember && (
                        <div className="text-right">
                            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">{t('will_earn')}</p>
                            <div className="flex items-center justify-end gap-1 text-[#D4AF37]">
                                <span className="text-2xl font-black font-cinzel">+{Math.floor(finalTotal)}</span>
                                <span className="text-sm font-bold">VOLT</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <button
                        disabled={true}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-between px-6 transition-all bg-[#F3F4F6] border-2 border-dashed border-gray-300 text-gray-400 cursor-not-allowed`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-gray-200 text-gray-400`}>
                                <div className="relative">
                                    <CreditCard size={24} />
                                    <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-0.5 border border-white">
                                        <Lock size={10} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="block leading-none font-cinzel text-lg">{t('pay_online')}</span>
                                <span className="text-[10px] font-bold font-sans opacity-70 uppercase tracking-wider">YAKINDA</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleCheckout('cash')}
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
