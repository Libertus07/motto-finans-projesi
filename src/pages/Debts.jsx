import React, { useState } from 'react';
import { PlusCircle, Smartphone, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { addDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';

const Debts = ({ debts, stats }) => {
    const [newDebt, setNewDebt] = useState({ supplier: '', amount: '', dueDate: '', note: '', contact: '' });

    // --- FIREBASE İŞLEMLERİ ---
    const handleAddDebt = async () => {
        if (!newDebt.amount || !newDebt.supplier) return;
        const user = auth.currentUser;
        
        const debtData = {
            supplier: newDebt.supplier,
            contact: newDebt.contact || '',
            amount: Number(newDebt.amount),
            dueDate: newDebt.dueDate,
            note: newDebt.note,
            type: 'debt', 
            createdAt: Date.now(),
        };

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'debts'), debtData);
        setNewDebt({ supplier: '', contact: '', amount: '', dueDate: '', note: '' });
    };

    const handleDeleteDebt = async (id) => {
        if(!window.confirm("Bu kaydı silmek istiyor musunuz?")) return;
        const user = auth.currentUser;
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'debts', id));
    };

    // Borçları düzenle (Ödenenleri düş)
    const currentDebts = debts.reduce((acc, d) => {
        if (!acc[d.supplier]) acc[d.supplier] = { amount: 0, latestDueDate: null, id: null, note: '', contact: '' };
        if (d.type === 'debt') {
            acc[d.supplier].amount += Number(d.amount);
            if (!acc[d.supplier].latestDueDate || d.dueDate > acc[d.supplier].latestDueDate) {
                acc[d.supplier].latestDueDate = d.dueDate;
                acc[d.supplier].note = d.note;
                acc[d.supplier].id = d.id; // Son kaydın ID'si
                if(d.contact) acc[d.supplier].contact = d.contact;
            }
        } 
        // Ödeme mantığını basitleştirdik, direkt toplamdan düşüyoruz
        return acc;
    }, {});
    
    const debtList = Object.entries(currentDebts)
        .filter(([, data]) => data.amount > 0)
        .map(([supplier, data]) => ({ supplier, ...data }));

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Cari Hesap / Borç Takibi</h2>
                <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 text-right">
                   <div className="text-xs text-red-400 font-bold uppercase">Toplam Borç</div>
                   <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalDebt)} ₺</div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} h-fit`}>
                   <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-indigo-500"/> Yeni Borç Ekle</h3>
                   <div className="space-y-3">
                      <div><label className="text-xs text-slate-400 block mb-1">Tedarikçi / Kişi</label><input type="text" placeholder="Örn: Sütçü Ahmet" value={newDebt.supplier} onChange={(e) => setNewDebt({...newDebt, supplier: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-all"/></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Telefon</label><input type="text" placeholder="05XX..." value={newDebt.contact} onChange={(e) => setNewDebt({...newDebt, contact: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-all"/></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Tutar</label><input type="number" placeholder="0.00" value={newDebt.amount} onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-all"/></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Vade</label><input type="date" value={newDebt.dueDate} onChange={(e) => setNewDebt({...newDebt, dueDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500 transition-all"/></div>
                      <button onClick={handleAddDebt} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-2">Borç Kaydet</button>
                   </div>
                </div>

                {/* Liste */}
                <div className="lg:col-span-2 space-y-3">
                   {debtList.length === 0 ? <div className="text-center py-20 text-slate-500">Hiç borç kaydı yok. Harika! 🎉</div> : 
                     debtList.map((debt, index) => (
                       <div key={index} className={`${THEME.card} p-4 rounded-xl border ${THEME.border} flex justify-between items-center group hover:border-slate-600 transition-all`}>
                          <div>
                             <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                 {debt.supplier}
                                 {debt.contact && <a href={`tel:${debt.contact}`} className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-600 hover:text-white transition-colors"><Smartphone size={10}/> {debt.contact}</a>}
                             </h4>
                             <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={12}/> Vade: {debt.latestDueDate || 'Belirsiz'}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="text-right">
                                <div className="text-xs text-slate-500 font-bold uppercase">Kalan Tutar</div>
                                <div className="text-xl font-bold text-red-400">{formatCurrency(debt.amount)} ₺</div>
                             </div>
                             <button onClick={() => handleDeleteDebt(debt.id)} className="p-2 bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={20}/></button>
                          </div>
                       </div>
                     ))
                   }
                </div>
             </div>
        </div>
    );
};

export default Debts;