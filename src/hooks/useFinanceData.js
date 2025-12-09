import { useState, useEffect, useMemo, useRef } from 'react'; 
import { collection, doc, onSnapshot, query, orderBy, limit, writeBatch } from 'firebase/firestore'; 
import { auth, db, appId } from '../services/firebase';
import { INITIAL_MARKET_RATES, INITIAL_MONTHLY_GOAL, INITIAL_TABLES } from '../utils/constants'; 

export default function useFinanceData(user) {
  // Data States
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [tables, setTables] = useState([]);
  
  const [fixedCosts, setFixedCosts] = useState({ rent: 0, staff: 0, bills: 0, other: 0 });
  const [monthlyGoal, setMonthlyGoal] = useState(INITIAL_MONTHLY_GOAL);
  const [marketRates, setMarketRates] = useState(INITIAL_MARKET_RATES);
  const [loading, setLoading] = useState(true); 
  
  const hasSeededTablesRef = useRef(false);

  // KRİTİK FONKSİYON: Masaları Oluşturma (ASENKRON HIZLANDIRMA)
  const autoSeedTables = (userId) => { // async anahtar kelimesi kaldırıldı
      if (!userId || hasSeededTablesRef.current) return;
      
      const batch = writeBatch(db);
      
      if (INITIAL_TABLES && INITIAL_TABLES.length > 0) {
          INITIAL_TABLES.forEach(t => {
              batch.set(doc(db, 'artifacts', appId, 'users', userId, 'tables', t.id), t);
          });
      }
      
      // 1. ANINDA YEREL GÜNCELLEME (Gecikmeyi Engeller)
      setTables(INITIAL_TABLES); 
      setLoading(false); // Yükleme ekranını hemen kapat
      hasSeededTablesRef.current = true; // Yalnızca bir kez çalıştığını işaretle

      // 2. FIREBASE'E YAZMA (ARKA PLANDA)
      batch.commit()
          .then(() => {
              console.log("Örnek masalar başarıyla oluşturuldu.");
          })
          .catch(e => console.error("Masa otomatik oluşturma hatası:", e));
      
      // Fonksiyon hızlıca sonlanır, UI bloke olmaz.
  };

  // 1. Veri Cekme
  useEffect(() => {
    if (!user || !db || !user.uid) return; 
    
    const uid = user.uid;
    const unsubscribers = []; 
    setLoading(true);

    try {
      // Masalar verisini çeken listener
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'tables'), orderBy('number', 'asc')), s => {
        const tableData = s.docs.map(d => ({id:d.id, ...d.data()}));
        setTables(tableData);
        
        // KRİTİK KONTROL: Eğer masalar boşsa ve daha önce denemediysek, oluştur.
        if (tableData.length === 0 && !hasSeededTablesRef.current) {
            autoSeedTables(uid);
        }
        
        // Yüklemeyi sadece masalar veritabanından geldiğinde kapat
        if (tableData.length > 0) {
           setLoading(false); 
        }
        
      }));

      // Diğer tüm listener'lar
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'transactions'), orderBy('date', 'desc'), limit(500)), s => setTransactions(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'products'), orderBy('order', 'asc')), s => setProducts(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'investments'), s => setInvestments(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'debts'), s => setDebts(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'ingredients'), orderBy('order', 'asc')), s => setIngredients(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'quickActions'), orderBy('order', 'asc')), s => setQuickActions(s.docs.map(d => ({id:d.id, ...d.data()})))));

      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'fixedCosts'), (doc) => { if(doc.exists()) setFixedCosts(doc.data()); }));
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'monthlyGoal'), (doc) => { if(doc.exists()) setMonthlyGoal(doc.data().value); }));

    } catch (error) {
      console.error("Veri cekme hatasi:", error);
      setLoading(false);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  // 2. Istatistikler
  const stats = useMemo(() => {
      // ... (useMemo içeriği aynı kalır)
      const safeTransactions = Array.isArray(transactions) ? transactions : [];
      const safeDebts = Array.isArray(debts) ? debts : [];
      const safeInvestments = Array.isArray(investments) ? investments : [];
      
      const totalIncome = safeTransactions.filter(t => t && t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalExpense = safeTransactions.filter(t => t && t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const netProfit = totalIncome - totalExpense;
      const totalMonthlyFixedCosts = Object.values(fixedCosts || {}).reduce((sum, val) => sum + Number(val || 0), 0);
      const netNetProfit = netProfit - totalMonthlyFixedCosts;
      
      const totalDebt = safeDebts.filter(d => d && d.type === 'debt').reduce((acc, d) => acc + Number(d.amount || 0), 0) - 
                        safeDebts.filter(d => d && d.type === 'payment').reduce((acc, d) => acc + Number(d.amount || 0), 0);
      
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = today.slice(0, 7);
      
      const dailyIncome = safeTransactions.filter(t => {
        return t && t.type === 'income' && t.date && String(t.date) === today;
      }).reduce((acc, t) => acc + Number(t.amount || 0), 0);
      
      const monthlyIncome = safeTransactions.filter(t => {
        return t && t.type === 'income' && t.date && String(t.date).indexOf(currentMonth) === 0;
      }).reduce((acc, t) => acc + Number(t.amount || 0), 0);
      
      const breakdown = { 
        cash: { income: 0, expense: 0, balance: 0 }, 
        ziraat: { income: 0, expense: 0, balance: 0 }, 
        halk: { income: 0, expense: 0, balance: 0 }, 
        iban: { income: 0, expense: 0, balance: 0 }, 
        mix: { income: 0, expense: 0, balance: 0 } 
      };
      
      safeTransactions.forEach(t => {
        if (!t || !t.amount) return;
        
        const val = Number(t.amount);
        let key = 'cash';
        
        if (t.method === 'mix') {
          key = 'mix';
        } else if (t.method === 'cash') {
          key = 'cash';
        } else if (t.cardBank && typeof t.cardBank === 'string') {
          const bank = t.cardBank.toLowerCase();
          if (bank === 'ziraat') key = 'ziraat';
          else if (bank === 'halk') key = 'halk';
          else key = 'iban';
        }
        
        if (breakdown[key]) {
          if (t.type === 'income') { 
            breakdown[key].income += val; 
            breakdown[key].balance += val; 
          } else if (t.type === 'expense') { 
            breakdown[key].expense += val; 
            breakdown[key].balance -= val; 
          }
        }
      });

      const investmentStats = safeInvestments.reduce((acc, inv) => {
        if (!inv) return acc;
        const currentPrice = inv.currentPrice || inv.buyPrice || 0; 
        const quantity = inv.quantity || 0;
        const buyPrice = inv.buyPrice || 0;
        
        acc.totalCost += quantity * buyPrice;
        acc.currentValue += quantity * currentPrice;
        acc.totalProfit += (quantity * currentPrice) - (quantity * buyPrice);
        return acc;
      }, { totalCost: 0, currentValue: 0, totalProfit: 0 });

      const assets = { 
        cash: breakdown.cash.balance, 
        ziraat: breakdown.ziraat.balance, 
        halk: breakdown.halk.balance, 
        iban: breakdown.iban.balance, 
        mix: breakdown.mix.balance, 
        gold: investmentStats.currentValue 
      };
      
      return { 
        totalIncome, 
        totalExpense, 
        netProfit, 
        netNetProfit, 
        totalMonthlyFixedCosts, 
        dailyIncome, 
        monthlyIncome, 
        breakdown, 
        totalDebt, 
        investmentStats, 
        assets 
      };
  }, [transactions, debts, investments, fixedCosts]);

  // Yeni hesaplamalar ve fonksiyonlar
  const calculateFutureCashflow = useMemo(() => {
      const currentDay = new Date().getDate() || 1;
      const avgDailyIncome = stats.monthlyIncome / currentDay; 
      const estimatedMonthlyIncome = avgDailyIncome * 30;
      const stockExpense = (transactions || []).filter(t => t && t.type === 'expense' && t.category === 'Stok (Fatura)').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const avgDailyStockExpense = stockExpense / currentDay;
      const estimatedNetProfit = estimatedMonthlyIncome - stats.totalMonthlyFixedCosts - (avgDailyStockExpense * 30);
      return { 
        estimatedMonthlyIncome, 
        totalFixedCosts: stats.totalMonthlyFixedCosts, 
        estimatedMonthlyStockExpense: avgDailyStockExpense * 30, 
        estimatedNetProfit 
      };
  }, [stats.monthlyIncome, stats.totalMonthlyFixedCosts, transactions]);

  const getProfitabilityWarnings = (products) => {
      const minProfitMargin = 0.40;
      const safeProducts = Array.isArray(products) ? products : [];
      return safeProducts.map(p => {
          if (!p) return null;
          const margin = p.price > 0 ? (p.price - (p.cost || 0)) / p.price : 0;
          let warning = null;
          if (margin < minProfitMargin) warning = `Marj Dusuk (%${(margin * 100).toFixed(0)})`;
          return { ...p, warning };
      }).filter(p => p && p.warning !== null);
  };
  
  // Tüm gereken verileri App.jsx'e geri gönder
  return {
    transactions,
    products,
    investments,
    debts,
    ingredients,
    quickActions,
    tables,
    fixedCosts,
    setFixedCosts, 
    monthlyGoal,
    setMonthlyGoal, 
    marketRates,
    stats, 
    calculateFutureCashflow, 
    getProfitabilityWarnings,
    loading, 
  };
}