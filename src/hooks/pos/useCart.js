// hooks/pos/useCart.js
import { useState, useCallback } from 'react';
import { playBeep, playDeleteSound } from '../../utils/pos/sounds';

export const useCart = () => {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Sepete ürün ekle
    const addToCart = useCallback((product) => {
        playBeep();
        setCart(prevCart => {
            const existingItem = prevCart.find(item => 
                item.id === product.id && 
                item.name === product.name && 
                item.price === product.price
            );

            if (existingItem) {
                return prevCart.map(item => 
                    (item.id === product.id && 
                     item.name === product.name && 
                     item.price === product.price) 
                    ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
                    : item
                );
            } else {
                return [...prevCart, { ...product, quantity: product.quantity || 1 }];
            }
        });
    }, []);

    // Miktar güncelle
    const updateQuantity = useCallback((productId, delta) => {
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
    const removeFromCart = useCallback((productId) => {
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
    const toggleSelection = useCallback((itemId, maxQty, delta) => {
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