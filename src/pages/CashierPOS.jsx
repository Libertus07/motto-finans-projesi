// pages/CashierPOS.jsx (MOBİL UYUMLU VERSİYON)

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Coffee, X, CheckCircle2, Smartphone, Search, Printer } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';
import { deductStockForTransaction } from '../utils/stockManager';
import Receipt from '../components/Receipt';

const CashierPOS = ({ products, ingredients }) => {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cardBank, setCardBank] = useState('ziraat');
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [printData, setPrintData] = useState(null);

    const bankOptions = [
        { key: 'ziraat', label: 'ZİRAAT' },
        { key: 'halk', label: 'HALK' },
        { key: 'iban', label: 'DİĞER / IBAN' }
    ];

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const totalAmount = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);

    const handlePrintReceipt = () => {
        if (cart.length === 0) return;
        setPrintData({
            title: 'Hızlı Satış Fişi', type: 'Satış Fişi', date: new Date().toLocaleString('tr-TR'),
            items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })), total: totalAmount
        });
        setTimeout(() => window.print(), 100);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setProcessing(true);
        const user = auth.currentUser;
        const subMethodDisplay = paymentMethod === 'cash' ? 'Nakit' : `Kart (${cardBank.toUpperCase()})`;
        const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
        const transCardBank = paymentMethod === 'card' ? cardBank : null;

        const transactionData = {
            date: new Date().toISOString().split('T')[0], type: 'income', amount: totalAmount,
            desc: `POS Satış (${cart.length} Kalem)`, method: transMethod, cardBank: transCardBank, subMethod: subMethodDisplay, category: 'Satış',
            items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
        };

        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), transactionData);
            await deductStockForTransaction(cart);
            setSuccessMsg(`✅ ${formatCurrency(totalAmount)} ₺ Tahsil Edildi!`);
            setCart([]);
            setPaymentMethod('cash');
            setCardBank('ziraat');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) { console.error("Satış hatası:", error); alert("Satış kaydedilirken hata oluştu."); } finally { setProcessing(false); }
    };

    const categories = ['Tümü', ...new Set(products.map(p => p.category))];
    const filteredProducts = products.filter(p => (selectedCategory === 'Tümü' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-6 overflow-visible lg:overflow-hidden pb-20 lg:pb-0">
            
            {/* SOL: ÜRÜN LİSTESİ */}
            <div className="flex-1 flex flex-col bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl h-[500px] lg:h-auto">
                <div className="p-4 border-b border-slate-700 space-y-4 bg-slate-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20}/>
                        <input type="text" placeholder="Ürün ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"/>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map(cat => ( <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{cat}</button> ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <button key={product.id} onClick={() => addToCart(product)} className="flex flex-col items-start p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-indigo-500/50 rounded-2xl transition-all group active:scale-95 text-left h-32 justify-between">
                                <span className="font-bold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">{product.name}</span>
                                <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-lg text-sm">{formatCurrency(product.price)} ₺</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SAĞ: SEPET VE ÖDEME */}
            <div className="w-full lg:w-[400px] bg-slate-800 rounded-2xl border border-slate-700 flex flex-col shadow-2xl shrink-0 h-auto">
                <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingCart className="text-indigo-400"/> Sepet</h2>
                    <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">{cart.length} Ürün</span>
                </div>
                {/* Mobilde sepet yüksekliğini sınırla */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-900/30 max-h-[300px] lg:max-h-full">
                    {cart.length === 0 ? (
                        <div className="h-40 lg:h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                            <Coffee size={48} className="mb-2"/>
                            <p>Sepet boş</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 group">
                                <div className="flex-1 min-w-0 mr-3">
                                    <h4 className="font-bold text-slate-200 text-sm truncate">{item.name}</h4>
                                    <p className="text-xs text-indigo-400 font-bold">{formatCurrency(item.price * item.quantity)} ₺</p>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Minus size={14}/></button>
                                    <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Plus size={14}/></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="ml-2 text-slate-600 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-end"><span className="text-slate-400 text-sm font-medium">Toplam Tutar</span><span className="text-3xl font-black text-white tracking-tight">{formatCurrency(totalAmount)} <span className="text-lg text-slate-600 font-medium">₺</span></span></div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all border-2 ${paymentMethod === 'cash' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}><Banknote size={24}/> <span className="text-xs">NAKİT</span></button>
                        <button onClick={() => setPaymentMethod('card')} className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all border-2 ${paymentMethod === 'card' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}><CreditCard size={24}/> <span className="text-xs">KART</span></button>
                    </div>
                    {paymentMethod === 'card' && ( <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 fade-in">{bankOptions.map(option => ( <button key={option.key} onClick={() => setCardBank(option.key)} className={`py-2 rounded-lg text-[10px] font-bold transition-colors border ${cardBank === option.key ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{option.label}</button> ))}</div> )}
                    <button onClick={handlePrintReceipt} disabled={cart.length === 0} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"><Printer size={20}/> ADİSYON YAZDIR</button>
                    <button onClick={handleCheckout} disabled={cart.length === 0 || processing} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${successMsg ? 'bg-emerald-500 text-white' : (paymentMethod === 'cash' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white')}`}>{successMsg ? <><CheckCircle2/> {successMsg}</> : 'TAHSİL ET'}</button>
                </div>
                <Receipt data={printData} />
            </div>
        </div>
    );
};

export default CashierPOS;