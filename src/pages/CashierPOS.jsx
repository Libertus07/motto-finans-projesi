import React, { useState } from 'react';
import { Coffee, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2, ShoppingBag, Printer } from 'lucide-react'; // Printer ikonu eklendi
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { CATEGORIES } from '../utils/constants';
import Receipt from '../components/Receipt'; // Fiş bileşeni eklendi

const CashierPOS = ({ products }) => {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // 👇 YAZDIRMA İÇİN YENİ STATE
    const [printData, setPrintData] = useState(null);

    // --- SEPET İŞLEMLERİ ---
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);

    // --- FİYAT HESAPLAMA ---
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // --- SATIŞI TAMAMLA ---
    const handleCheckout = async (method) => {
        if (cart.length === 0 || processing) return;
        setProcessing(true);

        const user = auth.currentUser;
        if (!user) return;

        const desc = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');

        const transactionData = {
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            amount: totalAmount,
            desc: `SATIŞ: ${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}`,
            method: method === 'cash' ? 'cash' : 'card',
            cardBank: method === 'card' ? 'ziraat' : null,
            subMethod: method === 'cash' ? 'Nakit' : 'Kart (POS)',
            category: 'Satış'
        };

        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), transactionData);
            setSuccessMsg(`✅ ${formatCurrency(totalAmount)} ₺ Tahsil Edildi!`);
            setCart([]);
            setTimeout(() => setSuccessMsg(''), 2000);
        } catch (error) {
            console.error("Satış hatası:", error);
            alert("Satış kaydedilemedi!");
        } finally {
            setProcessing(false);
        }
    };

    // 👇 YENİ: YAZDIRMA FONKSİYONU
    const handlePrintReceipt = () => {
        if (cart.length === 0) return;
        
        // Fiş verisini hazırla
        setPrintData({
            title: 'Hızlı Satış (Kasa)',
            type: 'Kasa Fişi',
            items: cart,
            total: totalAmount,
            date: new Date().toLocaleString('tr-TR')
        });

        // Veri yüklendikten hemen sonra yazdır
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // --- FİLTRELEME ---
    const filteredProducts = products.filter(p => 
        selectedCategory === 'Tümü' || p.category === selectedCategory
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
            
            {/* SOL TARAF: MENÜ & ÜRÜNLER */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => setSelectedCategory('Tümü')} className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === 'Tümü' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Tümü</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredProducts.map(p => (
                            <button 
                                key={p.id} 
                                onClick={() => addToCart(p)}
                                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col justify-between h-32 transition-all active:scale-95 group"
                            >
                                <div className="flex justify-between items-start w-full">
                                    <span className="font-bold text-slate-200 text-left line-clamp-2">{p.name}</span>
                                    <div className="bg-slate-900 p-1.5 rounded-lg text-indigo-400 group-hover:text-white transition-colors"><Plus size={16}/></div>
                                </div>
                                <span className="font-extrabold text-emerald-400 text-lg self-start">{formatCurrency(p.price)} ₺</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SAĞ TARAF: SEPET & ÖDEME */}
            <div className="w-full lg:w-96 bg-slate-800 rounded-3xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><ShoppingBag className="text-orange-400"/> Sipariş Özeti</h3>
                    {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-400 hover:text-white flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded hover:bg-red-600 transition-colors"><Trash2 size={12}/> Temizle</button>}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-800/50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50"><Coffee size={48} className="mb-2"/><p>Sepet boş</p></div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700/50">
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">{item.name}</div>
                                    <div className="text-emerald-400 text-xs font-mono">{formatCurrency(item.price)} ₺</div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-red-500 hover:text-white rounded text-slate-400 transition-colors"><Minus size={14}/></button>
                                    <span className="text-white font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-emerald-500 hover:text-white rounded text-slate-400 transition-colors"><Plus size={14}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 bg-slate-900 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400">Toplam Tutar</span>
                        <span className="text-3xl font-extrabold text-white">{formatCurrency(totalAmount)} ₺</span>
                    </div>

                    {successMsg ? (
                        <div className="bg-emerald-500 text-white py-4 rounded-xl text-center font-bold text-lg animate-in zoom-in flex items-center justify-center gap-2">
                            <CheckCircle2 size={24}/> {successMsg}
                        </div>
                    ) : (
                        <>
                            {/* 👇 YENİ: YAZDIRMA BUTONU */}
                            <button 
                                onClick={handlePrintReceipt}
                                disabled={cart.length === 0}
                                className="w-full mb-3 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"
                            >
                                <Printer size={20}/> FİŞ YAZDIR
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleCheckout('cash')} disabled={cart.length === 0} className="py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                                    <Banknote size={24}/> <span>NAKİT</span>
                                </button>
                                <button onClick={() => handleCheckout('card')} disabled={cart.length === 0} className="py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95">
                                    <CreditCard size={24}/> <span>KART</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 👇 GİZLİ FİŞ BİLEŞENİ */}
            <Receipt data={printData} />
        </div>
    );
};

export default CashierPOS;