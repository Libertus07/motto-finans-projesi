// hooks/pos/usePayment.js
import { useState, useCallback } from 'react';

export const usePayment = () => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cardBank, setCardBank] = useState('ziraat');
    const [discountRate, setDiscountRate] = useState(0);
    const [splitCount, setSplitCount] = useState(1);
    const [customTotal, setCustomTotal] = useState('');
    const [receivedAmount, setReceivedAmount] = useState('');
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
    const updatePartialPayment = useCallback((amountPaid, totalDebt) => {
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