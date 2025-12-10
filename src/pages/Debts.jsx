// pages/Debts.jsx (MODAL ENTEGRE EDİLMİŞ HALİ)

import React, { useState } from 'react';
import { PlusCircle, Smartphone, Calendar, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import { addDoc, deleteDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';

// 👇 YENİ IMPORT: Oluşturduğumuz Modalı ekliyoruz
import PaymentModal from '../components/PaymentModal';

const Debts = ({ debts, stats }) => {
    const [newDebt, setNewDebt] = useState({ supplier: '', amount: '', dueDate: '', note: '', contact: '' });
    
    // 👇 YENİ STATE: Modal yönetimi için
    const [paymentModalData, setPaymentModalData] = useState(null); // { id, supplier, currentBalance } veya null
    const [processing, setProcessing] = useState(false);

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

    // 👇 1. ADIM: Modalı Açan Fonksiyon
    const handleOpenPaymentModal = (debtId, supplierName, currentBalance) => {
        setPaymentModalData({
            id: debtId,
            supplier: supplierName,
            currentBalance: currentBalance
        });
    };

    // 👇 2. ADIM: İşlemi Gerçekleştiren Fonksiyon (Modal'dan tetiklenir)
    const handleProcessPayment = async (paymentAmount) => {
        if (!paymentModalData) return;
        setProcessing(true);

        const user = auth.currentUser;
        const batch = writeBatch(db);
        
        // 1. Transaction (Gider) Kaydı: Ödeme kasadan çıksın
        const transRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
        batch.set(transRef, {
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            amount: paymentAmount,
            desc: `Borç Ödemesi: ${paymentModalData.supplier}`,
            method: 'cash', 
            category: 'Tedarikçi'
        });

        // 2. Debt Kaydı: Ödeme miktarını 'payment' türüyle ekle
        batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'debts')), {
            supplier: paymentModalData.supplier,
            amount: paymentAmount * -1, // Negatif kayıt
            note: 'Borç Ödemesi',
            type: 'payment',
            createdAt: Date.now(),
        });
        
        try {
            await batch.commit();
            setPaymentModalData(null); // Modalı kapat
            alert(`✅ ${formatCurrency(paymentAmount)} ₺ ödeme başarıyla kaydedildi.`);
        } catch (e) {
            alert("Hata: Ödeme kaydedilemedi. " + e.message);
        } finally {
            setProcessing(false);
        }
    };

    // Borçları düzenle (Ödenenleri düş)
    const currentDebts = debts.reduce((acc, d) => {
        if (!acc[d.supplier]) acc[d.supplier] = { amount: 0, latestDueDate: null, id: null, note: '', contact: '' };
        
        if (d.type === 'debt') {
            acc[d.supplier].amount += Number(d.amount);
        } else if (d.type === 'payment') {
            acc[d.supplier].amount += Number(d.amount); 
        }
        
        if (d.dueDate && (!acc[d.supplier].latestDueDate || d.createdAt > acc[d.supplier].createdAt)) {
            acc[d.supplier].latestDueDate = d.dueDate;
            acc[d.supplier].note = d.note;
            acc[d.supplier].id = d.id; 
            if(d.contact) acc[d.supplier].contact = d.contact;
        }

        return acc;
    }, {});
    
    const debtList = Object.entries(currentDebts)
        .filter(([, data]) => data.amount > 0)
        .map(([supplier, data]) => ({ supplier, ...data }));

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
             
             {/* 👇 MODAL BİLEŞENİ BURAYA EKLENDİ */}
             <PaymentModal
                isOpen={!!paymentModalData}
                onClose={() => setPaymentModalData(null)}
                debtData={paymentModalData}
                onConfirm={handleProcessPayment}
                loading={processing}
             />

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
                             {/* 👇 GÜNCELLENDİ: Ödeme Butonu artık modalı açıyor */}
                             <button 
                                onClick={() => handleOpenPaymentModal(debt.id, debt.supplier, debt.amount)} 
                                className="p-2 bg-slate-800 text-slate-500 hover:text-emerald-500 rounded-lg transition-colors"
                                title="Ödeme Kaydet"
                             >
                                 <CheckCircle2 size={20}/>
                             </button>
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