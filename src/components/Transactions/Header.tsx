import React from 'react';
import { MessageCircle, FileText } from 'lucide-react';

interface HeaderProps {
    exportToPDF: () => void;
    exportToExcel: () => void;
    sendWhatsAppSummary: () => void;
}

const Header: React.FC<HeaderProps> = ({ exportToPDF, exportToExcel, sendWhatsAppSummary }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-5 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight">İşlem Yönetimi</h2>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">
                    {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={sendWhatsAppSummary} title="WhatsApp Özet" className="flex-1 md:flex-none p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                    <MessageCircle size={20} />
                </button>
                <button onClick={exportToExcel} title="Excel İndir" className="flex-1 md:flex-none p-3 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded-2xl hover:bg-cyan-600 hover:text-white transition-all font-bold">
                    📊
                </button>
                <button onClick={exportToPDF} title="PDF Rapor" className="flex-1 md:flex-none p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                    <FileText size={20} />
                </button>
            </div>
        </div>
    );
};

export default Header;
