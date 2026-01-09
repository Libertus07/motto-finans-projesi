// utils/pos/calculations.js
export const calculateTotals = ({
    cart,
    discountRate,
    splitCount,
    customTotal,
    isPartialMode,
    paidSoFar,
    isSelectionMode,
    selectedItems
}) => {
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectionTotal = cart.reduce((total, item) => {
        const selectedQty = selectedItems[item.id] || 0;
        return total + (item.price * selectedQty);
    }, 0);

    let baseTotal = isSelectionMode ? selectionTotal : cartTotal;
    let currentTotal = baseTotal;
    let discount = 0;
    let isManual = false;

    if (!isPartialMode && customTotal && parseFloat(customTotal) > 0) {
        const target = parseFloat(customTotal);
        if (target < baseTotal) {
            discount = baseTotal - target;
            currentTotal = target;
            isManual = true;
        }
    } 
    else if (discountRate > 0 && !isPartialMode) {
        discount = baseTotal * (discountRate / 100);
        currentTotal = baseTotal - discount;
    }

    const perPerson = currentTotal / splitCount;
    const remaining = Math.max(0, cartTotal - paidSoFar); 

    let pPayable = 0;
    let pDiscount = 0;
    
    if (isPartialMode) {
        const rawPartialAmount = customTotal ? parseFloat(customTotal) : remaining; 
        if (discountRate > 0) {
            pDiscount = rawPartialAmount * (discountRate / 100); 
            pPayable = rawPartialAmount - pDiscount; 
        } else {
            pPayable = rawPartialAmount;
        }
        if(discountRate > 0) discount = pDiscount;
    }

    return { 
        subTotal: baseTotal, 
        discountAmount: discount, 
        finalTotal: currentTotal, 
        perPersonAmount: perPerson, 
        remainingDebt: remaining,
        isManualMode: isManual,
        partialPayable: pPayable 
    };
};

export const getLocalISODate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getCurrentPayable = (isPartialMode, partialPayable, isSelectionMode, finalTotal) => {
    if (isPartialMode) return partialPayable;
    if (isSelectionMode) return finalTotal;

    // HATA BURADAYDI: Sadece perPersonAmount döndüğü için büyük rakam bölünüyor.
    // DÜZELTME: Normal modda büyük rakam her zaman "finalTotal" (yani 300 TL) olmalı.
    return finalTotal;
};

export const getDisplayLabel = (isPartialMode, customTotal, isSelectionMode) => {
    if (isPartialMode) {
        return (customTotal && Number(customTotal) > 0) ? 'TAHSİL EDİLECEK' : 'KALAN BORÇ';
    }
    if (isSelectionMode) return 'SEÇİLEN TUTAR';
    return 'TOPLAM TUTAR';
};

export const TIER_CONFIG = {
    BRONZE: { name: 'BRONZE', min: 0, max: 500, multiplier: 1.0, color: 'text-motto-500', bgColor: 'bg-motto-50' },
    SILVER: { name: 'SILVER', min: 501, max: 1500, multiplier: 1.25, color: 'text-slate-400', bgColor: 'bg-slate-100' },
    GOLD: { name: 'GOLD', min: 1501, max: 4000, multiplier: 1.5, color: 'text-gold-500', bgColor: 'bg-gold-soft' },
    PLATINUM: { name: 'PLATINUM', min: 4001, max: Infinity, multiplier: 2.0, color: 'text-indigo-400', bgColor: 'bg-indigo-50' }
};

export const getTierData = (points) => {
    const p = Number(points) || 0;

    // Mevcut seviyeyi bul
    const currentTier = Object.values(TIER_CONFIG).find(tier => p >= tier.min && p <= tier.max) || TIER_CONFIG.BRONZE;

    // Bir sonraki seviyeyi bul
    const tiers = Object.values(TIER_CONFIG);
    const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
    const nextTier = tiers[currentIndex + 1] || null;

    // İlerleme yüzdesi hesapla
    let progress = 100;
    let pointsToNext = 0;

    if (nextTier) {
        const range = nextTier.min - currentTier.min;
        const currentProgress = p - currentTier.min;
        progress = Math.min(Math.round((currentProgress / range) * 100), 100);
        pointsToNext = nextTier.min - p;
    }

    return {
        ...currentTier,
        progress,
        pointsToNext,
        hasNextTier: !!nextTier,
        nextTierName: nextTier?.name || ''
    };
};