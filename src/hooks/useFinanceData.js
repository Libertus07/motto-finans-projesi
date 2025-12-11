// src/hooks/useFinanceData.js (PERSONEL VERİSİ EKLENDİ ✅)

import { useState, useEffect, useMemo, useRef } from 'react'; 
import { collection, doc, onSnapshot, query, orderBy, limit, writeBatch } from 'firebase/firestore'; 
import { db, appId } from '../services/firebase';
import { INITIAL_TABLES } from '../utils/constants'; 

export default function useFinanceData(user) {
  // State Tanımları
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [tables, setTables] = useState([]);
  
  // 👇 EKSİK OLAN KISIM: Personel State'i
  const [staff, setStaff] = useState([]); 
  
  const [fixedCosts, setFixedCosts] = useState({ rent: 0, staff: 0, bills: 0, other: 0 });
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [marketRates, setMarketRates] = useState({ gold: 0, dollar: 0, euro: 0 });
  const [loading, setLoading] = useState(true); 
  
  const hasSeededTablesRef = useRef(false);

  const autoSeedTables = (userId) => {
      if (!userId || hasSeededTablesRef.current) return;
      const batch = writeBatch(db);
      if (INITIAL_TABLES && INITIAL_TABLES.length > 0) {
          INITIAL_TABLES.forEach(t => {
              batch.set(doc(db, 'artifacts', appId, 'users', userId, 'tables', t.id), t);
          });
      }
      setTables(INITIAL_TABLES); 
      setLoading(false); 
      hasSeededTablesRef.current = true; 
      batch.commit().catch(e => console.error("Masa oluşturma hatası:", e));
  };

  useEffect(() => {
    if (!user || !user.uid) return; 
    
    const uid = user.uid;
    const unsubscribers = []; 
    setLoading(true);

    try {
      // Masalar
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'tables'), orderBy('number', 'asc')), s => {
        const tableData = s.docs.map(d => ({id:d.id, ...d.data()}));
        setTables(tableData);
        if (tableData.length === 0 && !hasSeededTablesRef.current) { autoSeedTables(uid); }
        if (tableData.length > 0) setLoading(false); 
      }));

      // 👇 EKSİK OLAN KISIM: Personel Verisini Çekme Kodu
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'staff'), s => setStaff(s.docs.map(d => ({id:d.id, ...d.data()})))));

      // Diğer Veriler
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'transactions'), orderBy('date', 'desc'), limit(500)), s => setTransactions(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'users', uid, 'products'), orderBy('name', 'asc')), s => setProducts(s.docs.map(d => ({id:d.id, ...d.data()})))));
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

  useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.genelpara.com/embed/altin.json');
                const data = await response.json();
                setMarketRates({
                    gold: parseFloat(data.GA.satis),
                    dollar: parseFloat(data.USD.satis),
                    euro: parseFloat(data.EUR.satis)
                });
            } catch (error) { console.error(error); }
        };
        fetchRates();
  }, []);

  const stats = useMemo(() => {
      const safeTransactions = Array.isArray(transactions) ? transactions : [];
      const safeDebts = Array.isArray(debts) ? debts : [];
      const safeInvestments = Array.isArray(investments) ? investments : [];
      
      const totalIncome = safeTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalExpense = safeTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const netProfit = totalIncome - totalExpense;
      const totalMonthlyFixedCosts = Object.values(fixedCosts || {}).reduce((sum, val) => sum + Number(val || 0), 0);
      const netNetProfit = netProfit - totalMonthlyFixedCosts;
      
      const totalDebt = safeDebts.filter(d => d.type === 'debt').reduce((acc, d) => acc + Number(d.amount || 0), 0) - 
                        safeDebts.filter(d => d.type === 'payment').reduce((acc, d) => acc + Number(d.amount || 0), 0);
      
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = today.slice(0, 7);
      
      const dailyIncome = safeTransactions.filter(t => t.type === 'income' && t.date === today).reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const monthlyIncome = safeTransactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const monthlyExpense = safeTransactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const breakdown = { cash: { balance: 0 }, ziraat: { balance: 0 }, halk: { balance: 0 }, iban: { balance: 0 }, mix: { balance: 0 } };
      
      safeTransactions.forEach(t => {
        const val = Number(t.amount || 0);
        let key = 'cash';
        if (t.method === 'mix') key = 'mix';
        else if (t.cardBank) {
             if (t.cardBank === 'ziraat') key = 'ziraat';
             else if (t.cardBank === 'halk') key = 'halk';
             else key = 'iban';
        }
        if (t.type === 'income') breakdown[key].balance += val;
        else breakdown[key].balance -= val;
      });

      const investmentStats = safeInvestments.reduce((acc, inv) => {
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
        totalIncome, totalExpense, netProfit, netNetProfit, totalMonthlyFixedCosts, 
        dailyIncome, monthlyIncome, monthlyExpense, breakdown, totalDebt, investmentStats, assets,
        currentBalance: netProfit 
      };
  }, [transactions, debts, investments, fixedCosts]);

  const calculateFutureCashflow = (days = 30) => {
      const dailyAvgIncome = stats.monthlyIncome / 30; 
      const dailyAvgExpense = stats.monthlyExpense / 30;
      const dailyFixedCost = stats.totalMonthlyFixedCosts / 30;
      return stats.currentBalance + ((dailyAvgIncome - dailyAvgExpense - dailyFixedCost) * days);
  };

  const getProfitabilityWarnings = (productsList) => {
      if (!Array.isArray(productsList)) return [];
      return productsList
          .filter(p => p.cost > 0 && p.price > 0)
          .map(p => ({ ...p, margin: ((p.price - p.cost) / p.price) * 100 }))
          .filter(p => p.margin < 30)
          .sort((a,b) => a.margin - b.margin);
  };
  
  return {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    staff, // 👈 DIŞARI AKTARDIK
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings, loading
  };
}