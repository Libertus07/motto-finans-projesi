import { useState } from 'react';
import { playCashSound } from '../../utils/pos/sounds';
import { formatCurrency } from '../../utils/helpers';
import { LoyaltyCustomer, Transaction, CartItem, PaymentMethod, BankName, TransactionType } from '../../types';

interface UseCheckoutProps {
    cartHook: {
        cart: CartItem[];
        setCart: (cart: CartItem[]) => void;
    };
    paymentHook: {
        paymentMethod: PaymentMethod | 'mix';
        cardBank: BankName | null;
        isPartialMode: boolean;
        updatePartialPayment: (amount: number, total: number) => { completed: boolean; newPaid: number };
        setCustomTotal: (val: string) => void;
        resetPayment: () => void;
    };
    loyaltyHook: {
        loyaltyCustomer: LoyaltyCustomer | null;
        resetCustomer: () => void;
    };
    transactionsHook: {
        saveTransaction: (data: Partial<Transaction>, customer: LoyaltyCustomer | null) => Promise<{ success: boolean; id?: string }>;
    };
    totals: {
        subTotal: number;
        discountAmount: number;
        partialRawAmount?: number;
        finalTotal: number;
    };
    currentPayable: number;
    loyaltyDiscount: number;
    setLoyaltyDiscount: (val: number) => void;
    setSuccessMsg: (msg: string) => void;
}

export const useCheckout = ({
    cartHook,
    paymentHook,
    loyaltyHook,
    transactionsHook,
    totals,
    currentPayable,
    loyaltyDiscount,
    setLoyaltyDiscount,
    setSuccessMsg
}: UseCheckoutProps) => {
    const [processing, setProcessing] = useState(false);

    const handleCheckout = async () => {
        if (cartHook.cart.length === 0) return;

        setProcessing(true);

        try {
            // 🔥 KRİTİK HESAPLAMA: İndirim tutarını puana geri çeviriyoruz (1 TL = 2 Puan)
            // Bu oran işletme ayarlarına göre değişebilir, şimdilik sabit.
            const pointsSpentVal = loyaltyDiscount / 0.5;

            const transactionData = {
                amount: currentPayable,      // Kasaya giren net para
                total: totals.subTotal,      // İndirim öncesi toplam
                loyaltyDiscount: loyaltyDiscount, // Puanla yapılan indirim
                discount: totals.discountAmount, // Jest/Manuel indirim
                pointsSpent: pointsSpentVal, // Harcanan puan miktarı
                method: paymentHook.paymentMethod,
                cardBank: paymentHook.cardBank,
                type: 'income' as TransactionType,
                desc: paymentHook.isPartialMode ? 'Parçalı POS Satışı' : 'POS Satışı',
                date: new Date().toISOString().split('T')[0]
            };

            // 1. İşlemi Kaydet ve Puanları Güncelle
            const result = await transactionsHook.saveTransaction(transactionData, loyaltyHook.loyaltyCustomer);

            if (result.success) {
                playCashSound();

                if (paymentHook.isPartialMode) {
                    // Parçalı ödeme: paidSoFar'ı güncelle, tam ödenmişse kapat
                    // ✨ JEST MANTIĞI: Kasaya giren (currentPayable) değil, borçtan düşülen (partialRawAmount) kullanılır.
                    // Use a safe fallback if partialRawAmount is undefined
                    const updateResult = paymentHook.updatePartialPayment(totals.partialRawAmount || currentPayable, totals.finalTotal);

                    if (updateResult.completed) {
                        setSuccessMsg(`Hesap tamamen kapatıldı! ₺${formatCurrency(updateResult.newPaid)} tahsil edildi.`);
                        resetAfterPayment();
                    } else {
                        setSuccessMsg(`₺${formatCurrency(currentPayable)} tahsil edildi. Kalan: ₺${formatCurrency(totals.finalTotal - updateResult.newPaid)}`);

                        // Kısmi ödemede sadece anlık indirimleri sıfırla, sepeti koru
                        setLoyaltyDiscount(0);
                        paymentHook.setCustomTotal('');
                    }
                } else {
                    // Normal tam ödeme
                    setSuccessMsg(`₺${formatCurrency(currentPayable)} Tahsil Edildi`);
                    resetAfterPayment();
                }

                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error) {
            console.error("Ödeme Hatası:", error);
        } finally {
            setProcessing(false);
        }
    };

    // Ödeme sonrası temizlik işlemleri
    const resetAfterPayment = () => {
        setLoyaltyDiscount(0);
        paymentHook.setCustomTotal('');
        cartHook.setCart([]);
        paymentHook.resetPayment();
        loyaltyHook.resetCustomer();
        localStorage.removeItem('motto_pos_active_customer_phone');
    };

    return {
        processing,
        handleCheckout
    };
};
