// pages/Transactions.jsx (TAMAMEN PROFESYONEL)

import React, { useState } from 'react';
import { Trash2, PlusCircle, MinusCircle, Zap, Settings, X, RefreshCw, FileText, CreditCard, Banknote, Smartphone, ChevronDown, History, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency, getSubMethod, formatDate } from '../utils/helpers';
import { THEME } from '../utils/constants';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal'; // 👇 YENİ IMPORT

const BankSelector = ({ newTrans, setNewTrans }) => {
    const bankOptions = [
        { key: 'ziraat', label: 'ZİRAAT', color: newTrans.type === 'income' ? 'bg-red-600 border-red-500' : 'bg-red-600 border-red-500' }, 
        { key: 'halk', label: 'HALK', color: newTrans.type === 'income' ? 'bg-blue-600 border-blue-500' : 'bg-blue-600 border-blue-500' },
        { key: 'iban', label: 'DİĞER', icon: <Smartphone size={14}/>, color: newTrans.type === 'income' ? 'bg-purple-600 border-purple-500' : 'bg-purple-600 border-purple-500' },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {bankOptions.map(option => (
                <button 
                    key={option.key}
                    onClick={() => setNewTrans({...newTrans, cardBank: option.key})} 
                    className={`p-2.5 rounded-lg text-xs font-bold border transition-all 
                        ${newTrans.cardBank === option.key ? `${option.color} text-white` : 'bg-slate-900 border-slate-700 text-slate-400'}
                        ${option.key === 'iban' ? 'flex items-center justify-center gap-1' : ''}
                    `}
                >
                    {option.icon}
                    {option.label}
                </button>
            ))}
        </div>
    );
};

