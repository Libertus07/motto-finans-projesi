import { describe, it, expect } from 'vitest';
import { calculateTotals, getCurrentPayable, getDisplayLabel, getTierData, getLocalISODate } from '../calculations';
import { CartItem } from '../../../types';

describe('Calculations', () => {
    // Mock Cart Data
    const mockCart: CartItem[] = [
        { id: '1', productId: 'p1', name: 'Coffee', price: 50, quantity: 2 },
        { id: '2', productId: 'p2', name: 'Cake', price: 40, quantity: 1 }
    ];

    describe('calculateTotals', () => {
        it('calculates basic totals correctly', () => {
            const result = calculateTotals({
                cart: mockCart,
                discountRate: 0,
                splitCount: 1,
                isPartialMode: false,
                paidSoFar: 0,
                isSelectionMode: false,
                selectedItems: {}
            });

            // 2*50 + 1*40 = 140
            expect(result.subTotal).toBe(140);
            expect(result.finalTotal).toBe(140);
            expect(result.discountAmount).toBe(0);
            expect(result.remainingDebt).toBe(140);
        });

        it('applies percentage discount correctly', () => {
            const result = calculateTotals({
                cart: mockCart,
                discountRate: 10, // 10% Discount
                splitCount: 1,
                isPartialMode: false,
                paidSoFar: 0,
                isSelectionMode: false,
                selectedItems: {}
            });

            // Total 140. Discount 10% = 14. Final = 126.
            expect(result.subTotal).toBe(140);
            expect(result.discountAmount).toBe(14);
            expect(result.finalTotal).toBe(126);
        });

        it('handles split count correctly', () => {
            const result = calculateTotals({
                cart: mockCart,
                discountRate: 0,
                splitCount: 2,
                isPartialMode: false,
                paidSoFar: 0,
                isSelectionMode: false,
                selectedItems: {}
            });

            // 140 / 2 = 70
            expect(result.perPersonAmount).toBe(70);
        });

        it('calculates remaining debt with previous payments', () => {
            const result = calculateTotals({
                cart: mockCart,
                discountRate: 0,
                splitCount: 1,
                isPartialMode: false,
                paidSoFar: 40, // 40 TL paid
                isSelectionMode: false,
                selectedItems: {}
            });

            // 140 - 40 = 100
            expect(result.remainingDebt).toBe(100);
        });

        it('handles manual total override (discounting)', () => {
            const result = calculateTotals({
                cart: mockCart, // 140
                discountRate: 0,
                splitCount: 1,
                customTotal: '130',
                isPartialMode: false,
                paidSoFar: 0,
                isSelectionMode: false,
                selectedItems: {}
            });

            expect(result.finalTotal).toBe(130);
            expect(result.discountAmount).toBe(10);
            expect(result.isManualMode).toBe(true);
        });

        it('handles partial mode with custom total and discount', () => {
            const result = calculateTotals({
                cart: mockCart, // 140
                discountRate: 10,
                splitCount: 1,
                customTotal: '50',
                isPartialMode: true,
                paidSoFar: 0,
                isSelectionMode: false,
                selectedItems: {}
            });

            // In partial mode, rawPartialAmount = customTotal = 50. 
            // 10% discount on 50 = 5.
            // partialPayable = 45.
            expect(result.partialRawAmount).toBe(50);
            expect(result.partialPayable).toBe(45);
            expect(result.discountAmount).toBe(5);
        });
    });

    describe('getCurrentPayable', () => {
        it('returns final total in normal mode', () => {
            const payable = getCurrentPayable(false, 0, false, 150);
            expect(payable).toBe(150);
        });

        it('returns partial amount in partial mode', () => {
            const payable = getCurrentPayable(true, 50, false, 150);
            expect(payable).toBe(50);
        });

        it('returns final total in selection mode', () => {
            const payable = getCurrentPayable(false, 0, true, 75);
            expect(payable).toBe(75);
        });
    });

    describe('getDisplayLabel', () => {
        it('returns correct labels for different modes', () => {
            expect(getDisplayLabel(true, '100', false)).toBe('TAHSİL EDİLECEK');
            expect(getDisplayLabel(true, '0', false)).toBe('KALAN BORÇ');
            expect(getDisplayLabel(false, '', true)).toBe('SEÇİLEN TUTAR');
            expect(getDisplayLabel(false, '', false)).toBe('TOPLAM TUTAR');
        });
    });

    describe('getTierData', () => {
        it('calculates tier data correctly for BRONZE', () => {
            const data = getTierData(100);
            expect(data.name).toBe('BRONZE');
            expect(data.hasNextTier).toBe(true);
            expect(data.nextTierName).toBe('SILVER');
            expect(data.progress).toBeGreaterThan(0);
        });

        it('calculates tier data correctly for PLATINUM (Max Tier)', () => {
            const data = getTierData(5000);
            expect(data.name).toBe('PLATINUM');
            expect(data.hasNextTier).toBe(false);
            expect(data.progress).toBe(100);
        });

        it('handles invalid points', () => {
            const data = getTierData('invalid');
            expect(data.name).toBe('BRONZE');
        });
    });

    describe('getLocalISODate', () => {
        it('returns string in YYYY-MM-DD format', () => {
            const date = getLocalISODate();
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
