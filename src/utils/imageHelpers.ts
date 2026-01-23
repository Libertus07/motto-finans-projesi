import { Product } from '../types';

// Unsplash Image URLs for various categories
// Using 'source.unsplash.com' is deprecated/unreliable, better to use direct IDs or specific photo URLs.
// I will use specific photo URLs for reliability.

const CATEGORY_IMAGES: Record<string, string> = {
    'Kahve': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'Tatlı': 'https://images.unsplash.com/photo-1551024601-5637ade98569?auto=format&fit=crop&w=600&q=80',
    'Çay': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    'Soğuk İçecek': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    'Atıştırmalık': 'https://images.unsplash.com/photo-1599321955726-90471f645662?auto=format&fit=crop&w=600&q=80',
    'Yemek': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'Kahvaltı': 'https://images.unsplash.com/photo-1533089862017-ec13f8c88350?auto=format&fit=crop&w=600&q=80',
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    'Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'Makarna': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80'; // Restaurant ambience

/**
 * Returns a valid image URL for the product.
 * Priority: 
 * 1. Product's actual 'image' field if it looks like a URL.
 * 2. A category-specific high quality placeholder.
 * 3. A generic default image.
 */
export const getProductImage = (product: Product): string => {
    // 1. Check if it's a real URL (basic check)
    if (product.image && (product.image.startsWith('http') || product.image.startsWith('/'))) {
        return product.image;
    }

    // 2. Return category match
    if (product.category && CATEGORY_IMAGES[product.category]) {
        return CATEGORY_IMAGES[product.category];
    }

    // Try partial match
    const catLower = (product.category || '').toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
        if (catLower.includes(key.toLowerCase())) {
            return url;
        }
    }

    // 3. Fallback
    return DEFAULT_IMAGE;
};
