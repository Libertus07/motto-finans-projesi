// src/hooks/useFinanceData.js

import { useState, useEffect, useMemo, useRef } from 'react'; 
import { collection, doc, onSnapshot, query, limit, writeBatch, setDoc } from 'firebase/firestore'; 
import { db, appId } from '../services/firebase';
import { INITIAL_TABLES, CATEGORIES as DEFAULT_CATEGORIES } from '../utils/constants'; 

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

export default function useFinanceData(user) {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [tables, setTables] = useState([]);
  const [staff, setStaff] = useState([]); 
  const [categories, setCategories] = useState([]); // Kategoriler

  const [fixedCosts, setFixedCosts] = useState({ rent: 0, staff: 0, bills: 0, other: 0 });
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [marketRates, setMarketRates] = useState({ gold: 2950, dollar: 34.50, euro: 37.20 });
  const [loading, setLoading] = useState(true); 
  
  const hasSeededTablesRef = useRef(false);

  // Otomatik Masa Kurulumu (İlk kez çalıştırıldığında)
  const autoSeedTables = () => {
      if (hasSeededTablesRef.current) return;
      const batch = writeBatch(db);
      if (INITIAL_TABLES && INITIAL_TABLES.length > 0) {
          INITIAL_TABLES.forEach(t => {
              batch.set(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', t.id), t);
          });
      }
      setTables(INITIAL_TABLES); 
      setLoading(false); 
      hasSeededTablesRef.current = true; 
      batch.commit().catch(e => console.error("Masa seed hatası:", e));
  };

  useEffect(() => {
    // Anonim girişte user null olabilir, yine de veriyi çekelim (veya user kontrolü eklenebilir)
    // if (!user) return; 
    
    console.log("🔥 Veri Akışı Başlatılıyor...");
    setLoading(true);
    const unsubscribers = []; 

    try {
      // 1. KATEGORİLER
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'categories'), (docSnap) => {
          if (docSnap.exists()) {
              setCategories(docSnap.data().list || []);
          } else {
              // Varsayılan kategorileri oluştur
              const initialCats = DEFAULT_CATEGORIES.map((name, index) => ({ id: `cat-${index}`, name: name }));
              setDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'categories'), { list: initialCats });
              setCategories(initialCats);
          }
      }));

      // 2. MASALAR
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables'), (s) => {
        const tableData = s.docs.map(d => ({id:d.id, ...d.data()}));
        setTables(tableData.sort((a,b) => a.number - b.number)); 
        if (tableData.length === 0 && !hasSeededTablesRef.current) { autoSeedTables(); }
      }));

      // 3. PERSONEL
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff'), (s) => {
          setStaff(s.docs.map(d => ({id:d.id, ...d.data()})));
      }));

      // 4. İŞLEMLER (Son 500 işlem - Performans için limitli)
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), limit(500)), (s) => {
          setTransactions(s.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b) => b.date.localeCompare(a.date)));
          setLoading(false); // İşlemler gelince yükleme bitti sayalım
      }));
      
      // 5. DİĞERLERİ (Ürünler, Yatırımlar, Borçlar...)
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products'), s => setProducts(s.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b) => (a.order || 999) - (b.order || 999)))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments'), s => setInvestments(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts'), s => setDebts(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), s => setIngredients(s.docs.map(d => ({id:d.id, ...d.data()})))));
      
      // 6. AYARLAR
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'fixedCosts'), d => { if(d.exists()) setFixedCosts(d.data()); }));
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'monthlyGoal'), d => { if(d.exists()) setMonthlyGoal(d.data().value); }));

    } catch (error) {
      console.error("Veri Çekme Hatası:", error);
      setLoading(false);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]); // user değişirse yeniden bağlan

  // --- İSTATİSTİK MOTORU (DASHBOARD İÇİN HESAPLAMALAR) ---
  const stats = useMemo(() => {
      const safeTransactions = Array.isArray(transactions) ? transactions : [];
      
      // Tarih Ayarları
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = today.slice(0, 7);
      
      // Toplamlar
      let totalIncome = 0;
      let totalExpense = 0;
      let dailyIncome = 0;
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      // 👇 YENİ: GÜNLÜK CİRO KIRILIMI (NAKİT / KART / IBAN)
      let dailyBreakdown = { cash: 0, card: 0, iban: 0 };

      // Varlık Bakiyeleri (Toplam Kasa)
      const balances = { cash: 0, ziraat: 0, halk: 0, iban: 0 };

      safeTransactions.forEach(t => {
        const val = Number(t.amount || 0);
        
        // Gelir / Gider Toplamları
        if (t.type === 'income') {
            totalIncome += val;
            if (t.date === today) {
                dailyIncome += val;
                // Günlük Kırılımı İşle
                if (t.method === 'cash') dailyBreakdown.cash += val;
                else if (t.method === 'card') dailyBreakdown.card += val;
                else dailyBreakdown.iban += val; // 'iban' veya 'other'
            }
            if (t.date.startsWith(currentMonth)) monthlyIncome += val;
        } else {
            totalExpense += val;
            if (t.date.startsWith(currentMonth)) monthlyExpense += val;
        }

        // Hesap Bakiyelerini Güncelle (Gelir ekle, Gider çıkar)
        let accKey = 'cash';
        if (t.method === 'card') {
             // Kart ise hangi banka? (Veride 'bank' alanı varsa)
             if (t.bank === 'ziraat') accKey = 'ziraat';
             else if (t.bank === 'halk') accKey = 'halk';
             else accKey = 'iban'; // Varsayılan pos
        } else if (t.method === 'iban') {
             accKey = 'iban';
        }

        if (t.type === 'income') balances[accKey] += val;
        else balances[accKey] -= val;
      });

      const netProfit = totalIncome - totalExpense;
      const totalMonthlyFixedCosts = Object.values(fixedCosts || {}).reduce((sum, val) => sum + Number(val || 0), 0);
      
      // Borç Hesaplama
      const totalDebt = debts.filter(d => d.type === 'debt').reduce((acc, d) => acc + Number(d.amount), 0) - 
                        debts.filter(d => d.type === 'payment').reduce((acc, d) => acc + Number(d.amount), 0);

      // Yatırım Değeri
      const investmentValue = investments.reduce((acc, inv) => acc + (Number(inv.quantity) * Number(inv.currentPrice || inv.buyPrice)), 0);

      return { 
        dailyIncome,
        dailyBreakdown, // ✅ Dashboard artık bunu kullanabilir!
        monthlyIncome, 
        monthlyExpense, 
        netProfit, 
        totalDebt,
        assets: { ...balances, gold: investmentValue },
        investmentStats: { currentValue: investmentValue },
        totalMonthlyFixedCosts
      };
  }, [transactions, debts, investments, fixedCosts]);

  const calculateFutureCashflow = (days = 30) => {
      // Basit bir projeksiyon
      const dailyAvgBurn = (stats.monthlyExpense + stats.totalMonthlyFixedCosts) / 30;
      const dailyAvgEarn = stats.monthlyIncome / 30;
      return (dailyAvgEarn - dailyAvgBurn) * days;
  };

  const getProfitabilityWarnings = (productsList) => {
      if (!Array.isArray(productsList)) return [];
      return productsList
          .filter(p => Number(p.cost) > 0 && Number(p.price) > 0)
          .map(p => ({ ...p, margin: ((p.price - p.cost) / p.price) * 100 }))
          .filter(p => p.margin < 30) // %30 altı kâr marjı uyarısı
          .sort((a,b) => a.margin - b.margin);
  };
  
  return {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    staff, categories, 
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings, loading
  };
}