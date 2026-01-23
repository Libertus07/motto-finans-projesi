import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID } from '../../utils/constants';
import { Staff, User } from '../../types';

export function useStaff(user: User | null | undefined) {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'staff'),
            (snapshot) => {
                setStaff(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Staff[]);
                setLoading(false);
            },
            (error) => {
                console.error("❌ PERSONEL OKUMA HATASI:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return { staff, loading };
}
