// utils/pos/calculations.ts
import { CartItem } from '../../types';
export type { CartItem };

export interface CalculationParams {
    cart: CartItem[];
    discountRate: number;
    splitCount: number;
    customTotal?: string | number | null;
    isPartialMode: boolean;
    paidSoFar: number;
    isSelectionMode: boolean;
    selectedItems: Record<string, number>;
}

export interface CalculationResult {
    subTotal: number;
    discountAmount: number;
    finalTotal: number;
    perPersonAmount: number;
    remainingDebt: number;
    isManualMode: boolean;
    partialPayable: number;
    partialRawAmount: number;
}

/**
 * Calculates comprehensive financial totals for the current cart
 * 
 * Handles multiple payment scenarios:
 * - Regular checkout with optional discounts
 * - Partial payments with running debt tracking
 * - Split bills across multiple people
 * - Item selection mode for paying specific items
 * - Manual total override (rounding)
 * 
 * @param params - Calculation parameters
 * @param params.cart - Array of cart items with price and quantity
 * @param params.discountRate - Discount percentage (0-100)
 * @param params.splitCount - Number of ways to split the bill (1-10)
 * @param params.customTotal - Optional custom total override for rounding
 * @param params.isPartialMode - Whether partial payment mode is active
 * @param params.paidSoFar - Amount already paid in partial payment mode
 * @param params.isSelectionMode - Whether item selection mode is active
 * @param params.selectedItems - Map of selected item IDs to quantities
 * 
 * @returns Calculated totals including:
 * - subTotal: Raw total before any discounts
 * - discountAmount: Total discount applied
 * - finalTotal: Final amount to pay after discounts
 * - perPersonAmount: Amount per person when splitting bill
 * - remainingDebt: Remaining amount after partial payment
 * - isManualMode: Whether manual total override is active
 * - partialPayable: Amount for current partial payment
 * - partialRawAmount: Raw partial amount before discount
 * 
 * @example
 * // Regular checkout with 10% discount
 * const totals = calculateTotals({
 *   cart: [{ id: '1', price: 100, quantity: 2 }],
 *   discountRate: 10,
 *   splitCount: 1,
 *   isPartialMode: false,
 *   paidSoFar: 0,
 *   isSelectionMode: false,
 *   selectedItems: {}
 * });
 * // Returns: { subTotal: 200, discountAmount: 20, finalTotal: 180, ... }
 * 
 * @example
 * // Partial payment of 100 TL from 300 TL total
 * const totals = calculateTotals({
 *   cart: [{ id: '1', price: 300, quantity: 1 }],
 *   discountRate: 0,
 *   splitCount: 1,
 *   customTotal: 100,
 *   isPartialMode: true,
 *   paidSoFar: 0,
 *   isSelectionMode: false,
 *   selectedItems: {}
 * });
 * // Returns: { finalTotal: 300, partialPayable: 100, remainingDebt: 200, ... }
 */
export const calculateTotals = ({
    cart,
    discountRate,
    splitCount,
    customTotal,
    isPartialMode,
    paidSoFar,
    isSelectionMode,
    selectedItems
}: CalculationParams): CalculationResult => {
    const cartTotal = cart.reduce<number>((total, item) => total + (item.price * item.quantity), 0);
    const selectionTotal = cart.reduce<number>((total, item) => {
        const selectedQty = selectedItems[item.id] || 0;
        return total + (item.price * selectedQty);
    }, 0);

    const baseTotal = isSelectionMode ? selectionTotal : cartTotal;
    let currentTotal = baseTotal;
    let discount = 0;
    let isManual = false;
    let rawPartialAmount = 0;

    if (!isPartialMode && customTotal && parseFloat(customTotal.toString()) > 0) {
        const target = parseFloat(customTotal.toString());
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
    const remaining = Math.max(0, currentTotal - paidSoFar);

    let pPayable = 0;
    let pDiscount = 0;

    if (isPartialMode) {
        rawPartialAmount = customTotal ? parseFloat(customTotal.toString()) : remaining;
        if (discountRate > 0) {
            pDiscount = rawPartialAmount * (discountRate / 100);
            pPayable = rawPartialAmount - pDiscount;
        } else {
            pPayable = rawPartialAmount;
        }
        if (discountRate > 0) discount = pDiscount;
    }

    return {
        subTotal: baseTotal,
        discountAmount: discount,
        finalTotal: currentTotal,
        perPersonAmount: perPerson,
        remainingDebt: remaining,
        isManualMode: isManual,
        partialPayable: pPayable,
        partialRawAmount: rawPartialAmount
    };
};

export const getLocalISODate = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getCurrentPayable = (isPartialMode: boolean, partialPayable: number, isSelectionMode: boolean, finalTotal: number): number => {
    if (isPartialMode) return partialPayable;
    if (isSelectionMode) return finalTotal;

    // HATA BURADAYDI: Sadece perPersonAmount döndüğü için büyük rakam bölünüyor.
    // DÜZELTME: Normal modda büyük rakam her zaman "finalTotal" (yani 300 TL) olmalı.
    return finalTotal;
};

export const getDisplayLabel = (isPartialMode: boolean, customTotal: string | number | undefined, isSelectionMode: boolean): string => {
    if (isPartialMode) {
        return (customTotal && Number(customTotal) > 0) ? 'TAHSİL EDİLECEK' : 'KALAN BORÇ';
    }
    if (isSelectionMode) return 'SEÇİLEN TUTAR';
    return 'TOPLAM TUTAR';
};

export interface TierInfo {
    name: string;
    min: number;
    max: number;
    multiplier: number;
    color: string;
    bgColor: string;
}

export const TIER_CONFIG: Record<string, TierInfo> = {
    BRONZE: { name: 'BRONZE', min: 0, max: 500, multiplier: 1.0, color: 'text-motto-500', bgColor: 'bg-motto-50' },
    SILVER: { name: 'SILVER', min: 501, max: 1500, multiplier: 1.25, color: 'text-slate-400', bgColor: 'bg-slate-100' },
    GOLD: { name: 'GOLD', min: 1501, max: 4000, multiplier: 1.5, color: 'text-gold-500', bgColor: 'bg-gold-soft' },
    PLATINUM: { name: 'PLATINUM', min: 4001, max: Infinity, multiplier: 2.0, color: 'text-indigo-400', bgColor: 'bg-indigo-50' }
};

export interface TierData extends TierInfo {
    progress: number;
    pointsToNext: number;
    hasNextTier: boolean;
    nextTierName: string;
}

export const getTierData = (points: number | string): TierData => {
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
