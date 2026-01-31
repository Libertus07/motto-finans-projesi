import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, appId } from './firebase';
import { SHOP_ID } from '../utils/constants';
import { OrderItem, Ingredient } from '../types';

interface RecipeItem {
    id: string; // Ingredient ID
    quantity: number;
}

interface RecipeData {
    yieldAmount: number;
    items: RecipeItem[];
}

export const StockService = {
    /**
     * Deducts stock based on the recipes of the sold products.
     * Use this when an order is completed/paid.
     */
    processOrderStockDeduction: async (orders: OrderItem[]) => {
        if (!orders || orders.length === 0) return;

        // 1. Group quantities by Product ID
        const productQuantities: Record<string, number> = {};
        orders.forEach(item => {
            productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
        });

        // 2. Prepare to accumulate ingredient usage
        const ingredientDeductions: Record<string, number> = {};

        // 3. Fetch Recipes for each product
        // Note: For large orders, one-by-one fetch might be slow, but typically tables have < 20 unique items.
        // Parallel fetching is better.
        const productIds = Object.keys(productQuantities);

        const recipePromises = productIds.map(async (productId) => {
            const recipeRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'recipes', productId);
            const recipeSnap = await getDoc(recipeRef);

            if (recipeSnap.exists()) {
                const recipe = recipeSnap.data() as RecipeData;
                const saleQty = productQuantities[productId];

                // Formula: (Sale Qty / Recipe Yield) * Ingredient Qty
                // Example: Sold 2 Coffees. Recipe makes 1. Ingredient needs 15g. -> (2/1)*15 = 30g.
                const ratio = saleQty / (recipe.yieldAmount || 1);

                recipe.items.forEach(ing => {
                    ingredientDeductions[ing.id] = (ingredientDeductions[ing.id] || 0) + (ing.quantity * ratio);
                });
            }
        });

        await Promise.all(recipePromises);

        // 4. Update Stock in DB
        // If no ingredients matched, return
        const ingredientIds = Object.keys(ingredientDeductions);
        if (ingredientIds.length === 0) return;

        // Use a batch update for atomicity at firestore level (or close to it)
        const batch = writeBatch(db);

        // We need to fetch current ingredients to respect other fields, or just decrement?
        // Firestore 'increment(-val)' is best to avoid race conditions.
        const { increment } = await import('firebase/firestore');

        ingredientIds.forEach(ingId => {
            const deduction = ingredientDeductions[ingId];
            const ingRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'ingredients', ingId);
            batch.update(ingRef, {
                stock: increment(-deduction)
            });
        });

        await batch.commit();
        console.log("Stock deduction complete:", ingredientDeductions);
    }
};
