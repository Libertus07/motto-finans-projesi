// utils/stockManager.ts

import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';

interface SoldItem {
    id: string;
    quantity: number;
}

interface RecipeIngredient {
    id: string;
    quantity: number;
}

interface Recipe {
    items?: RecipeIngredient[];
}

/**
 * Deducts stock quantities based on sold items and their recipes
 * 
 * This function performs two critical operations:
 * 1. **Updates sales count** (`sold` field) for each product - enables sales analytics and graphs
 * 2. **Deducts ingredient stock** based on product recipes - maintains accurate inventory
 * 
 * Process for each sold item:
 * - Increments the product's `sold` counter by the quantity sold
 * - Fetches the product's recipe from Firestore
 * - For each ingredient in the recipe, deducts (ingredient quantity × sold quantity) from stock
 * - All updates are batched for atomic execution
 * 
 * @param soldItems - Array of sold items with product IDs and quantities
 * @param soldItems[].id - Product ID matching the products collection
 * @param soldItems[].quantity - Quantity sold (must be positive)
 * 
 * @returns Promise that resolves when all stock updates are committed to Firestore
 * 
 * @throws {Error} If Firestore batch commit fails
 * 
 * @example
 * // Selling 2 lattes
 * await deductStockForTransaction([
 *   { id: 'latte', quantity: 2 }
 * ]);
 * // Result:
 * // - Increments latte.sold by 2
 * // - If latte recipe has: [{ id: 'milk', quantity: 200 }, { id: 'espresso', quantity: 30 }]
 * // - Deducts 400ml from milk stock and 60ml from espresso stock
 * 
 * @example
 * // Multiple items in one transaction
 * await deductStockForTransaction([
 *   { id: 'cappuccino', quantity: 1 },
 *   { id: 'croissant', quantity: 2 }
 * ]);
 */
export const deductStockForTransaction = async (soldItems: SoldItem[]): Promise<void> => {
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
                    const recipe = recipeSnap.data() as Recipe;
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
            // log success
        }

    } catch (error) {
        console.error("Stok/Satış güncelleme hatası:", error);
    }
};
