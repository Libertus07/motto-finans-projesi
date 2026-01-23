import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';

interface OrdersViewProps {
    onBack: () => void;
}

interface Order {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    note: string;
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    createdAt: string;
    tableId?: string;
}

const OrdersView: React.FC<OrdersViewProps> = ({ onBack }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.isAnonymous) {
            setLoading(false);
            return;
        }

        // Listen to orders for this customer
        const ordersRef = collection(db, COLLECTIONS.ORDERS);
        const q = query(
            ordersRef,
            where('customerId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching orders:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-600" size={20} />;
            case 'preparing':
                return <Package className="text-blue-600" size={20} />;
            case 'ready':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'delivered':
                return <CheckCircle className="text-gray-600" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <Clock className="text-gray-600" size={20} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Beklemede';
            case 'preparing':
                return 'Hazırlanıyor';
            case 'ready':
                return 'Hazır';
            case 'delivered':
                return 'Teslim Edildi';
            case 'cancelled':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return ['pending', 'preparing', 'ready'].includes(order.status);
        if (filterStatus === 'completed') return ['completed', 'delivered', 'served'].includes(order.status);
        if (filterStatus === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#432818] text-white px-4 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Siparişlerim</h1>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-[#FDFBF7] border-b border-[#432818]/5 sticky top-[60px] z-10">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-[#432818] text-[#D4AF37]' : 'bg-white text-[#432818]/60 border border-[#432818]/10'}`}
                >
                    Tümü
                </button>
                <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'active' ? 'bg-[#432818] text-[#D4AF37]' : 'bg-white text-[#432818]/60 border border-[#432818]/10'}`}
                >
                    Aktif
                </button>
                <button
                    onClick={() => setFilterStatus('completed')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'completed' ? 'bg-[#432818] text-[#D4AF37]' : 'bg-white text-[#432818]/60 border border-[#432818]/10'}`}
                >
                    Tamamlanan
                </button>
                <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'cancelled' ? 'bg-[#432818] text-[#D4AF37]' : 'bg-white text-[#432818]/60 border border-[#432818]/10'}`}
                >
                    İptal
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#432818]"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Sipariş bulunamadı</p>
                        <p className="text-gray-400 text-sm mt-2">{filterStatus === 'all' ? 'İlk siparişinizi vererek başlayın!' : 'Bu kategoride siparişiniz yok.'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[#432818] text-lg">
                                            {order.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(order.status)}
                                        <span className="text-sm font-medium">
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="text-sm text-gray-600">
                                        <span>Adet: {order.quantity}</span>
                                        {order.note && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Not: {order.note}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-[#432818]">
                                        ₺{(order.price * order.quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersView;
