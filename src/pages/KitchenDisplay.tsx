import React, { useMemo, useState, useEffect } from 'react';
import { useTables } from '../hooks/pos/useTables';
import { db, appId } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { SHOP_ID } from '../utils/constants';
import { Clock, CheckCircle2, ChefHat, Play, Flame, UtensilsCrossed, Zap, ArrowRight, XCircle } from 'lucide-react';
import { OrderItem } from '../types';

export default function KitchenDisplay() {
    const fakeUser = useMemo(() => ({ uid: 'kitchen', email: null, isAnonymous: true }), []);
    const { tables, loading } = useTables(fakeUser);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Flatten all orders into a single list with table info
    const allOrders = useMemo(() => {
        const orders: any[] = [];
        tables.forEach(table => {
            table.orders.forEach(order => {
                // Include served orders for the "Completed" column, but maybe limit by time in future
                if (order.status !== 'cancelled') {
                    orders.push({
                        ...order,
                        tableId: table.id,
                        tableName: table.name,
                        zone: table.zone
                    });
                }
            });
        });
        return orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [tables]);

    const columns = useMemo(() => {
        return {
            pending: allOrders.filter(o => o.status === 'pending'),
            preparing: allOrders.filter(o => o.status === 'preparing'),
            served: allOrders.filter(o => o.status === 'served').reverse().slice(0, 10) // Show last 10 completed
        };
    }, [allOrders]);

    const handleUpdateActiveStatus = async (tableId: string, orderId: string, nextStatus: 'preparing' | 'served') => {
        try {
            const table = tables.find(t => t.id === tableId);
            if (!table) return;

            const updatedOrders = table.orders.map(o =>
                o.id === orderId ? { ...o, status: nextStatus } : o
            );

            // Check table status logic (if all served, maybe change table status, but sticking to order updates for now)
            const allServed = updatedOrders.every(o => o.status === 'served' || o.status === 'cancelled');
            const newTableStatus = allServed ? 'occupied' : 'ordered';

            await updateDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', tableId), {
                orders: updatedOrders,
                status: newTableStatus
            });
        } catch (error) {
            console.error("Error updates:", error);
        }
    };

    const getElapsedTime = (dateStr: string) => {
        const diff = currentTime.getTime() - new Date(dateStr).getTime();
        return Math.floor(diff / 60000);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#D4AF37] font-cinzel">
            <div className="animate-spin mr-3"><ChefHat /></div> MUTFAK YÜKLENIYOR...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#121212] text-[#FDFBF7] font-sans flex flex-col overflow-hidden">
            {/* --- HEADER --- */}
            <div className="h-20 bg-[#1a1a1a] border-b border-[#D4AF37]/20 flex items-center justify-between px-6 shadow-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37] rounded-lg flex items-center justify-center text-[#1a1a1a] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <ChefHat size={32} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#D4AF37] tracking-wider font-cinzel leading-none">CHEF'S TABLE</h1>
                        <p className="text-[#FDFBF7]/40 text-xs font-bold tracking-[0.2em] mt-1">MUTFAK YÖNETİM SİSTEMİ</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-[#FDFBF7] leading-none">{columns.pending.length}</span>
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">Bekleyen</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-[#FDFBF7] leading-none">{columns.preparing.length}</span>
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Hazırlanan</span>
                    </div>
                    <div className="h-10 w-px bg-[#FFFFFF]/10"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="text-[#D4AF37]" size={20} />
                        <span className="text-3xl font-mono font-bold text-[#FDFBF7] tracking-widest">
                            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- BOARD CONTENT --- */}
            <div className="flex-1 p-6 overflow-hidden flex gap-6">

                {/* COLUMN 1: BEKLEYEN (PENDING) */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a]/50 rounded-2xl border border-[#FFFFFF]/5 overflow-hidden backdrop-blur-sm">
                    <div className="p-4 bg-[#D4AF37]/10 border-b border-[#D4AF37]/10 flex justify-between items-center">
                        <h2 className="text-[#D4AF37] font-black font-cinzel tracking-wider flex items-center gap-2">
                            <UtensilsCrossed size={20} /> BEKLEYENLER
                        </h2>
                        <span className="bg-[#D4AF37] text-[#1a1a1a] text-xs font-bold px-2 py-0.5 rounded shadow-sm">{columns.pending.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {columns.pending.map((order) => {
                            const elapsed = getElapsedTime(order.createdAt);
                            const isCritical = elapsed > 15;
                            return (
                                <div key={order.id} className={`bg-[#252525] rounded-xl p-4 border-l-4 shadow-lg group hover:bg-[#2a2a2a] transition-colors relative overflow-hidden ${isCritical ? 'border-red-500 animate-pulse-slow' : 'border-[#D4AF37]'}`}>
                                    {isCritical && <div className="absolute top-0 right-0 p-1 bg-red-500/20 rounded-bl-lg"><Flame size={14} className="text-red-500" /></div>}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-[#FDFBF7]/40 uppercase tracking-wider block mb-1">{order.zone}</span>
                                            <h3 className="text-lg font-black text-[#D4AF37]">{order.tableName}</h3>
                                        </div>
                                        <div className={`text-xs font-mono px-2 py-1 rounded bg-[#1a1a1a] border border-[#FFFFFF]/10 ${isCritical ? 'text-red-400' : 'text-[#FDFBF7]/60'}`}>
                                            {elapsed} dk
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xl font-bold text-[#FDFBF7]">{order.quantity}x {order.name}</div>
                                            {order.note && <div className="text-sm text-red-400 mt-1 italic opacity-80">"{order.note}"</div>}
                                        </div>
                                        <button
                                            onClick={() => handleUpdateActiveStatus(order.tableId, order.id, 'preparing')}
                                            className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#1a1a1a] transition-all shadow-lg active:scale-95"
                                        >
                                            <Play size={20} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 2: HAZIRLANIYOR (PREPARING) */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a]/50 rounded-2xl border border-[#FFFFFF]/5 overflow-hidden backdrop-blur-sm">
                    <div className="p-4 bg-orange-500/10 border-b border-orange-500/10 flex justify-between items-center">
                        <h2 className="text-orange-500 font-black font-cinzel tracking-wider flex items-center gap-2">
                            <Flame size={20} /> HAZIRLANIYOR
                        </h2>
                        <span className="bg-orange-500 text-[#1a1a1a] text-xs font-bold px-2 py-0.5 rounded shadow-sm">{columns.preparing.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {columns.preparing.map((order) => {
                            const elapsed = getElapsedTime(order.createdAt);
                            return (
                                <div key={order.id} className="bg-[#252525] rounded-xl p-4 border-l-4 border-orange-500 shadow-lg relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none"></div>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div>
                                            <span className="text-xs font-bold text-[#FDFBF7]/40 uppercase tracking-wider block mb-1">{order.zone}</span>
                                            <h3 className="text-lg font-black text-orange-500">{order.tableName}</h3>
                                        </div>
                                        <div className="text-xs font-mono px-2 py-1 rounded bg-[#1a1a1a] border border-[#FFFFFF]/10 text-orange-400">
                                            {elapsed} dk
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <div className="text-xl font-bold text-[#FDFBF7]">{order.quantity}x {order.name}</div>
                                            {order.note && <div className="text-sm text-red-400 mt-1 italic opacity-80">"{order.note}"</div>}
                                        </div>
                                        <button
                                            onClick={() => handleUpdateActiveStatus(order.tableId, order.id, 'served')}
                                            className="w-10 h-10 rounded-full bg-orange-500 text-[#1a1a1a] flex items-center justify-center hover:bg-orange-400 transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
                                        >
                                            <ArrowRight size={24} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 3: TAMAMLANAN (SERVED) */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a]/50 rounded-2xl border border-[#FFFFFF]/5 overflow-hidden backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="p-4 bg-green-500/10 border-b border-green-500/10 flex justify-between items-center">
                        <h2 className="text-green-500 font-black font-cinzel tracking-wider flex items-center gap-2">
                            <CheckCircle2 size={20} /> TAMAMLANANLAR
                        </h2>
                        <span className="text-[#FDFBF7]/20 text-[10px] font-bold">SON 10</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {columns.served.map((order) => (
                            <div key={order.id} className="bg-[#252525] rounded-xl p-3 border-l-4 border-green-500/50 shadow-sm flex justify-between items-center grayscale hover:grayscale-0 transition-all">
                                <div>
                                    <h3 className="text-sm font-black text-[#FDFBF7]/60 block">{order.tableName}</h3>
                                    <span className="text-lg font-bold text-[#FDFBF7]/40 line-through">{order.quantity}x {order.name}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
