import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../services/firebase';

// Kullanıcıya ve filtreye göre dinamik olarak veri çeken Hook
export default function useFilteredTransactions(user, reportFilter) {
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db || !user.uid || !reportFilter) return;
        
        // Removed synchronous setLoading(true) to prevent cascading renders

        const uid = user.uid;
        const transactionsRef = collection(db, 'artifacts', appId, 'users', uid, 'transactions');
        let dateQuery;
        let dateFilter = new Date();
        const today = dateFilter.toISOString().split('T')[0];

        // Tarih filtreleme mantığı
        if (reportFilter === 'week') {
            dateFilter.setDate(dateFilter.getDate() - 7);
            dateQuery = where('date', '>=', dateFilter.toISOString().split('T')[0]);
        } else if (reportFilter === 'month') {
            const startOfMonth = today.slice(0, 7) + '-01';
            dateQuery = where('date', '>=', startOfMonth);
        } else if (reportFilter === 'year') {
            const startOfYear = dateFilter.getFullYear() + '-01-01';
            dateQuery = where('date', '>=', startOfYear);
        } else {
            // 'all' veya geçersiz filtre
            dateQuery = orderBy('date', 'desc');
        }

        const q = query(transactionsRef, dateQuery, orderBy('date', 'desc'), limit(500));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFilteredTransactions(data);
            setLoading(false);
        }, (error) => {
            console.error("Filtrelenmiş veri çekim hatası:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, reportFilter]);

    return { filteredTransactions, loading };
}