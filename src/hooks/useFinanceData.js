// src/hooks/useFinanceData.js (DEBUG MODU VE SIRALAMA KALDIRILDI)

import { useState, useEffect, useMemo, useRef } from 'react'; 
import { collection, doc, onSnapshot, query, limit, writeBatch } from 'firebase/firestore'; // orderBy kaldırıldı
import { db, appId } from '../services/firebase';
import { INITIAL_TABLES } from '../utils/constants'; 

// 👇 MAĞAZA KİMLİĞİ
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
  
  const [fixedCosts, setFixedCosts] = useState({ rent: 0, staff: 0, bills: 0, other: 0 });
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [marketRates, setMarketRates] = useState({ gold: 0, dollar: 0, euro: 0 });
  const [loading, setLoading] = useState(true); 
  
  const hasSeededTablesRef = useRef(false);

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
    if (!user) return; 
    
    // 👇 KONSOLA LOG BASIYORUZ: Hangi yola bağlanıyor?
    console.log("🔥 Bağlanılan Mağaza Yolu:", `artifacts/${appId}/shops/${CURRENT_SHOP_ID}`);

    const unsubscribers = []; 
    setLoading(true);

    try {
      // 1. MASALAR
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables'), (s) => {
        const tableData = s.docs.map(d => ({id:d.id, ...d.data()}));
        setTables(tableData.sort((a,b) => a.number - b.number)); // JS ile sıralama
        if (tableData.length === 0 && !hasSeededTablesRef.current) { autoSeedTables(); }
        if (tableData.length > 0) setLoading(false); 
      }, (error) => console.error("❌ MASA OKUMA HATASI:", error)));

      // 2. PERSONEL
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff'), (s) => {
          setStaff(s.docs.map(d => ({id:d.id, ...d.data()})));
      }, (error) => console.error("❌ PERSONEL OKUMA HATASI:", error)));

      // 3. FİNANS VE İŞLEMLER
      unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), limit(500)), (s) => {
          setTransactions(s.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b) => b.date.localeCompare(a.date)));
      }, (error) => console.error("❌ İŞLEM OKUMA HATASI:", error)));
      
      // 👇 4. ÜRÜNLER (SORUNLU KISIM BURASIYDI)
      // orderBy('name') komutunu kaldırdık, belki index hatası veriyordur.
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products'), (s) => {
          const prodData = s.docs.map(d => ({id:d.id, ...d.data()}));
          console.log("✅ ÜRÜNLER GELDİ:", prodData); // Gelen veriyi konsola yazar
          setProducts(prodData.sort((a,b) => a.name.localeCompare(b.name))); // JS ile sıralama
      }, (error) => {
          console.error("❌ ÜRÜN OKUMA HATASI:", error); // Hata varsa konsolda kırmızı yazar
          console.log("Hata Detayı:", error.message);
      }));
      
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments'), s => setInvestments(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts'), s => setDebts(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), s => setIngredients(s.docs.map(d => ({id:d.id, ...d.data()})))));
      unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'quickActions'), s => setQuickActions(s.docs.map(d => ({id:d.id, ...d.data()})))));

      // 5. AYARLAR
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'fixedCosts'), (doc) => { if(doc.exists()) setFixedCosts(doc.data()); }));
      unsubscribers.push(onSnapshot(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'monthlyGoal'), (doc) => { if(doc.exists()) setMonthlyGoal(doc.data().value); }));

    } catch (error) {
      console.error("Genel Veri Çekme Hatası:", error);
      setLoading(false);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  // Döviz Kurları (Hata Korumalı Versiyon)
  useEffect(() => {
        const fetchRates = async () => {
            try {
                // API isteği
                const response = await fetch('https://api.genelpara.com/embed/altin.json');
                
                // Eğer sunucu hata verirse veya HTML dönerse (Sizin aldığınız hata)
                if (!response.ok) throw new Error("Sunucu yanıt vermedi");
                
                const text = await response.text();
                // Gelen veri JSON formatında mı kontrol et
                if (!text.startsWith('{')) throw new Error("API JSON döndürmedi");

                const data = JSON.parse(text);
                setMarketRates({
                    gold: parseFloat(data.GA.satis),
                    dollar: parseFloat(data.USD.satis),
                    euro: parseFloat(data.EUR.satis)
                });
            } catch (error) { 
                console.warn("⚠️ Döviz verisi çekilemedi, varsayılan değerler kullanılıyor.", error.message);
                // Hata olursa uygulama çökmesin, bu değerleri kullan:
                setMarketRates({ gold: 2950, dollar: 34.50, euro: 37.20 });
            }
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
    staff, 
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings, loading
  };
}