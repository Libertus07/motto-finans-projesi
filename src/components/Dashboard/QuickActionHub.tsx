import React from 'react';
import {
    PlusCircle,
    ClipboardList,
    BarChart3,
    Settings,
    Calculator,
    PackageSearch
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const QuickActionHub: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        { icon: <PlusCircle size={20} />, label: "Hızlı Satış", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", path: "/pos/pos" },
        { icon: <ClipboardList size={20} />, label: "Gider Ekle", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", path: "/pos/transactions" },
        { icon: <PackageSearch size={20} />, label: "Stok Sayımı", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", path: "/pos/inventory" },
        { icon: <BarChart3 size={20} />, label: "Rapor Al", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", path: "/pos/stats" },
        { icon: <Calculator size={20} />, label: "Kasa İşlemi", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", path: "/pos/investments" },
        { icon: <Settings size={20} />, label: "Ayarlar", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", path: "/pos/settings" },
    ];

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-indigo-500/10 shadow-xl w-full">
            <div className="flex items-center gap-3 mb-6">
                <h4 className="text-sm font-black text-white uppercase tracking-widest pl-2">Hızlı İşlemler</h4>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all duration-300 hover:scale-105 active:scale-95 ${action.bg} ${action.border} hover:border-white/20 shadow-lg hover:shadow-white/5`}
                    >
                        <div className={`${action.color} group-hover:scale-110 transition-transform duration-300`}>
                            {action.icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight group-hover:text-white transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActionHub;
