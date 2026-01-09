// components/pos/Payment/PaymentSection.jsx
import React, { useState } from 'react';
import { Printer, Wallet, Zap, CheckCircle2, Coins } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import BankSelector from './BankSelector';
import LoyaltyPointsSelector from './LoyaltyPointsSelector';

const PaymentSection = ({ 
    // State
    isDarkMode,
    paymentMethod,
    cardBank,
    currentPayable,
    processing,
    successMsg,
    cartLength,
    isSelectionMode,
    subTotal,
    activeBankStyle,
    
    // ✨ YENİ: Sadakat Propları
    loyaltyCustomer,
    loyaltyHook, // useLoyalty hook'u
    onRedeemPoints,
    
    // Handlers
    onMethodChange,
    onBankChange,
    onPrint,
    onCheckout,
}) => {
    const [showPointsSelector, setShowPointsSelector] = useState(false);
    
    return (
        <>
            {/* ÖDEME YÖNTEMİ SEÇİCİ */}
            <PaymentMethodSelector 
                paymentMethod={paymentMethod}
                onMethodChange={onMethodChange}
                isDarkMode={isDarkMode}
            />

            {/* BANKA SEÇİCİ (Sadece kart seçiliyse) */}
            {paymentMethod === 'card' && (
                <BankSelector 
                    selectedBank={cardBank}
                    onBankChange={onBankChange}
                    isDarkMode={isDarkMode}
                />
            )}

            {/* ✨ M-COIN İLE HIZLI ÖDEME (Sadece müşteri seçiliyse) */}
            {loyaltyCustomer && !successMsg && (
                <div className="mb-3 animate-in zoom-in duration-300">
                    <button
                        onClick={() => setShowPointsSelector(true)}
                        disabled={cartLength === 0 || processing}
                        className={`
                            w-full h-12 rounded-2xl border-2 border-dashed
                            flex items-center justify-between px-4
                            transition-all duration-300 group
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isDarkMode 
                                ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-solid' 
                                : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-solid'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-white/20">
                                <Coins size={16} className="group-hover:animate-spin" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase tracking-widest">M-Coin Kullan</span>
                                <span className="text-xs font-bold opacity-60">Puanla Öde</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black tabular-nums">{loyaltyCustomer.points}</span>
                            <span className="text-[10px] font-bold ml-1">M</span>
                        </div>
                    </button>
                </div>
            )}

            {/* M-COIN SEÇİCİ MODAL */}
            <LoyaltyPointsSelector
                isOpen={showPointsSelector}
                onClose={() => setShowPointsSelector(false)}
                loyaltyCustomer={loyaltyCustomer}
                currentPayable={currentPayable}
                onConfirm={(points) => {
                    // Müşterinin puanlarını düşür VE indirimi uygula
                    loyaltyHook.redeemPoints(points, (discountValue, usedPoints) => {
                        // Callback ile indirimi CashierPOS'a bildir
                        onRedeemPoints(discountValue, usedPoints);
                    });
                }}
                isDarkMode={isDarkMode}
            />

            {/* ANA BUTONLAR */}
            <div className="flex gap-3 mt-auto">
                {/* YAZDIR BUTONU */}
                <button 
                    onClick={onPrint} 
                    disabled={cartLength === 0}
                    className={`
                        w-14 h-14 rounded-2xl border 
                        flex items-center justify-center 
                        transition-all shadow-lg active:scale-95
                        ${isDarkMode 
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'}
                    `}
                >
                    <Printer size={24}/>
                </button>

                {/* TAHSİL ET BUTONU */}
                <button 
                    onClick={onCheckout} 
                    disabled={
                        cartLength === 0 || 
                        processing || 
                        (isSelectionMode && subTotal === 0)
                    }
                    className={`
                        flex-1 h-14 rounded-2xl font-bold text-lg 
                        flex items-center justify-center gap-2 
                        transition-all shadow-xl active:scale-[0.98] 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${successMsg 
                            ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
                            : (paymentMethod === 'cash' 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50' 
                                : `bg-gradient-to-r ${activeBankStyle.gradient} text-white ${activeBankStyle.shadow}`)
                        }
                    `}
                >
                    {processing ? (
                        <Zap className="animate-spin"/>
                    ) : successMsg ? (
                        <CheckCircle2 className="animate-bounce"/>
                    ) : (
                        <Wallet />
                    )}
                    
                    {successMsg || (
                        processing 
                            ? 'İşleniyor...' 
                            : (isSelectionMode ? 'SEÇİLENİ AL' : 'TAHSİL ET')
                    )}
                </button>
            </div>
        </>
    );
};

export default PaymentSection;