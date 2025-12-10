// utils/stockManager.js (GÜNCELLENMİŞ VE DÜZELTİLMİŞ)

import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';

/**
 * Satış yapılan ürünlerin:
 * 1. Satış adetlerini (sold) artırır -> Bu GRAFİKLERİ çalıştırır.
 * 2. Reçetelerine bakarak stoktan düşer (Ingredients).
 * * @param {Array} soldItems - [{ id: 'p1', quantity: 2 }, ...] formatında satılan ürünler
 */
export const deductStockForTransaction = async (soldItems) => {
    const user = auth.currentUser;
    if (!user || !soldItems || soldItems.length === 0) return;

    const batch = writeBatch(db);
    let hasUpdates = false;

    try {
        for (const item of soldItems) {
            const productId = item.id;
            const soldQty = Number(item.quantity); 

            if (soldQty > 0) {
                // 1. Ürünün Satış Adedini Artır (GRAFİKLER İÇİN KRİTİK ADIM)
                const productRef = doc(db, 'artifacts', appId, 'users', user.uid, 'products', productId);
                batch.update(productRef, { 
                    sold: increment(soldQty) 
                });
                hasUpdates = true;

                // 2. Reçeteyi Çek ve Stoktan Düş
                const recipeRef = doc(db, 'artifacts', appId, 'users', user.uid, 'recipes', productId);
                const recipeSnap = await getDoc(recipeRef);

                if (recipeSnap.exists()) {
                    const recipe = recipeSnap.data();
                    const items = recipe.items || []; 

                    items.forEach(ingredient => {
                        const ingredientId = ingredient.id;
                        const amountToDeduct = (ingredient.quantity || 0) * soldQty; 

                        if (amountToDeduct > 0) {
                            const ingredientRef = doc(db, 'artifacts', appId, 'users', user.uid, 'ingredients', ingredientId);
                            batch.update(ingredientRef, { 
                                stock: increment(-amountToDeduct) 
                            });
                        }
                    });
                }
            }
        }

        if (hasUpdates) {
            await batch.commit();
            console.log("Satış ve Stok güncellemesi başarılı.");
        }

    } catch (error) {
        console.error("Stok/Satış güncelleme hatası:", error);
    }
};