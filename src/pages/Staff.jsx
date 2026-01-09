// src/pages/Staff.jsx (ORTAK HAVUZ ENTEGRASYONU ✅)

import React, { useState } from 'react';
import { Users, UserPlus, DollarSign, Wallet, Trash2, Save, X, Clock, CreditCard, Banknote, Calendar, CheckCircle2 } from 'lucide-react';
import { addDoc, doc, updateDoc, deleteDoc, collection, arrayUnion } from 'firebase/firestore'; 
import { db, appId } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';

// 👇 MAĞAZA ID
const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const Staff = ({ staff }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [advanceModal, setAdvanceModal] = useState({ open: false, staffId: null, staffName: '' });
    const [salaryModal, setSalaryModal] = useState({ open: false, staffId: null, staffName: '', baseSalary: 0, deduction: 0, netSalary: 0 });
    const [deleteId, setDeleteId] = useState(null); 
    const [historyDelete, setHistoryDelete] = useState(null); 
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const [newStaff, setNewStaff] = useState({ name: '', role: 'Garson', salary: '', startDate: '', salaryDay: '', advances: [], payments: [] });
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash'); 

    const ROLES = ['Garson', 'Kasiyer', 'Barista', 'Mutfak', 'Temizlik', 'Müdür'];

    const calculateWorkDuration = (startDate) => {
        if (!startDate) return { text: 'Yeni Başladı' };
        const start = new Date(startDate);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return { text: `${diffDays} Gün` };
        if (diffDays < 365) return { text: `${Math.floor(diffDays / 30)} Ay` };
        return { text: `${Math.floor(diffDays / 365)} Yıl` };
    };

    const calculateTotalAdvances = (advances) => {
        if (!advances || advances.length === 0) return 0;
        return advances.reduce((total, item) => total + Number(item.amount), 0);
    };

    const openSalaryModal = (person) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const thisMonthAdvances = (person.advances || [])
            .filter(a => a.date.startsWith(currentMonth))
            .reduce((sum, a) => sum + Number(a.amount), 0);

        const net = Number(person.salary) - thisMonthAdvances;

        setSalaryModal({
            open: true,
            staffId: person.id,
            staffName: person.name,
            baseSalary: person.salary,
            deduction: thisMonthAdvances,
            netSalary: net > 0 ? net : 0
        });
        setAmount(net > 0 ? net : 0);
        setPaymentMethod('cash');
    };

    // --- İŞLEMLER (ORTAK HAVUZ) ---
    
    const handleAddStaff = async () => {
        if (!newStaff.name || !newStaff.salary || !newStaff.salaryDay) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Tüm alanları doldurunuz.' });
            return;
        }
        try {
            // 👇 ORTAK HAVUZA EKLEME
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff'), {
                ...newStaff, salary: Number(newStaff.salary), salaryDay: Number(newStaff.salaryDay), createdAt: new Date().toISOString()
            });
            setNewStaff({ name: '', role: 'Garson', salary: '', startDate: '', salaryDay: '', advances: [], payments: [] });
            setIsFormOpen(false);
            setInfoModal({ isOpen: true, type: 'success', title: 'Başarılı', message: 'Personel eklendi.' });
        } catch (error) { setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kaydedilemedi.' }); }
    };

    const confirmDeleteStaff = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff', deleteId));
            setDeleteId(null);
            setInfoModal({ isOpen: true, type: 'success', title: 'Silindi', message: 'Personel silindi.' });
        } catch (error) { setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' }); }
    };

    const handleGiveAdvance = async () => {
        if (!amount || amount <= 0) return;
        try {
            const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
            const cardBank = paymentMethod === 'cash' ? null : paymentMethod;
            
            // 1. KASADAN DÜŞ (ORTAK KASA)
            const transRef = await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                type: 'expense', amount: Number(amount), category: 'Personel Avans',
                desc: `${advanceModal.staffName} - Avans`, date: new Date().toISOString().split('T')[0], method: transMethod, cardBank: cardBank,
                user: 'Sistem'
            });

            // 2. PERSONELE İŞLE
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff', advanceModal.staffId), {
                advances: arrayUnion({ 
                    amount: Number(amount), 
                    date: new Date().toISOString(), 
                    id: Date.now(), 
                    method: paymentMethod,
                    transactionId: transRef.id 
                })
            });

            setAdvanceModal({ open: false, staffId: null, staffName: '' }); setAmount('');
            setInfoModal({ isOpen: true, type: 'success', title: 'Avans Verildi', message: 'Tutar kasadan düşüldü.' });
        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'İşlem yapılamadı.' }); }
    };

    const handlePaySalary = async () => {
        if (!amount || amount <= 0) return;
        try {
            const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
            const cardBank = paymentMethod === 'cash' ? null : paymentMethod;
            
            // 1. KASADAN DÜŞ (ORTAK KASA)
            const transRef = await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                type: 'expense', amount: Number(amount), category: 'Personel Maaş',
                desc: `${salaryModal.staffName} - Maaş Ödemesi`, date: new Date().toISOString().split('T')[0], method: transMethod, cardBank: cardBank,
                user: 'Sistem'
            });

            // 2. PERSONELE İŞLE
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff', salaryModal.staffId), {
                payments: arrayUnion({ 
                    amount: Number(amount), 
                    date: new Date().toISOString(), 
                    id: Date.now(), 
                    type: 'salary', 
                    method: paymentMethod,
                    transactionId: transRef.id 
                })
            });

            setSalaryModal({ open: false, staffId: null, staffName: '', baseSalary: 0, deduction: 0, netSalary: 0 }); setAmount('');
            setInfoModal({ isOpen: true, type: 'success', title: 'Maaş Ödendi', message: 'Ödeme kaydedildi.' });
        } catch (error) { setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'İşlem yapılamadı.' }); }
    };

    const confirmHistoryDelete = async () => {
        if (!historyDelete) return;
        const { staffId, item, type } = historyDelete;

        try {
            const currentStaff = staff.find(s => s.id === staffId);
            if (!currentStaff) return;

            const field = type === 'advance' ? 'advances' : 'payments';
            const currentArray = currentStaff[field] || [];
            const newArray = currentArray.filter(i => i.id !== item.id);

            // 1. PERSONELDEN SİL
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'staff', staffId), {
                [field]: newArray
            });

            // 2. KASADAN İŞLEMİ SİL (PARAYI İADE ET)
            if (item.transactionId) {
                await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions', item.transactionId));
            }

            setHistoryDelete(null);
            setInfoModal({ isOpen: true, type: 'success', title: 'İşlem İptal Edildi', message: 'Kayıt silindi ve tutar kasaya geri yansıdı.' });
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silme işlemi başarısız.' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDeleteStaff} title="Personeli Sil" message="Emin misiniz?" type="danger"/>
            <ConfirmationModal isOpen={!!historyDelete} onClose={() => setHistoryDelete(null)} onConfirm={confirmHistoryDelete} title="İşlemi İptal Et" message="Bu ödemeyi silmek istediğinize emin misiniz? Tutar kasaya geri eklenecektir." type="warning" confirmText="Evet, İptal Et"/>
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message}/>

            <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div><h2 className="text-3xl font-black text-white flex items-center gap-3"><Users className="text-indigo-500" size={32}/> Personel Yönetimi</h2><p className="text-slate-400 text-sm mt-1">Maaş ve avans takibi.</p></div>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isFormOpen ? 'bg-slate-700 text-slate-300' : 'bg-indigo-600 text-white'}`}>{isFormOpen ? <X size={20}/> : <UserPlus size={20}/>} {isFormOpen ? 'Vazgeç' : 'Personel Ekle'}</button>
            </div>

            {isFormOpen && (
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-indigo-500/30 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="lg:col-span-2"><label className="text-xs text-slate-400 font-bold block mb-1">AD SOYAD</label><input type="text" value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-indigo-500"/></div>
                        <div><label className="text-xs text-slate-400 font-bold block mb-1">POZİSYON</label><select value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-indigo-500">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                        <div><label className="text-xs text-slate-400 font-bold block mb-1">MAAŞ (TL)</label><input type="number" value={newStaff.salary} onChange={(e) => setNewStaff({...newStaff, salary: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-indigo-500 font-bold"/></div>
                        <div><label className="text-xs text-slate-400 font-bold block mb-1">ÖDEME GÜNÜ</label><input type="number" min="1" max="31" placeholder="1-31" value={newStaff.salaryDay} onChange={(e) => setNewStaff({...newStaff, salaryDay: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-indigo-500 text-center"/></div>
                        <div><label className="text-xs text-slate-400 font-bold block mb-1">GİRİŞ TARİHİ</label><input type="date" value={newStaff.startDate} onChange={(e) => setNewStaff({...newStaff, startDate: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-indigo-500 text-sm"/></div>
                        <button onClick={handleAddStaff} className="bg-emerald-600 hover:bg-emerald-500 text-white h-[48px] rounded-xl font-bold lg:col-span-6 mt-2 flex items-center justify-center gap-2"><Save size={18}/> Kaydet</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {staff.map((person) => {
                    const workInfo = calculateWorkDuration(person.startDate);
                    const totalAdvances = calculateTotalAdvances(person.advances);
                    const history = [
                        ...(person.advances || []).map(a => ({ ...a, type: 'advance', label: 'Avans', color: 'text-red-400' })),
                        ...(person.payments || []).map(p => ({ ...p, type: 'payment', label: 'Maaş', color: 'text-emerald-400' }))
                    ].sort((a, b) => b.id - a.id).slice(0, 5);

                    return (
                        <div key={person.id} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500/50 p-6 shadow-xl relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">{person.name.charAt(0).toUpperCase()}</div>
                                    <div><h3 className="text-lg font-bold text-white">{person.name}</h3><div className="flex items-center gap-2 mt-1"><span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{person.role}</span><span className="text-xs text-emerald-400 font-bold">{formatCurrency(person.salary)}</span></div></div>
                                </div>
                                <button onClick={() => setDeleteId(person.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={18}/></button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50"><div className="text-[9px] text-slate-400 font-bold mb-1">Maaş Günü</div><div className="text-sm font-bold text-indigo-400 flex items-center justify-center gap-1"><Calendar size={12}/> {person.salaryDay || '?'}</div></div>
                                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50"><div className="text-[9px] text-slate-400 font-bold mb-1">Süre</div><div className="text-xs font-bold text-white">{workInfo.text}</div></div>
                                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50"><div className="text-[9px] text-slate-400 font-bold mb-1">Avans</div><div className="text-sm font-bold text-red-400">{formatCurrency(totalAdvances)}</div></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button onClick={() => { setAdvanceModal({ open: true, staffId: person.id, staffName: person.name }); setAmount(''); setPaymentMethod('cash'); }} className="py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"><DollarSign size={14} className="text-amber-400"/> Avans</button>
                                <button onClick={() => { openSalaryModal(person); }} className="py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-500/30"><CheckCircle2 size={14}/> Maaş Öde</button>
                            </div>
                            {history.length > 0 && (
                                <div className="pt-3 border-t border-slate-700/50">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 ml-1">Son İşlemler</p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                        {history.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 group/item transition-colors">
                                                <div className="flex items-center gap-2"><span className="text-slate-400 font-medium">{new Date(item.date).toLocaleDateString('tr-TR')}</span><span className={`text-[9px] uppercase px-1.5 rounded bg-slate-800 ${item.color}`}>{item.label}</span></div>
                                                <div className="flex items-center gap-2"><span className={`${item.color} font-bold font-mono`}>{formatCurrency(item.amount)}</span><button onClick={() => setHistoryDelete({ staffId: person.id, item: item, type: item.type })} className="text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity" title="İptal Et"><X size={14}/></button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* AVANS MODALI */}
            {advanceModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm relative">
                        <button onClick={() => setAdvanceModal({ open: false, staffId: null })} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white mb-1">Avans Ver</h3>
                        <p className="text-sm text-slate-400 mb-6">Personel: <span className="text-white font-bold">{advanceModal.staffName}</span></p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2"><button onClick={() => setPaymentMethod('cash')} className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 ${paymentMethod === 'cash' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}><Banknote size={20}/> Nakit</button><button onClick={() => setPaymentMethod('ziraat')} className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 ${paymentMethod !== 'cash' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}><CreditCard size={20}/> Banka</button></div>
                            {paymentMethod !== 'cash' && (<div className="grid grid-cols-3 gap-2">{['ziraat', 'halk', 'iban'].map(bank => (<button key={bank} onClick={() => setPaymentMethod(bank)} className={`py-2 text-xs font-bold rounded-lg border ${paymentMethod === bank ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>{bank.toUpperCase()}</button>))}</div>)}
                            <div className="relative"><input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-2xl font-bold outline-none focus:border-emerald-500 font-mono text-center" autoFocus/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span></div>
                            <button onClick={handleGiveAdvance} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg">Onayla</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAAŞ MODALI */}
            {salaryModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm relative">
                        <button onClick={() => setSalaryModal({ open: false })} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                        <div className="text-center mb-6"><h3 className="text-xl font-bold text-white">Maaş Ödemesi</h3><p className="text-sm text-slate-400">{salaryModal.staffName}</p></div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 mb-6 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Normal Maaş</span><span className="text-white font-bold">{formatCurrency(salaryModal.baseSalary)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Bu Ayki Avans</span><span className="text-red-400 font-bold">-{formatCurrency(salaryModal.deduction)}</span></div>
                            <div className="h-px bg-slate-700 my-1"></div>
                            <div className="flex justify-between text-base"><span className="text-emerald-400 font-bold">Ödenecek</span><span className="text-emerald-400 font-bold text-lg">{formatCurrency(salaryModal.netSalary)}</span></div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2"><button onClick={() => setPaymentMethod('cash')} className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 ${paymentMethod === 'cash' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}><Banknote size={20}/> Nakit</button><button onClick={() => setPaymentMethod('ziraat')} className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 ${paymentMethod !== 'cash' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}><CreditCard size={20}/> Banka</button></div>
                            {paymentMethod !== 'cash' && (<div className="grid grid-cols-3 gap-2">{['ziraat', 'halk', 'iban'].map(bank => (<button key={bank} onClick={() => setPaymentMethod(bank)} className={`py-2 text-xs font-bold rounded-lg border ${paymentMethod === bank ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>{bank.toUpperCase()}</button>))}</div>)}
                            <div className="relative"><label className="text-[10px] text-slate-500 uppercase font-bold absolute -top-5 left-1">Ödenecek Tutar (Değiştirilebilir)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-2xl font-bold outline-none focus:border-emerald-500 font-mono text-center"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span></div>
                            <button onClick={handlePaySalary} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg">Ödemeyi Onayla</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;