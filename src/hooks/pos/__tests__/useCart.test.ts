import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';

describe('useCart', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with empty cart', () => {
        const { result } = renderHook(() => useCart());

        expect(result.current.cart).toEqual([]);
        expect(result.current.selectedItems).toEqual({});
        expect(result.current.isSelectionMode).toBe(false);
    });

    it('should add item to cart', () => {
        const { result } = renderHook(() => useCart());

        const testItem = {
            id: '1',
            name: 'Latte',
            price: 45,
            cost: 10,
            quantity: 1,
            category: 'Coffee'
        };

        act(() => {
            result.current.addToCart(testItem);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0]).toMatchObject({
            id: '1',
            name: 'Latte',
            price: 45,
            quantity: 1
        });
    });

    it('should increment quantity for duplicate items', () => {
        const { result } = renderHook(() => useCart());

        const item = {
            id: '1',
            name: 'Latte',
            price: 45,
            cost: 10,
            quantity: 1,
            category: 'Coffee'
        };

        act(() => {
            result.current.addToCart(item);
            result.current.addToCart(item);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].quantity).toBe(2);
    });

    it('should update item quantity correctly', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 1, category: 'Coffee' });
        });

        act(() => {
            result.current.updateQuantity('1', 1); // Increment
        });
        expect(result.current.cart[0].quantity).toBe(2);

        act(() => {
            result.current.updateQuantity('1', -1); // Decrement
        });
        expect(result.current.cart[0].quantity).toBe(1);

        act(() => {
            result.current.updateQuantity('1', -5); // Test Math.max(1, ...)
        });
        expect(result.current.cart[0].quantity).toBe(1);
    });

    it('should remove item from cart', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({
                id: '1',
                name: 'Latte',
                price: 45,
                cost: 10,
                quantity: 1,
                category: 'Coffee'
            });
            result.current.removeFromCart('1');
        });

        expect(result.current.cart).toHaveLength(0);
    });

    it('should clear cart with confirmation', () => {
        const { result } = renderHook(() => useCart());

        // Mock confirm to return true
        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 1, category: 'Coffee' });
            result.current.clearCart();
        });

        expect(result.current.cart).toHaveLength(0);
        expect(confirmSpy).toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('should NOT clear cart if confirmation is cancelled', () => {
        const { result } = renderHook(() => useCart());

        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 1, category: 'Coffee' });
            result.current.clearCart();
        });

        expect(result.current.cart).toHaveLength(1);
        confirmSpy.mockRestore();
    });

    it('should toggle selection mode', () => {
        const { result } = renderHook(() => useCart());

        expect(result.current.isSelectionMode).toBe(false);

        act(() => {
            result.current.toggleSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(true);

        act(() => {
            result.current.toggleSelectionMode();
        });

        expect(result.current.isSelectionMode).toBe(false);
    });

    it('should toggle item selection quantity', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 5, category: 'Coffee' });
            result.current.toggleSelectionMode();
            // toggleSelection(itemId, maxQty, delta)
            result.current.toggleSelection('1', 5, 1);
        });

        expect(result.current.selectedItems['1']).toBe(1);

        act(() => {
            result.current.toggleSelection('1', 5, 2);
        });

        expect(result.current.selectedItems['1']).toBe(3);

        act(() => {
            result.current.toggleSelection('1', 5, -1);
        });

        expect(result.current.selectedItems['1']).toBe(2);
    });

    it('should process selected items correctly', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 5, category: 'Coffee' });
            result.current.toggleSelectionMode();
            result.current.toggleSelection('1', 5, 2); // Select 2
        });

        act(() => {
            result.current.processSelectedItems();
        });

        expect(result.current.cart[0].quantity).toBe(3); // 5 - 2 = 3
        expect(result.current.selectedItems).toEqual({});
    });

    it('should deactivate selection mode if all items are processed', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({ id: '1', name: 'Latte', price: 45, cost: 10, quantity: 2, category: 'Coffee' });
            result.current.toggleSelectionMode();
            result.current.toggleSelection('1', 2, 2); // Select all
        });

        act(() => {
            result.current.processSelectedItems();
        });

        expect(result.current.cart).toHaveLength(0);
        expect(result.current.isSelectionMode).toBe(false);
    });

    it('should persist cart to localStorage', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart({
                id: '1',
                name: 'Latte',
                price: 45,
                cost: 10,
                quantity: 1,
                category: 'Coffee'
            });
        });

        // Check that setItem was called
        expect(localStorage.setItem).toHaveBeenCalled();
    });
});
