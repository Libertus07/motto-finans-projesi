import React, { Dispatch, SetStateAction } from 'react';
import { CalendarClock, User, Clock, FileText, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Table } from '../../types';

interface ReservationForm {
    name: string;
    time: string;
    note: string;
}

interface ReservationModalProps {
    isRezModalOpen: boolean;
    setIsRezModalOpen: Dispatch<SetStateAction<boolean>>;
    selectedTable: Table | null;
    setSelectedTable: Dispatch<SetStateAction<Table | null>>;
    rezForm: ReservationForm;
    setRezForm: Dispatch<SetStateAction<ReservationForm>>;
    handleSaveReservation: () => void;
    processing: boolean;
    isDarkMode: boolean;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
    isRezModalOpen,
    setIsRezModalOpen,
    selectedTable,
    setSelectedTable,
    rezForm,
    setRezForm,
    handleSaveReservation,
    processing,
    isDarkMode
}) => {
    if (!isRezModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 ${isDarkMode ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
                <div className={`relative p-6 pb-0 flex flex-col items-center text-center z-10`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 ${isDarkMode ? 'bg-[#2e1a47] text-purple-400 ring-1 ring-purple-500/50' : 'bg-purple-100 text-purple-600'}`}><CalendarClock size={32} /></div>
                    <h3 className={`text-2xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Rezervasyon</h3>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{selectedTable?.name || 'Masa Seçilmedi'}</p>
                    <button onClick={() => { setIsRezModalOpen(false); setSelectedTable(null); }} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Müşteri Adı</label>
                        <div className={`relative group flex items-center rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><User size={18} /></div><input type="text" value={rezForm.name} onChange={e => setRezForm({ ...rezForm, name: e.target.value })} placeholder="Örn: Ahmet Yılmaz" className={`w-full bg-transparent py-3.5 px-3 outline-none text-sm font-medium ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`} /></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rezervasyon Saati</label>
                        <div className={`relative group flex items-center rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><Clock size={18} /></div><input type="time" value={rezForm.time} onChange={e => setRezForm({ ...rezForm, time: e.target.value })} className={`w-full bg-transparent py-3.5 px-3 outline-none text-sm font-medium appearance-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`} /></div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Not (Opsiyonel)</label>
                        <div className={`relative group flex items-start rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 pt-3.5 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><FileText size={18} /></div><textarea rows={2} value={rezForm.note} onChange={e => setRezForm({ ...rezForm, note: e.target.value })} placeholder="Özel istekler..." className={`w-full bg-transparent py-3 px-3 outline-none text-sm font-medium resize-none ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`} /></div>
                    </div>
                </div>
                <div className={`p-6 pt-2 flex gap-3 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <button onClick={() => { setIsRezModalOpen(false); setSelectedTable(null); }} className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'}`}>Vazgeç</button>
                    <button onClick={handleSaveReservation} disabled={processing} className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500`}>{processing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}{processing ? 'Kaydediliyor...' : 'Kaydet'}</button>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;
