import React from 'react';
import { Lock } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const AssetCard = ({ title, amount, icon: Icon, colorClass, bgClass, ratio, subLabel }) => {
    const amountStr = formatCurrency(amount);
    const charCount = amountStr.length;
    let fontSizeClass = "text-xl md:text-2xl";
    if (charCount > 16) fontSizeClass = "text-xs md:text-sm"; else if (charCount > 13) fontSizeClass = "text-sm md:text-base"; else if (charCount > 10) fontSizeClass = "text-base md:text-lg"; else if (charCount > 8) fontSizeClass = "text-lg md:text-xl";
    return (
        <div className={`relative overflow-hidden rounded-2xl p-4 md:p-5 border transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between h-[160px] md:h-[180px] group ${bgClass} shrink-0 w-[85vw] md:w-auto snap-center`}>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-all"></div>
            <div className="flex justify-between items-start z-10 mb-2">
                <div className={`p-2 md:p-2.5 rounded-xl ${colorClass} bg-white/10 backdrop-blur-md shadow-inner`}><Icon size={18} className="md:w-5 md:h-5" /></div>
                <div className="flex items-center gap-1"><Lock size={10} className="text-slate-400/50"/><div className="w-8 h-5 rounded border border-white/20 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center"><div className="w-4 h-3 bg-yellow-500/20 rounded-sm"></div></div></div>
            </div>
            <div className="z-10 flex-1 flex flex-col justify-center"><p className="text-[10px] md:text-xs text-slate-300 font-medium uppercase tracking-wider opacity-80 mb-1">{title}</p><h4 className={`${fontSizeClass} font-black text-white tracking-tighter truncate`} title={amountStr + ' ₺'}>{amountStr} ₺</h4></div>
            <div className="z-10 mt-auto pt-2"><div className="flex justify-between items-center mb-1"><span className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase">{subLabel || 'Varlık Payı'}</span><span className="text-[8px] md:text-[9px] text-white font-bold">% {ratio.toFixed(1)}</span></div><div className="w-full h-1.5 bg-slate-900/40 rounded-full overflow-hidden"><div className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{width: `${ratio}%`}}></div></div></div>
        </div>
    );
};

export default AssetCard;
