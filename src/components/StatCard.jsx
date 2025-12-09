import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
// Daha önce oluşturduğumuz sabitleri çağırıyoruz
import { THEME, COLOR_MAP } from '../utils/constants'; 

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => {
  // Renk haritasından doğru rengi bul
  const c = COLOR_MAP[color] || COLOR_MAP.indigo; 

  return (
    <div className={`${THEME.card} p-5 rounded-2xl border ${THEME.border} relative overflow-hidden group ${c.hoverBorder} transition-all duration-300`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${c.bg}/10 blur-2xl group-hover:${c.bg}/20 transition-colors`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${c.bg}/10 ${c.text}`}>
          <Icon size={20} />
        </div>
      </div>
      {subValue && (
        <div className="flex items-center gap-2 text-xs relative z-10">
          <span className={`font-bold flex items-center ${trend === 'down' ? 'text-red-400' : 'text-slate-300'}`}>
             {trend === 'up' && <ArrowUpRight size={12} className="mr-1 text-emerald-400"/>}
             {trend === 'down' && <ArrowDownRight size={12} className="mr-1 text-red-400"/>}
             {subValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;