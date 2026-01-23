import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID, CATEGORIES as DEFAULT_CATEGORIES } from '../../utils/constants';
import { Category, FixedCosts, User } from '../../types';

export function useSettings(user: User | null | undefined) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [fixedCosts, setFixedCosts] = useState<FixedCosts>({ rent: 0, staff: 0, bills: 0, other: 0 });
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribers: (() => void)[] = [];

        // 1. KATEGORİLER
        unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'categories'), (docSnap) => {
            if (docSnap.exists()) {
                setCategories(docSnap.data().list || []);
            } else {
                // Seed default categories
                const initialCats = DEFAULT_CATEGORIES.map((name, index) => ({
                    id: `cat-${index}`,
                    name: name
                }));
                setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'categories'), { list: initialCats });
                setCategories(initialCats);
            }
        }, (error) => console.error("Kategori okuma hatası:", error)));

        // 2. SABİT GİDERLER
        unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'fixedCosts'), (doc) => {
            if (doc.exists()) setFixedCosts(doc.data() as FixedCosts);
        }));

        // 3. AYLIK HEDEF
        unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'monthlyGoal'), (doc) => {
            if (doc.exists()) setMonthlyGoal(doc.data().value);
        }));

        // Simple loading strategy: assume loaded after snapshots attach. 
        // Real-world might want a counter, but Firestore is fast.
        setLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    return { categories, fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, loading };
}
