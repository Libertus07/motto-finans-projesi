import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID } from '../../utils/constants';
import { Product, User } from '../../types';

export function useProducts(user: User | null | undefined) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'products'),
            (snapshot) => {
                const prodData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
                // Sort by 'order' field
                setProducts(prodData.sort((a, b) => (a.order || 9999) - (b.order || 9999)));
                setLoading(false);
            },
            (error) => {
                console.error("❌ ÜRÜN OKUMA HATASI:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return { products, loading };
}