const Transactions = ({ transactions, quickActions, isPatron }) => {
    const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
    const [newTrans, setNewTrans] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        type: 'income', method: 'cash', cardBank: 'ziraat', category: 'Günlük', amount: '', desc: '' 
    });
    const [newShortcut, setNewShortcut] = useState({ label: '', type: 'expense', method: 'cash', cardBank: 'ziraat', category: 'Günlük', desc: '', icon: '⚡' });
    const [transferData, setTransferData] = useState({ from: 'ziraat', to: 'cash', amount: '', desc: '' });
    
    // Modal State'leri
    const [deleteId, setDeleteId] = useState(null);
    // 👇 Info Modal State
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const handleAddTransaction = async () => {
        if (!newTrans.amount || Number(newTrans.amount) <= 0) return;
        const user = auth.currentUser;
        const newItem = {
            ...newTrans, amount: Number(newTrans.amount),
            desc: newTrans.desc || (newTrans.type === 'income' ? 'Satış' : 'Gider'),
            subMethod: getSubMethod(newTrans),
            cardBank: newTrans.method === 'card' ? newTrans.cardBank : null, 
            category: newTrans.type === 'expense' ? newTrans.category : null
        };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), newItem);
        setNewTrans({ ...newTrans, amount: '', desc: '' });
    };

    const confirmDelete = async () => {
        if(!deleteId) return;
        const user = auth.currentUser;
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', deleteId));
        setDeleteId(null);
    };

    const handleAddQuickAction = async () => {
        if (!newShortcut.label) return;
        const user = auth.currentUser;
        const order = quickActions.length > 0 ? quickActions[quickActions.length - 1].order + 1 : 1;
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'quickActions'), { ...newShortcut, order });
        setNewShortcut({ label: '', type: 'expense', method: 'cash', cardBank: 'ziraat', category: 'Günlük', desc: '', icon: '⚡' });
    };

    const handleDeleteQuickAction = async (id) => {
        const user = auth.currentUser;
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'quickActions', id));
    };

    const applyQuickAction = (action) => {
        setNewTrans({
            ...newTrans, type: action.type, method: action.method || 'cash',
            cardBank: action.cardBank || 'ziraat', category: action.category || 'Günlük',
            desc: action.desc, amount: '', date: new Date().toISOString().split('T')[0]
        });
    };

    const handleAssetTransfer = async () => {
        const { from, to, amount, desc } = transferData;
        if(Number(amount) <= 0 || from === to) return;
        const user = auth.currentUser;
        const batch = writeBatch(db);
        const ref = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
        
        const expense = { 
            date: new Date().toISOString().split('T')[0], type: 'expense', amount: Number(amount), 
            desc: `Transfer Çıkışı: ${desc || 'Varlık Transferi'}`, method: from === 'cash' ? 'cash' : 'card', cardBank: from === 'cash' ? null : from, category: 'Transfer' 
        };
        const income = { 
            date: new Date().toISOString().split('T')[0], type: 'income', amount: Number(amount), 
            desc: `Transfer Girişi: ${desc || 'Varlık Transferi'}`, method: to === 'cash' ? 'cash' : 'card', cardBank: to === 'cash' ? null : to, subMethod: 'Transfer' 
        };

        batch.set(doc(ref), expense);
        batch.set(doc(ref), income);
        await batch.commit();
        
        // 👇 Alert yerine InfoModal
        setInfoModal({ isOpen: true, type: 'success', title: 'Transfer Başarılı', message: `${formatCurrency(amount)} ₺ başarıyla transfer edildi.` });
        
        setTransferData({ from: 'ziraat', to: 'cash', amount: '', desc: '' });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
             
             <ConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="İşlemi Sil" 
                message="Bu finansal kaydı silmek istediğinize emin misiniz?"
             />
             
             {/* 👇 INFO MODAL EKLENDİ */}
             <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                type={infoModal.type}
                title={infoModal.title}
                message={infoModal.message}
             />

             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Yeni İşlem Gir</h2>
                <div className="flex items-center gap-2"><span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{newTrans.date}</span></div>
             </div>
             
             {/* KISAYOLLAR */}
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
                <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> Hızlı İşlemler</h4>{isPatron && (<button onClick={() => setIsEditingShortcuts(!isEditingShortcuts)} className={`text-xs p-1.5 rounded transition-colors ${isEditingShortcuts ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Düzenle"><Settings size={14}/></button>)}</div>
                {isPatron && isEditingShortcuts && (
                  <div className="bg-slate-900 p-4 rounded-xl space-y-3">
                    <h5 className="font-bold text-indigo-400 text-sm">Yeni Kısayol Ekle</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Etiket" value={newShortcut.label} onChange={(e) => setNewShortcut({...newShortcut, label: e.target.value})} className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm col-span-1"/>
                        <select value={newShortcut.type} onChange={(e) => setNewShortcut({...newShortcut, type: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none">{['income', 'expense'].map(t => <option key={t} value={t}>{t === 'income' ? 'Gelir' : 'Gider'}</option>)}</select>
                        <input type="text" placeholder="Açıklama" value={newShortcut.desc} onChange={(e) => setNewShortcut({...newShortcut, desc: e.target.value})} className="bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm col-span-2"/>
                        <button onClick={handleAddQuickAction} className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded col-span-1">Kaydet</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{quickActions && quickActions.map((action) => (<div key={action.id} className="relative group shrink-0"><button onClick={() => { if(!isEditingShortcuts) applyQuickAction(action); }} className={`flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 transition-all active:scale-95 ${isEditingShortcuts ? 'border-dashed border-blue-500/50' : ''}`}><span>{action.icon}</span> {action.label}</button>{isEditingShortcuts && (<button onClick={() => handleDeleteQuickAction(action.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-10"><X size={12}/></button>)}</div>))}</div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SOL KOLON: Formlar */}
                <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} h-fit shadow-xl`}>
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
                        <button onClick={() => setNewTrans({...newTrans, type: 'income'})} className={`py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 ${newTrans.type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><PlusCircle size={16}/> GELİR</button>
                        <button onClick={() => setNewTrans({...newTrans, type: 'expense'})} className={`py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 ${newTrans.type === 'expense' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><MinusCircle size={16}/> GİDER</button>
                        <button onClick={() => setNewTrans({...newTrans, type: 'transfer'})} className={`py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 ${newTrans.type === 'transfer' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}><RefreshCw size={16}/> TRANSFER</button>
                    </div>

                    {/* TRANSFER FORMU */}
                    {newTrans.type === 'transfer' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 mb-4">
                                <h4 className="font-bold text-blue-400 text-sm mb-3 flex items-center gap-2"><RefreshCw size={16}/> Hızlı Varlık Transferi</h4>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Nereden</label>
                                        <select value={transferData.from} onChange={(e) => setTransferData({...transferData, from: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"><option value="ziraat">Ziraat Bankası</option><option value="halk">Halk Bankası</option><option value="iban">Diğer IBAN</option><option value="cash">Nakit Kasa</option></select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Nereye</label>
                                        <select value={transferData.to} onChange={(e) => setTransferData({...transferData, to: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm"><option value="cash">Nakit Kasa</option><option value="ziraat">Ziraat Bankası</option><option value="halk">Halk Bankası</option><option value="iban">Diğer IBAN</option></select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Tutar & Açıklama</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Tutar" value={transferData.amount} onChange={(e) => setTransferData({...transferData, amount: e.target.value})} className="w-1/3 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"/>
                                        <input type="text" placeholder="Açıklama..." value={transferData.desc} onChange={(e) => setTransferData({...transferData, desc: e.target.value})} className="w-2/3 bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"/>
                                    </div>
                                </div>
                                <button onClick={handleAssetTransfer} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">Transferi Tamamla</button>
                            </div>
                        </div>
                    ) : (
                        /* GELİR/GİDER FORMU */
                        <>
                        {newTrans.type === 'income' && (
                            <div className="mb-6 space-y-4 bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ödeme Yöntemi</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button onClick={() => setNewTrans({...newTrans, method: 'mix', cardBank: null})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newTrans.method === 'mix' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}><FileText size={24}/><span className="font-bold text-sm">Z RAPORU</span></button>
                                    <button onClick={() => setNewTrans({...newTrans, method: 'card', cardBank: newTrans.cardBank || 'ziraat'})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newTrans.method === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}><CreditCard size={24}/><span className="font-bold text-sm">KART</span></button>
                                    <button onClick={() => setNewTrans({...newTrans, method: 'cash', cardBank: null})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newTrans.method === 'cash' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600'}`}><Banknote size={24}/><span className="font-bold text-sm">NAKİT</span></button>
                                </div>
                                {newTrans.method === 'card' && (<div className="animate-in slide-in-from-top-2 pt-2"><BankSelector newTrans={newTrans} setNewTrans={setNewTrans}/></div>)}
                            </div>
                        )}
                        
                        {newTrans.type === 'expense' && (
                            <div className="mb-6 space-y-4 bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-2">Gider Türü</label><div className="relative"><select value={newTrans.category} onChange={(e) => setNewTrans({...newTrans, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-red-500 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"><option>Günlük</option><option>Stok (Fatura)</option><option>Personel</option><option>Fatura/Kira</option><option>Yatırım</option><option>Tedarikçi</option></select><ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16}/></div></div>
                                
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-2">Ödeme Kaynağı</label>
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <button onClick={() => setNewTrans({...newTrans, method: 'cash', cardBank: null})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newTrans.method === 'cash' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-slate-700 bg-slate-800 text-slate-500'}`}><Banknote size={24}/><span className="font-bold text-sm">NAKİT KASA</span></button>
                                        <button onClick={() => setNewTrans({...newTrans, method: 'card', cardBank: newTrans.cardBank || 'ziraat'})} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newTrans.method === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-500'}`}><CreditCard size={24}/><span className="font-bold text-sm">BANKA / KART</span></button>
                                    </div>
                                    {newTrans.method === 'card' && (<div className="animate-in slide-in-from-top-2 pt-1"><BankSelector newTrans={newTrans} setNewTrans={setNewTrans}/></div>)}
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="col-span-2 sm:col-span-1"><label className="text-xs text-slate-500 font-bold block mb-1">Tarih</label><input type="date" value={newTrans.date} onChange={(e) => setNewTrans({...newTrans, date: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"/></div><div className="col-span-2 sm:col-span-1 flex items-end"><button onClick={() => {const d = new Date(); d.setDate(d.getDate()-1); setNewTrans({...newTrans, date: d.toISOString().split('T')[0]})}} className="w-full mb-[1px] py-3 text-xs text-blue-400 hover:text-white hover:bg-blue-600/20 font-bold flex items-center justify-center gap-2 bg-blue-900/10 rounded-xl border border-blue-500/20 transition-all"><History size={14}/> Dün Olarak Ayarla</button></div></div><div><label className="text-xs text-slate-500 font-bold block mb-1">Tutar (TL)</label><div className="relative group"><input type="number" placeholder="0.00" value={newTrans.amount} onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pl-4 text-white text-2xl font-bold outline-none focus:border-indigo-500 transition-colors group-hover:border-slate-600"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xl">₺</span></div></div><div><label className="text-xs text-slate-500 font-bold block mb-1">Açıklama</label><input type="text" placeholder="İşlem açıklaması giriniz..." value={newTrans.desc} onChange={(e) => setNewTrans({...newTrans, desc: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"/></div><button onClick={handleAddTransaction} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${newTrans.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'}`}>{newTrans.type === 'income' ? <PlusCircle size={20}/> : <MinusCircle size={20}/>}{newTrans.type === 'income' ? 'GELİRİ KAYDET' : 'GİDERİ KAYDET'}</button></div>
                        </>
                    )}
                </div>

                {/* SAĞ KOLON: Liste */}
                <div className={`${THEME.card} p-6 rounded-2xl border ${THEME.border} flex flex-col h-[600px]`}>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4"><h3 className="font-bold text-white flex items-center gap-2"><History size={18} className="text-indigo-400"/> İşlem Geçmişi</h3><div className="flex gap-2"><button className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Filter size={16}/></button></div></div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {transactions.map((t) => (<div key={t.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-600 transition-all group"><div className="flex items-center gap-3 overflow-hidden"><div className={`p-2.5 rounded-lg shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}</div><div className="min-w-0"><div className="font-bold text-sm text-slate-200 truncate">{t.desc}</div><div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5"><span>{formatDate(t.date)}</span><span className="w-1 h-1 rounded-full bg-slate-600"></span><span className="uppercase tracking-wider">{getSubMethod(t)}</span></div></div></div><div className="flex items-center gap-4 shrink-0 pl-2"><span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span><button onClick={() => setDeleteId(t.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded"><Trash2 size={16}/></button></div></div>))}
                    </div>
                </div>
             </div>
          </div>
    );
};

export default Transactions;