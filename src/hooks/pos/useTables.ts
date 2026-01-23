import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID, INITIAL_TABLES } from '../../utils/constants';
import { Table, User } from '../../types';

export function useTables(user: User | null | undefined) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const hasSeededTablesRef = useRef(false);

    const autoSeedTables = () => {
        if (hasSeededTablesRef.current) return;
        const batch = writeBatch(db);
        if (INITIAL_TABLES && INITIAL_TABLES.length > 0) {
            INITIAL_TABLES.forEach(t => {
                batch.set(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', t.id), t);
            });
        }
        setTables(INITIAL_TABLES as Table[]);
        setLoading(false);
        hasSeededTablesRef.current = true;
        batch.commit().catch(e => console.error("Masa seed hatası:", e));
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables'),
            (snapshot) => {
                const tableData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Table[];
                setTables(tableData.sort((a, b) => a.number - b.number));

                if (tableData.length === 0 && !hasSeededTablesRef.current) {
                    autoSeedTables();
                } else if (tableData.length > 0) {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("❌ MASA OKUMA HATASI:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return { tables, loading };
}
