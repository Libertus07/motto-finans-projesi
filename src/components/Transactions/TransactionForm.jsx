import React from 'react';
import { PlusCircle, MinusCircle, RefreshCw, FileText, CreditCard, Banknote, ChevronDown } from 'lucide-react';
import BankSelector from './BankSelector';
import { THEME } from '../../utils/constants';

const TransactionForm = ({
    newTrans,
    setNewTrans,
    transferData,
    setTransferData,
    handleAddTransaction,
    handleAssetTransfer
}) => {
    return (
        <div className={`${THEME.card} p-6 rounded-[2.5rem] border ${THEME.border} h-fit shadow-2xl bg-slate-900/40 relative overflow-hidden`}>
            {/* Üst Tip Seçici */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
                <button
                    onClick={() => setNewTrans({...newTrans, type: 'income'})}
                    className={`py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 ${
                        newTrans.type === 'income'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <PlusCircle size={14} /> GELİR
                </button>
                <button
                    onClick={() => setNewTrans({...newTrans, type: 'expense'})}
                    className={`py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 ${
                        newTrans.type === 'expense'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <MinusCircle size={14} /> GİDER
                </button>
                <button
                    onClick={() => setNewTrans({...newTrans, type: 'transfer'})}
                    className={`py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 ${
                        newTrans.type === 'transfer'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <RefreshCw size={14} /> TRANSFER
                </button>
            </div>

            {/* 1. GELİR VE GİDER FORMU */}
            {newTrans.type !== 'transfer' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Ödeme / Kaynak Seçimi (Nakit-Kart-Mix) */}
                    <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800/50">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block ml-1">
                            Ödeme Yapısı
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Z Raporu (Sadece Gelirde) */}
                            {newTrans.type === 'income' && (
                                <button
                                    onClick={() => setNewTrans({...newTrans, method: 'mix', cardBank: null})}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                        newTrans.method === 'mix'
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                            : 'border-slate-800 bg-slate-900/50 text-slate-600'
                                    } hover:border-slate-700`}
                                >
                                    <FileText size={24} /> <span className="font-bold text-[10px]">Z-RAPORU </span>
                                </button>
                            )}
                            <button
                                onClick={() => setNewTrans({...newTrans, method: 'card', cardBank: newTrans.cardBank || 'ziraat'})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    newTrans.method === 'card'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                        : 'border-slate-800 bg-slate-900/50 text-slate-600'
                                } hover:border-slate-700`}
                            >
                                <CreditCard size={24} /> <span className="font-bold text-[10px]">BANKA/KART</span>
                            </button>
                            <button
                                onClick={() => setNewTrans({...newTrans, method: 'cash', cardBank: null})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    newTrans.method === 'cash'
                                        ? (newTrans.type === 'income' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-red-500 bg-red-500/10 text-red-400')
                                        : 'border-slate-800 bg-slate-900/50 text-slate-600'
                                } hover:border-slate-700`}
                            >
                                <Banknote size={24} /> <span className="font-bold text-[10px]">NAKİT</span>
                            </button>
                        </div>
                        {/* Dinamik Banka Seçici */}
                        {newTrans.method === 'card' && (
                            <div className="mt-4 pt-4 border-t border-slate-700/30">
                                <BankSelector newTrans={newTrans} setNewTrans={setNewTrans} />
                            </div>
                        )}
                    </div>

                    {/* Gider Kategorisi (Sadece Giderdeyse) */}
                    {newTrans.type === 'expense' && (
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-2">
                                Gider Türü
                            </label>
                            <select
                                value={newTrans.category}
                                onChange={(e) => setNewTrans({...newTrans, category: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option>Günlük</option>
                                <option>Stok (Fatura)</option>
                                <option>Personel</option>
                                <option>Fatura/Kira</option>
                                <option>Yatırım</option>
                                <option>Tedarikçi</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-10 text-slate-500 pointer-events-none" size={18} />
                        </div>
                    )}

                    {/* Tutar Girişi (Büyük ve Premium) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-2">
                                İşlem Tarihi
                            </label>
                            <input
                                type="date"
                                value={newTrans.date}
                                onChange={(e) => setNewTrans({...newTrans, date: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="col-span-1 flex items-end">
                            <button
                                onClick={() => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - 1);
                                    setNewTrans({...newTrans, date: d.toISOString().split('T')[0]});
                                }}
                                className="w-full py-3 text-[9px] font-black text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"
                            >
                                DÜN OLARAK AYARLA
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-2">
                            Net Tutar
                        </label>
                        <div className="relative group">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newTrans.amount}
                                onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-3xl font-black text-white outline-none focus:border-indigo-500 transition-all group-hover:border-slate-700"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl uppercase">TL</span>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Açıklama veya Not giriniz..."
                        value={newTrans.desc}
                        onChange={(e) => setNewTrans({...newTrans, desc: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-medium outline-none focus:border-indigo-500"
                    />

                    <button
                        onClick={handleAddTransaction}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
                            newTrans.type === 'income'
                                ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                                : 'bg-red-600 text-white shadow-red-900/20'
                        }`}
                    >
                        {newTrans.type === 'income' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                        {newTrans.type === 'income' ? 'KASAYA EKLE' : 'GİDERİ KAYDET'}
                    </button>
                </div>
            ) : (
                /* 2. TRANSFER FORMU */
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-blue-600/5 p-6 rounded-[2rem] border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-600/20 rounded-xl text-blue-400">
                                <RefreshCw size={18} />
                            </div>
                            <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest">
                                Hızlı Varlık Transferi
                            </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block ml-2">
                                    Çıkış Hesabı
                                </label>
                                <select
                                    value={transferData.from}
                                    onChange={(e) => setTransferData({...transferData, from: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-bold outline-none [cite: 56]"
                                >
                                    <option value="ziraat">Ziraat Bankası</option>
                                    <option value="halk">Halk Bankası</option>
                                    <option value="iban">Diğer IBAN</option>
                                    <option value="cash">Nakit Kasa</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block ml-2">
                                    Giriş Hesabı
                                </label>
                                <select
                                    value={transferData.to}
                                    onChange={(e) => setTransferData({...transferData, to: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-bold outline-none [cite: 61]"
                                >
                                    <option value="cash">Nakit Kasa</option>
                                    <option value="ziraat">Ziraat Bankası</option>
                                    <option value="halk">Halk Bankası</option>
                                    <option value="iban">Diğer IBAN</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block ml-2">
                                    Transfer Tutarı
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={transferData.amount}
                                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm font-black [cite: 68]"
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block ml-2">
                                    Not
                                </label>
                                <input
                                    type="text"
                                    placeholder="İşlem detayı..."
                                    value={transferData.desc}
                                    onChange={(e) => setTransferData({...transferData, desc: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs [cite: 71]"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAssetTransfer}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.5rem] shadow-lg shadow-blue-900/30 transition-all active:scale-95 uppercase text-xs tracking-widest [cite: 74]"
                        >
                            Transferi Tamamla
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-600 text-center uppercase font-bold px-10">
                        Transfer işlemi seçilen hesaplar arasında otomatik gelir/gider kaydı oluşturur.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TransactionForm;
