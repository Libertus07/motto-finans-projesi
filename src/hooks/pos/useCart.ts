// hooks/pos/useCart.ts
import { useState, useCallback, useEffect } from 'react';
import { playBeep, playDeleteSound } from '../../utils/pos/sounds';
import { Product } from '../../types';
import { CartItem } from '../../utils/pos/calculations';

/**
 * Custom hook for managing POS cart state and operations
 * 
 * Provides comprehensive cart management including:
 * - Add/remove/update items with sound effects
 * - Item selection mode for partial payments
 * - Cart persistence via localStorage
 * - Duplicate item detection (same product, price, and note)
 * 
 * @returns Cart state and operations
 * @returns cart - Current cart items array
 * @returns selectedItems - Map of selected item IDs to quantities (for partial payments)
 * @returns isSelectionMode - Whether item selection mode is active
 * @returns addToCart - Add product to cart (increments quantity if duplicate)
 * @returns updateQuantity - Update item quantity by delta (+1 or -1)
 * @returns removeFromCart - Remove item from cart by ID
 * @returns clearCart - Clear all items (with confirmation)
 * @returns toggleSelectionMode - Toggle item selection mode on/off
 * @returns toggleSelection - Toggle selection for specific item
 * @returns processSelectedItems - Process selected items after checkout
 * @returns setCart - Direct cart setter (for advanced use)
 * 
 * @example
 * const { cart, addToCart, removeFromCart, clearCart } = useCart();
 * 
 * // Add product to cart
 * addToCart({ id: '1', name: 'Latte', price: 45, quantity: 1 });
 * 
 * // Remove product
 * removeFromCart('1');
 * 
 * // Clear cart
 * clearCart();
 * 
 * @example
 * // Using selection mode for partial payment
 * const { isSelectionMode, toggleSelectionMode, toggleSelection, selectedItems } = useCart();
 * 
 * toggleSelectionMode(); // Enable selection mode
 * toggleSelection('item1', 3, 1); // Select 1 of item1 (max 3)
 * toggleSelection('item1', 3, 1); // Select 2 of item1
 */
export const useCart = () => {
    // ✨ YENİ: Başlangıçta localStorage'dan veriyi okuyoruz
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem('motto_pos_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Sepet verisi okunamadı:", error);
            return [];
        }
    });

    // ✨ YENİ: Sepet her değiştiğinde localStorage'a kaydediyoruz
    useEffect(() => {
        localStorage.setItem('motto_pos_cart', JSON.stringify(cart));
    }, [cart]);

    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Sepete ürün ekle
    const addToCart = useCallback((product: Product & { quantity?: number; note?: string;[key: string]: any }) => {
        playBeep();
        setCart(prevCart => {
            const existingItem = prevCart.find(item =>
                item.id === product.id &&
                item.name === product.name &&
                item.price === product.price &&
                item.note === product.note // ✨ Notlar aynı mı kontrol et
            );

            if (existingItem) {
                return prevCart.map(item =>
                    (item.id === product.id &&
                        item.name === product.name &&
                        item.price === product.price &&
                        item.note === product.note)
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            } else {
                return [...prevCart, { ...product, productId: product.id, quantity: product.quantity || 1 }];
            }
        });
    }, []);

    // Miktar güncelle
    const updateQuantity = useCallback((productId: string, delta: number) => {
        if (isSelectionMode) return;
        playBeep();
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.id === productId) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            })
        );
    }, [isSelectionMode]);

    // Sepetten çıkar
    const removeFromCart = useCallback((productId: string) => {
        playDeleteSound();
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    // Sepeti temizle
    const clearCart = useCallback(() => {
        if (window.confirm("Sepeti temizlemek istiyor musunuz?")) {
            setCart([]);
            setSelectedItems({});
        }
    }, []);

    // Seçim modunu aç/kapat
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev);
        if (!isSelectionMode) {
            setSelectedItems({});
        }
    }, [isSelectionMode]);

    // Ürün seçimini değiştir
    const toggleSelection = useCallback((itemId: string, maxQty: number, delta: number) => {
        setSelectedItems(prev => {
            const currentQty = prev[itemId] || 0;
            const newQty = currentQty + delta;

            if (newQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            if (newQty > maxQty) return prev;

            return { ...prev, [itemId]: newQty };
        });
    }, []);

    // Seçili ürünleri işle (checkout sonrası)
    const processSelectedItems = useCallback(() => {
        const newCart = cart.map(item => {
            const paidQty = selectedItems[item.id] || 0;
            return { ...item, quantity: item.quantity - paidQty };
        }).filter(item => item.quantity > 0);

        setCart(newCart);
        setSelectedItems({});

        if (newCart.length === 0) {
            setIsSelectionMode(false);
        }
    }, [cart, selectedItems]);

    return {
        cart,
        selectedItems,
        isSelectionMode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleSelectionMode,
        toggleSelection,
        processSelectedItems,
        setCart
    };
};
