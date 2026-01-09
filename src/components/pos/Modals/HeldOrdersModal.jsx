// components/pos/Modals/HeldOrdersModal.jsx
import React from 'react';
import { X, PauseCircle, PlayCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

const HeldOrdersModal = ({ 
    isOpen, 
    onClose, 
    heldOrders,
    onRestore
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[400px] h-[500px] bg-[#1e2330] rounded-3xl shadow-2xl border border-white/10 p-5 flex flex-col">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <PauseCircle size={20} className="text-yellow-400"/> 
                        Bekleyen Masalar
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* BEKLEYEN SİPARİŞLER LİSTESİ */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                    {heldOrders.length === 0 ? (
                        <p className="text-slate-500 text-center mt-10">
                            Bekleyen sipariş yok.
                        </p>
                    ) : (
                        heldOrders.map(order => (
                            <div 
                                key={order.id} 
                                className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2 group hover:bg-slate-800 transition-colors"
                            >
                                {/* ÜST SATIR - ZAMAN & TUTAR */}
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded-md">
                                        {order.time}
                                    </span>
                                    <span className="text-white font-bold">
                                        {formatCurrency(order.total)} ₺
                                    </span>
                                </div>

                                {/* ÜRÜN LİSTESİ */}
                                <div className="text-xs text-slate-400 line-clamp-1">
                                    {order.items.map(item => 
                                        `${item.quantity}x ${item.name}`
                                    ).join(', ')}
                                </div>

                                {/* SEPETE ÇEK BUTONU */}
                                <button 
                                    onClick={() => onRestore(order.id)}
                                    className="w-full mt-2 py-2 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-500 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <PlayCircle size={14}/> 
                                    SEPETE ÇEK
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeldOrdersModal;