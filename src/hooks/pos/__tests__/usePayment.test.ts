import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePayment } from '../usePayment';

describe('usePayment', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePayment());

        expect(result.current.paymentMethod).toBe('cash');
        expect(result.current.discountRate).toBe(0);
        expect(result.current.splitCount).toBe(1);
        expect(result.current.customTotal).toBe('');
    });

    it('should cycle discount rate correctly', () => {
        const { result } = renderHook(() => usePayment());

        act(() => result.current.cycleDiscountRate());
        expect(result.current.discountRate).toBe(10);

        act(() => result.current.cycleDiscountRate());
        expect(result.current.discountRate).toBe(15);

        act(() => result.current.cycleDiscountRate());
        expect(result.current.discountRate).toBe(20);

        act(() => result.current.cycleDiscountRate());
        expect(result.current.discountRate).toBe(0);
    });

    it('should cycle split count correctly', () => {
        const { result } = renderHook(() => usePayment());

        act(() => result.current.cycleSplitCount());
        expect(result.current.splitCount).toBe(2);

        act(() => result.current.cycleSplitCount());
        expect(result.current.splitCount).toBe(3);

        act(() => result.current.cycleSplitCount());
        expect(result.current.splitCount).toBe(4);

        act(() => result.current.cycleSplitCount());
        expect(result.current.splitCount).toBe(1);
    });

    it('should set payment method', () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.setPaymentMethod('card');
        });
        expect(result.current.paymentMethod).toBe('card');

        act(() => {
            result.current.setPaymentMethod('cash');
        });
        expect(result.current.paymentMethod).toBe('cash');
    });

    it('should handle custom total', () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.setCustomTotal('100');
        });
        expect(result.current.customTotal).toBe('100');
    });

    it('should reset payment correctly', () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.setPaymentMethod('card');
            result.current.cycleDiscountRate(); // 10
            result.current.cycleSplitCount(); // 2
            result.current.setCustomTotal('50');
            result.current.resetPayment();
        });

        expect(result.current.paymentMethod).toBe('cash');
        expect(result.current.discountRate).toBe(0);
        expect(result.current.splitCount).toBe(1);
        expect(result.current.customTotal).toBe('');
    });
    it('should handle partial mode correctly', () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.enablePartialMode();
        });
        expect(result.current.isPartialMode).toBe(true);
        expect(result.current.splitCount).toBe(1);

        act(() => {
            result.current.disablePartialMode();
        });
        expect(result.current.isPartialMode).toBe(false);
        expect(result.current.paidSoFar).toBe(0);
    });

    it('should update partial payment correctly', () => {
        const { result } = renderHook(() => usePayment());

        act(() => {
            result.current.enablePartialMode();
        });

        let updateResult: any;
        act(() => {
            updateResult = result.current.updatePartialPayment(100, 300);
        });

        expect(updateResult.completed).toBe(false);
        expect(updateResult.newPaid).toBe(100);
        expect(result.current.paidSoFar).toBe(100);

        act(() => {
            updateResult = result.current.updatePartialPayment(200, 300);
        });

        expect(updateResult.completed).toBe(true);
        expect(updateResult.newPaid).toBe(300);
    });
});
