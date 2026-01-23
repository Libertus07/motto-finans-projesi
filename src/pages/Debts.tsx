// pages/Debts.tsx (ORTAK HAVUZ ENTEGRASYONU ✅)

import React, { useState } from 'react';
import { PlusCircle, Users, AlertCircle, Trash2, Wallet } from 'lucide-react';
import { addDoc, deleteDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { formatCurrency, formatDate } from '../utils/helpers';
import PaymentModal from '../components/PaymentModal';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';

// 👇 MAĞAZA ID
import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';
import { Debt, PaymentMethod, BankName } from '../types';

interface DebtsProps {
    debts: Debt[];
}

interface PaymentModalData {
    id: string;
    supplier: string;
    currentBalance: number;
}

const Debts: React.FC<DebtsProps> = ({ debts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active'); // active, history
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Ekleme/Ödeme Modal State'leri
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Ödeme Modalı State'leri
    const [paymentModalData, setPaymentModalData] = useState<PaymentModalData | null>(null);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({ supplier: '', amount: '', note: '', dueDate: '', contact: '' });
    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

    // --- BORÇ EKLEME ---
    const handleAddDebt = async () => {
        if (!formData.supplier || !formData.amount) return;
        setProcessing(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts'), {
                supplier: formData.supplier,
                amount: Number(formData.amount),
                remaining: Number(formData.amount),
                note: formData.note,
                dueDate: formData.dueDate,
                contact: formData.contact,
                status: 'pending',
                createdAt: new Date().toISOString(),
                type: 'debt',
                payments: []
            });
            setIsAddModalOpen(false);
            setFormData({ supplier: '', amount: '', note: '', dueDate: '', contact: '' });
            setInfoModal({ isOpen: true, type: 'success', title: 'Başarılı', message: 'Borç kaydedildi.' });
        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kaydedilemedi.' }); } finally { setProcessing(false); }
    };

    // --- ÖDEME YAPMA ---
    const handleProcessPayment = async (payAmount: string | number, method: string, cardBank: string | null) => {
        if (!paymentModalData) return;
        setProcessing(true);
        try {
            const subMethod = method === 'cash' ? 'Nakit' : (method === 'iban' ? 'IBAN' : `Kart (${cardBank})`);

            const batch = writeBatch(db);
            const debtRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts', paymentModalData.id);

            // 1. Transaction (Gider) Kaydı
            const transRef = doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'));
            batch.set(transRef, {
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                amount: Number(payAmount),
                desc: `${paymentModalData.supplier} - Borç Ödemesi`,
                method: method,
                cardBank: method === 'card' ? cardBank : null,
                subMethod: subMethod,
                category: 'Stok/Malzeme'
            });

            // 2. Debt Kaydı (Ödeme Geçmişi İçin)
            const payRef = doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts'));
            batch.set(payRef, {
                parentId: paymentModalData.id,
                supplier: paymentModalData.supplier,
                amount: Number(payAmount),
                date: new Date().toISOString(),
                type: 'payment',
                method: subMethod
            });

            // 3. Ana Borcu Güncelle
            const newRemaining = paymentModalData.currentBalance - Number(payAmount);
            const newStatus = newRemaining <= 0 ? 'paid' : 'partial';
            batch.update(debtRef, { remaining: newRemaining, status: newStatus, lastPaymentDate: new Date().toISOString() });

            await batch.commit();
            setPaymentModalData(null);
            setInfoModal({ isOpen: true, type: 'success', title: 'Ödeme Alındı', message: 'Tutar kasadan düşüldü.' });

        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Ödeme alınamadı.' }); } finally { setProcessing(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts', deleteId));
            setDeleteId(null);
        } catch (error) { console.error(error); }
    };

    // FİLTRELEME MANTIĞI (Önceki Debt yapısıyla uyumlu)
    const activeDebts = debts?.filter(d => d.type === 'debt' && d.status !== 'paid' && d.supplier.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const paidDebts = debts?.filter(d => d.type === 'debt' && d.status === 'paid' && d.supplier.toLowerCase().includes(searchTerm.toLowerCase())) || [];
    const totalDebtAmount = activeDebts.reduce((acc, d) => acc + d.remaining, 0);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in">
            <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Kaydı Sil" message="Bu kaydı silmek istediğinize emin misiniz?" type="danger" loading={false} />
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message} />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={!!paymentModalData}
                onClose={() => setPaymentModalData(null)}
                debtData={paymentModalData}
                onConfirm={handleProcessPayment}
                loading={processing}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3"><Users className="text-indigo-500" size={32} /> Veresiye Defteri</h2>
                    <p className="text-slate-400 text-sm mt-1">Toplam Aktif Borç: <span className="text-red-400 font-bold">{formatCurrency(totalDebtAmount)} ₺</span></p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20"><PlusCircle size={18} /> Yeni Borç Ekle</button>
            </div>

            {/* Tabs & Search */}
            <div className="flex gap-4 items-center">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => setActiveTab('active')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Aktif Borçlar</button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Ödenmişler</button>
                </div>
                <input type="text" placeholder="Tedarikçi Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 text-sm w-48" />
            </div>

            {/* Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'active' ? activeDebts : paidDebts).map(debt => (
                    <div key={debt.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-indigo-500/30 transition-all shadow-lg relative group">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-white text-lg">{debt.supplier}</h3>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${debt.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                {debt.status === 'paid' ? 'ÖDENDİ' : 'ÖDEME BEKLİYOR'}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Toplam Tutar:</span><span className="text-white font-bold">{formatCurrency(debt.amount)} ₺</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Kalan:</span><span className="text-red-400 font-bold">{formatCurrency(debt.remaining)} ₺</span></div>
                            {debt.dueDate && <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/10 p-2 rounded-lg"><AlertCircle size={12} /> Son Ödeme: {formatDate(debt.dueDate)}</div>}
                            {debt.note && <p className="text-xs text-slate-500 italic">"{debt.note}"</p>}
                        </div>

                        {activeTab === 'active' && (
                            <div className="flex gap-2">
                                <button onClick={() => setPaymentModalData({ id: debt.id, supplier: debt.supplier, currentBalance: debt.remaining })} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Wallet size={14} /> Ödeme Yap</button>
                                <button onClick={() => setDeleteId(debt.id)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-bold"><Trash2 size={14} /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* EKLEME MODALI */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Yeni Borç Ekle</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Tedarikçi Adı" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none" />
                            <input type="number" placeholder="Tutar (₺)" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none" />
                            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none" />
                            <input type="text" placeholder="Telefon (İsteğe bağlı)" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none" />
                            <textarea placeholder="Not (Opsiyonel)" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none resize-none" rows={2} />
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold">İptal</button>
                                <button onClick={handleAddDebt} disabled={processing} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">{processing ? '...' : 'Kaydet'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debts;
