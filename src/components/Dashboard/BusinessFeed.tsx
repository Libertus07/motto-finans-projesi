import React from 'react';
import { DollarSign, Gift, Clock, ArrowRight } from 'lucide-react';

interface FeedItem {
    id: string;
    type: string;
    message: string;
    time: string;
    icon: string;
}

interface BusinessFeedProps {
    feed: FeedItem[];
}

const BusinessFeed: React.FC<BusinessFeedProps> = ({ feed }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest">Canlı Akış</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Son İşlemler</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-400">CANLI</span>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
                {feed.length > 0 ? (
                    feed.map((item) => (
                        <div key={item.id} className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 border border-transparent hover:border-slate-700/50">
                            <div className={`p-2 rounded-xl border ${item.type === 'income'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                }`}>
                                {item.icon === 'DollarSign' ? <DollarSign size={16} /> : <Gift size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-200 line-clamp-2">{item.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={10} className="text-slate-500" />
                                    <span className="text-[10px] text-slate-500 font-medium">{item.time}</span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors self-center opacity-0 group-hover:opacity-100" />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                        <Clock size={32} className="mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">Akış Bekleniyor</p>
                    </div>
                )}
            </div>

            <button className="mt-4 w-full py-3 rounded-2xl bg-slate-800/50 border border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-800 hover:text-white transition-all">
                Tüm Geçmişi Görüntüle
            </button>
        </div>
    );
};

export default BusinessFeed;
