import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Trash2, Target, Building2, User, Zap, FileText, Loader2 } from 'lucide-react';
import { doc, setDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
// 👇 INITIAL_TABLES BURAYA EKLENDİ
import { INITIAL_TRANSACTIONS, INITIAL_PRODUCTS, INITIAL_DEBTS, INITIAL_INVESTMENTS, INITIAL_QUICK_ACTIONS, INITIAL_INGREDIENTS, INITIAL_NOTES, INITIAL_TABLES } from '../utils/constants';

const Settings = ({ monthlyGoal, setMonthlyGoal, fixedCosts, setFixedCosts }) => {
    const [dbLoading, setDbLoading] = useState(false);
    const user = auth.currentUser;

    const handleUpdateGoal = async (val) => {
        setMonthlyGoal(val);
        if(user) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'monthlyGoal'), { value: Number(val) });
    };

    const handleUpdateFixedCost = async (field, val) => {
        const newCosts = { ...fixedCosts, [field]: Number(val) };
        setFixedCosts(newCosts);
        if(user) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'fixedCosts'), newCosts);
    };

    // --- VERİ YÜKLEME FONKSİYONU (MASALAR EKLENDİ) ---
    const seedDemoData = async () => {
        if (!user) return;
        if (!window.confirm("Mevcut verilerin üzerine örnek veriler (MASALAR DAHİL) eklenecek. Devam edilsin mi?")) return;
        
        setDbLoading(true);
        const userId = user.uid;
        const batch = writeBatch(db);

        // Mevcut Veriler
        INITIAL_TRANSACTIONS.forEach(t => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'transactions')), t));
        INITIAL_PRODUCTS.forEach(p => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'products')), p));
        INITIAL_DEBTS.forEach(d => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'debts')), d));
        INITIAL_INVESTMENTS.forEach(i => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'investments')), i));
        INITIAL_QUICK_ACTIONS.forEach(qa => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'quickActions')), qa));
        INITIAL_INGREDIENTS.forEach(ing => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'ingredients')), ing));
        INITIAL_NOTES.forEach(n => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'notes')), n));
        
        // 👇 YENİ EKLENEN KISIM: Masaları Veritabanına Yaz
        if (INITIAL_TABLES) {
            INITIAL_TABLES.forEach(t => {
                // table-1, table-2 gibi sabit ID'lerle kaydediyoruz ki sıralama bozulmasın
                batch.set(doc(db, 'artifacts', appId, 'users', userId, 'tables', t.id), t);
            });
        }

        // Ayarlar
        batch.set(doc(db, 'artifacts', appId, 'users', userId, 'settings', 'fixedCosts'), { rent: 0, staff: 0, bills: 0, other: 0 });
        batch.set(doc(db, 'artifacts', appId, 'users', userId, 'settings', 'monthlyGoal'), { value: 120000 });

        try { 
            await batch.commit(); 
            alert("✅ Örnek veriler ve Masalar başarıyla yüklendi!"); 
        } catch (e) { 
            alert("Hata: " + e.message); 
        } finally { 
            setDbLoading(false); 
        }
    };

    const handleHardReset = async () => {
        if (!window.confirm("⚠️ DİKKAT: TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz.")) return;
        setDbLoading(true);
        const userId = user.uid;
        // 'tables' koleksiyonunu da silinecekler listesine ekledik
        const collections = ['transactions', 'products', 'debts', 'investments', 'quickActions', 'ingredients', 'notes', 'tables'];
        
        try {
            for (const colName of collections) {
                const snapshot = await getDocs(collection(db, 'artifacts', appId, 'users', userId, colName));
                const batch = writeBatch(db);
                snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
            }
            alert("Tüm veriler temizlendi.");
        } catch (e) { console.error(e); } 
        finally { setDbLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><SettingsIcon className="text-indigo-400"/> Ayarlar</h2><p className="text-sm text-slate-400">Sistem yapılandırması.</p></div>
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 bg-emerald-900/20 border-emerald-500/30`}><div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div><div><p className="text-xs font-bold text-emerald-400">SİSTEM AKTİF</p><p className="text-[10px] text-slate-500">Veriler güvende.</p></div></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-slate-800"><User size={32} className="text-white"/></div><div><h3 className="text-lg font-bold text-white">Patron Modu</h3><p className="text-xs text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded-full inline-block mt-1">● Çevrimiçi</p></div></div>
                    <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between text-sm"><span className="text-slate-400">Sürüm</span><span className="text-white font-bold">v3.1.0 (Pro)</span></div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Target size={18} className="text-red-400"/> Aylık Ciro Hedefi</h3>
                    <div className="relative group"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₺</span><input type="number" value={monthlyGoal} onChange={(e) => handleUpdateGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pl-10 text-white text-xl font-bold outline-none focus:border-red-500"/></div>
                </div>
             </div>

             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-6"><div><h3 className="font-bold text-white flex items-center gap-2"><Building2 size={18} className="text-blue-400"/> Sabit Giderler</h3></div><div className="text-right"><span className="text-xs text-slate-500 uppercase font-bold block">Toplam</span><span className="text-xl font-bold text-white">{formatCurrency(Object.values(fixedCosts).reduce((a, b) => a + Number(b), 0))} ₺</span></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(fixedCosts).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-2 bg-slate-800 rounded-lg text-slate-400">{key === 'rent' ? <Building2 size={18}/> : key === 'staff' ? <User size={18}/> : key === 'bills' ? <Zap size={18}/> : <FileText size={18}/>}</div><span className="text-sm font-medium text-slate-300 capitalize">{key === 'rent' ? 'Kira' : key === 'staff' ? 'Maaş' : key === 'bills' ? 'Fatura' : 'Diğer'}</span></div>
                            <div className="flex items-center gap-2"><input type="number" value={val} onChange={(e) => handleUpdateFixedCost(key, e.target.value)} className="bg-transparent text-right text-white font-bold outline-none w-24 border-b border-transparent focus:border-blue-500"/><span className="text-sm text-slate-500">₺</span></div>
                        </div>
                    ))}
                </div>
             </div>

             <div className="border border-red-500/20 bg-red-900/5 p-6 rounded-2xl">
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2"><Database size={18}/> Veri Yönetimi</h3>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button onClick={seedDemoData} disabled={dbLoading} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-600">{dbLoading ? <Loader2 className="animate-spin"/> : <Database size={16}/>} Örnek Veri & Masaları Yükle</button>
                    <button onClick={handleHardReset} disabled={dbLoading} className="flex-1 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-red-500/50">{dbLoading ? <Loader2 className="animate-spin"/> : <Trash2 size={16}/>} Tümünü Sil</button>
                </div>
             </div>
        </div>
    );
};

export default Settings;