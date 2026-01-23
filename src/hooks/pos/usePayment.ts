import { useState, useCallback } from 'react';
import { PaymentMethod, BankName } from '../../types';

/**
 * Custom hook for managing POS payment state and operations
 * 
 * Handles all payment-related state including:
 * - Payment method selection (cash/card/iban/mix)
 * - Bank selection for card payments
 * - Discount management (cycling through 0%, 10%, 15%, 20%)
 * - Bill splitting (1-4 ways)
 * - Manual total override (rounding)
 * - Partial payment mode with debt tracking
 * 
 * @returns Payment state and operations
 * @returns paymentMethod - Current payment method
 * @returns cardBank - Selected bank for card payments
 * @returns discountRate - Current discount percentage (0-20)
 * @returns splitCount - Number of ways to split bill (1-4)
 * @returns customTotal - Manual total override value
 * @returns receivedAmount - Amount received from customer
 * @returns isPartialMode - Whether partial payment mode is active
 * @returns paidSoFar - Total amount paid in partial mode
 * @returns cycleDiscountRate - Cycle through discount rates (0→10→15→20→0)
 * @returns cycleSplitCount - Cycle through split counts (1→2→3→4→1)
 * @returns resetPayment - Reset all payment settings to defaults
 * @returns enablePartialMode - Enable partial payment mode
 * @returns disablePartialMode - Disable partial payment mode and reset debt
 * @returns updatePartialPayment - Update partial payment progress
 * 
 * @example
 * const { paymentMethod, setPaymentMethod, cycleDiscountRate } = usePayment();
 * 
 * // Change payment method
 * setPaymentMethod('card');
 * 
 * // Apply discount
 * cycleDiscountRate(); // 0% → 10%
 * cycleDiscountRate(); // 10% → 15%
 * 
 * @example
 * // Partial payment scenario
 * const { enablePartialMode, updatePartialPayment, paidSoFar } = usePayment();
 * 
 * enablePartialMode();
 * const result = updatePartialPayment(100, 300); // Pay 100 of 300 total
 * // result.completed === false, result.newPaid === 100
 */
export const usePayment = () => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'mix'>('cash');
    const [cardBank, setCardBank] = useState<BankName | null>('ziraat' as BankName);
    const [discountRate, setDiscountRate] = useState(0);
    const [splitCount, setSplitCount] = useState(1);
    const [customTotal, setCustomTotal] = useState<string>('');
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [isPartialMode, setIsPartialMode] = useState(false);
    const [paidSoFar, setPaidSoFar] = useState(0);

    // İndirim oranını değiştir (döngüsel)
    const cycleDiscountRate = useCallback(() => {
        setDiscountRate(prev => {
            if (prev >= 20) return 0;
            if (prev === 0) return 10;
            return prev + 5;
        });
    }, []);

    // Bölme sayısını değiştir (döngüsel)
    const cycleSplitCount = useCallback(() => {
        setSplitCount(prev => {
            if (prev === 1) return 2;
            if (prev === 2) return 3;
            if (prev === 3) return 4;
            return 1;
        });
    }, []);

    // Ödeme yöntemini sıfırla
    const resetPayment = useCallback(() => {
        setDiscountRate(0);
        setSplitCount(1);
        setCustomTotal('');
        setReceivedAmount('');
        setPaymentMethod('cash');
    }, []);

    // Parçalı ödeme modunu aç
    const enablePartialMode = useCallback(() => {
        setIsPartialMode(true);
        setSplitCount(1);
    }, []);

    // Parçalı ödeme modunu kapat
    const disablePartialMode = useCallback(() => {
        setIsPartialMode(false);
        setPaidSoFar(0);
        setCustomTotal('');
    }, []);

    // Parçalı ödeme sonrası güncelle
    const updatePartialPayment = useCallback((amountPaid: number, totalDebt: number) => {
        const newPaid = paidSoFar + amountPaid;

        if (newPaid >= totalDebt - 0.5) {
            // Tam ödeme tamamlandı
            return { completed: true, newPaid };
        } else {
            // Hala borç var
            setPaidSoFar(newPaid);
            setCustomTotal('');
            setDiscountRate(0);
            return { completed: false, newPaid };
        }
    }, [paidSoFar]);

    return {
        // State
        paymentMethod,
        cardBank,
        discountRate,
        splitCount,
        customTotal,
        receivedAmount,
        isPartialMode,
        paidSoFar,

        // Setters
        setPaymentMethod,
        setCardBank,
        setDiscountRate,
        setSplitCount,
        setCustomTotal,
        setReceivedAmount,
        setIsPartialMode,
        setPaidSoFar,

        // Actions
        cycleDiscountRate,
        cycleSplitCount,
        resetPayment,
        enablePartialMode,
        disablePartialMode,
        updatePartialPayment
    };
};
