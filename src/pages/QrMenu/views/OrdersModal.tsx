import React from 'react';
import { X, Package, Loader2 } from 'lucide-react';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: any[];
    isLoadingOrders: boolean;
    t: (key: string) => string;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, orders, isLoadingOrders, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Siparişlerim</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {isLoadingOrders ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#432818]/40" size={32} /></div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={40} className="mx-auto text-[#432818]/10 mb-3" />
                            <p className="text-[#432818]/40 font-bold text-sm">Henüz sipariş vermediniz.</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white p-5 rounded-2xl border border-[#432818]/5 shadow-sm">
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#432818]/5">
                                    <div>
                                        <span className="text-[10px] font-bold text-[#432818]/40 block mb-1">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>
                                            {order.status === 'completed' ? t('status_completed') :
                                                order.status === 'cancelled' ? t('status_cancelled') : t('status_preparing')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-[#432818] text-lg tabular-nums">{order.totalAmount || order.total} ₺</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-xs text-[#432818]/70">
                                            <span className="font-medium">
                                                <span className="font-bold text-[#432818] mr-2">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            <span className="font-bold text-[#432818]/40">{item.price * item.quantity} ₺</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersModal;