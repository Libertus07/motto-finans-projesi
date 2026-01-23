import React from 'react';
import { X, Calendar, Clock, Receipt, ChefHat } from 'lucide-react';

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
    t: (key: string) => string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, t }) => {
    if (!order) return null;

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            'completed': t('status_completed'),
            'cancelled': t('status_cancelled'),
            'preparing': t('status_preparing'),
            'pending': t('status_pending'),
            'served': t('status_served')
        };
        return map[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-100';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
            case 'preparing': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-[#432818] font-cinzel">{t('order_details')}</h2>
                        <p className="text-xs text-[#432818]/60">#{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#432818]/5 rounded-full transition-colors">
                        <X size={20} className="text-[#432818]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Status & Date */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-[#432818]/60">
                                <Calendar size={14} />
                                <span>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#432818]/60">
                                <Clock size={14} />
                                <span>{new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-sm font-bold text-[#432818]/40 uppercase tracking-wider font-cinzel flex items-center gap-2">
                            <ChefHat size={14} /> {t('products')}
                        </h3>
                        <div className="bg-white rounded-2xl border border-[#432818]/5 divide-y divide-[#432818]/5">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-[#432818]/5 rounded flex items-center justify-center text-xs font-bold text-[#432818]">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#432818] text-sm">{item.name}</div>
                                                {item.note && (
                                                    <div className="text-xs text-[#432818]/60 mt-0.5 italic">"{item.note}"</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-bold text-[#432818] text-sm">
                                            {item.price * item.quantity} ₺
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#432818]/5 rounded-2xl p-4 space-y-2">
                         <div className="flex justify-between items-center text-sm text-[#432818]/60">
                            <span>{t('subtotal')}</span>
                            <span>{order.totalAmount || order.total} ₺</span>
                        </div>
                        <div className="border-t border-[#432818]/10 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[#432818] font-cinzel flex items-center gap-2">
                                <Receipt size={16} /> {t('total')}
                            </span>
                            <span className="text-xl font-black text-[#432818] font-cinzel">
                                {order.totalAmount || order.total} ₺
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;