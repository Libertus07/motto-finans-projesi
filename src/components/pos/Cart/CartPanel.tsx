// components/pos/Cart/CartPanel.tsx
import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import CartToolbar from './CartToolbar';
import CartItem from './CartItem';
import CartModeButtons from './CartModeButtons';
import CartSummary from './CartSummary';
import LoyaltyPointsSelector from '../Payment/LoyaltyPointsSelector';
import { CartItem as CartItemType, LoyaltyCustomer } from '../../../types';

interface CartPanelProps {
    children?: React.ReactNode;
    cart: CartItemType[];
    isDarkMode: boolean;
    activeTab: string;
    isSelectionMode: boolean;
    isPartialMode: boolean;
    selectedItems: Record<string, number>;
    discountRate: number;
    splitCount: number;
    customTotal: string;
    currentPayable: number;
    paidSoFar: number;
    remainingDebt: number;
    discountAmount: number;

    // ✨ CashierPOS'tan gelen müşteri verisi
    loyaltyCustomer: LoyaltyCustomer | null;
    loyaltyDiscount: number;
    onCancelLoyaltyDiscount: () => void;
    onRedeemPoints: (points: number, originalPoints: number) => void;

    // Modal states
    showLoyaltyModal: boolean;
    showChangeModal: boolean;
    showHistoryModal: boolean;
    showHeldOrdersModal: boolean;

    // Handlers
    onUpdateQuantity: (id: string, change: number) => void;
    onToggleSelection: (id: string, maxQty: number, change: number) => void;
    onRemoveFromCart: (id: string) => void;
    onCloseTab: () => void;
    onLoyaltyClick: () => void;
    onDiscountClick: () => void;
    onRoundClick: () => void;
    onChangeClick: () => void;
    onHoldClick: () => void;
    onHistoryClick: () => void;
    onClearCart: () => void;
    onSelectionToggle: () => void;
    onPartialClick: () => void;
    onSplitClick: () => void;
    onCloseSummary: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
    children,
    cart,
    isDarkMode,
    activeTab,
    isSelectionMode,
    isPartialMode,
    selectedItems,
    discountRate,
    splitCount,
    customTotal,
    currentPayable,
    paidSoFar,
    remainingDebt,
    discountAmount,

    // ✨ CashierPOS'tan gelen müşteri verisi
    loyaltyCustomer,
    loyaltyDiscount,
    onCancelLoyaltyDiscount,
    onRedeemPoints,

    // Modal states
    showLoyaltyModal,
    showChangeModal,
    showHistoryModal,
    showHeldOrdersModal,

    // Handlers
    onUpdateQuantity,
    onToggleSelection,
    onRemoveFromCart,
    onCloseTab,
    onLoyaltyClick,
    onDiscountClick,
    onRoundClick,
    onChangeClick,
    onHoldClick,
    onHistoryClick,
    onClearCart,
    onSelectionToggle,
    onPartialClick,
    onSplitClick,
    onCloseSummary
}) => {
    return (
        <div className={`
            absolute inset-0 lg:static w-full lg:w-[460px] lg:min-w-[460px]
            lg:rounded-3xl lg:border lg:shadow-2xl 
            flex flex-col shrink-0 h-full 
            transition-transform duration-500 ease-in-out z-30 
            ${activeTab === 'cart' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
            ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}
        `}>

            {/* MOBILE HEADER */}
            <div className={`
                lg:hidden flex items-center justify-between p-4 border-b 
                ${isDarkMode ? 'bg-[#141824] border-white/5' : 'bg-white border-slate-200'}
            `}>
                <div className="flex items-center gap-3">
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Sipariş Detayı
                    </span>
                </div>
                <button
                    onClick={onCloseTab}
                    className={`
                        p-2 rounded-lg border active:scale-90 transition-transform 
                        ${isDarkMode
                            ? 'bg-slate-800/50 text-white border-white/5'
                            : 'bg-slate-100 text-slate-700 border-slate-200'}
                    `}
                >
                    <X size={20} />
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* ... Toolbar ve Liste ... */}

                {/* ✨ PUAN SEÇİCİ ARTIK BURADA, SADECE SEPETİ KAPLIYOR */}
                <LoyaltyPointsSelector
                    isOpen={showLoyaltyModal}
                    onClose={onLoyaltyClick} // Kapatma handler'ı
                    loyaltyCustomer={loyaltyCustomer}
                    currentPayable={currentPayable}
                    onConfirm={(pts: number) => onRedeemPoints(pts * 0.5, pts)} //
                    isDarkMode={isDarkMode}
                />

                {/* SOL TOOLBAR */}
                <CartToolbar
                    isDarkMode={isDarkMode}
                    discountRate={discountRate}
                    customTotal={customTotal}
                    isSelectionMode={isSelectionMode}
                    showLoyaltyModal={showLoyaltyModal}
                    showChangeModal={showChangeModal}
                    showHistoryModal={showHistoryModal}
                    showHeldOrdersModal={showHeldOrdersModal}
                    cartLength={cart.length}
                    loyaltyCustomer={loyaltyCustomer} // ✅ Toolbar zaten alıyor
                    onLoyaltyClick={onLoyaltyClick}
                    onDiscountClick={onDiscountClick}
                    onRoundClick={onRoundClick}
                    onChangeClick={onChangeClick}
                    onHoldClick={onHoldClick}
                    onHistoryClick={onHistoryClick}
                    onClearCart={onClearCart}
                />

                {/* ORTA: SEPET LİSTESİ */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className={`
                        flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar
                        ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}
                    `}>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4 opacity-40">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                                    <ShoppingCart size={40} strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-medium tracking-wide">
                                    Henüz ürün eklenmedi
                                </p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    isSelectionMode={isSelectionMode}
                                    selectedItems={selectedItems}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onToggleSelection={onToggleSelection as any}
                                    onRemove={onRemoveFromCart}
                                    isDarkMode={isDarkMode}
                                />
                            ))
                        )}
                    </div>

                    {/* MOD BUTONLARI */}
                    <CartModeButtons
                        isDarkMode={isDarkMode}
                        isSelectionMode={isSelectionMode}
                        isPartialMode={isPartialMode}
                        splitCount={splitCount}
                        onSelectionToggle={onSelectionToggle}
                        onPartialClick={onPartialClick}
                        onSplitClick={onSplitClick}
                    />
                </div>
            </div>

            {/* ÖZET VE ÖDEME ALANI */}
            <div className={`
                p-5 border-t shrink-0 z-30 flex flex-col gap-4 relative
                ${isDarkMode
                    ? 'bg-slate-900 border-white/5 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]'
                    : 'bg-white border-slate-200 shadow-[0_-5px_30px_rgba(0,0,0,0.05)]'}
            `}>
                <CartSummary
                    isDarkMode={isDarkMode}
                    isPartialMode={isPartialMode}
                    isSelectionMode={isSelectionMode}
                    currentPayable={currentPayable}
                    paidSoFar={paidSoFar}
                    remainingDebt={remainingDebt}
                    discountAmount={discountAmount}
                    splitCount={splitCount}
                    onClose={onCloseSummary}
                    // ✨ KRİTİK DÜZELTME: Müşteri verisini buraya geçtik
                    loyaltyCustomer={loyaltyCustomer}
                    loyaltyDiscount={loyaltyDiscount}
                    onCancelLoyaltyDiscount={onCancelLoyaltyDiscount}
                />

                {children}
            </div>
        </div>
    );
};

export default CartPanel;
