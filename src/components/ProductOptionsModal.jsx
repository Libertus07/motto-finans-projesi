// components/ProductOptionsModal.jsx (AKILLI KATEGORİ EŞLEŞTİRME)

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';

const ProductOptionsModal = ({ isOpen, onClose, product, onConfirm }) => {
    // State'leri en başta tanımla (Hook kuralları gereği)
    const [selections, setSelections] = useState({});
    const [extras, setExtras] = useState([]);
    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [currentOptions, setCurrentOptions] = useState([]);

    // --- 1. SEÇENEK HAVUZU ---
    const OPTION_GROUPS = {
        HOT_COFFEE: [
            {
                id: 'size', title: 'Boyut', type: 'radio',
                choices: [
                    { label: 'Küçük', priceChange: -5 },
                    { label: 'Orta', priceChange: 0, default: true },
                    { label: 'Büyük', priceChange: +15 }
                ]
            },
            {
                id: 'milk', title: 'Süt Seçimi', type: 'radio',
                choices: [
                    { label: 'Normal Süt', priceChange: 0, default: true },
                    { label: 'Laktozsuz', priceChange: +5 },
                    { label: 'Yulaf Sütü', priceChange: +15 },
                    { label: 'Badem Sütü', priceChange: +15 }
                ]
            },
            {
                id: 'syrup', title: 'Ekstra Şurup & Shot', type: 'checkbox',
                choices: [
                    { label: 'Extra Shot', priceChange: +20 },
                    { label: 'Karamel', priceChange: +10 },
                    { label: 'Vanilya', priceChange: +10 },
                    { label: 'Fındık', priceChange: +10 }
                ]
            }
        ],
        COLD_COFFEE: [
            {
                id: 'size', title: 'Boyut', type: 'radio',
                choices: [
                    { label: 'Standart', priceChange: 0, default: true },
                    { label: 'Büyük Boy', priceChange: +15 }
                ]
            },
            {
                id: 'milk', title: 'Süt Seçimi', type: 'radio',
                choices: [
                    { label: 'Normal Süt', priceChange: 0, default: true },
                    { label: 'Laktozsuz', priceChange: +5 },
                    { label: 'Yulaf Sütü', priceChange: +15 }
                ]
            }
        ],
        TEA: [
            {
                id: 'size', title: 'Boyut', type: 'radio',
                choices: [
                    { label: 'Bardak', priceChange: 0, default: true },
                    { label: 'Fincan', priceChange: +10 }
                ]
            },
            {
                id: 'extra', title: 'Ekstra', type: 'checkbox',
                choices: [
                    { label: 'Limon', priceChange: 0 },
                    { label: 'Bal', priceChange: +10 }
                ]
            }
        ],
        DESSERT: [
            {
                id: 'serving', title: 'Servis', type: 'checkbox',
                choices: [
                    { label: 'Dondurma Topu', priceChange: +25 },
                    { label: 'Çikolata Sos', priceChange: +5 },
                    { label: 'Meyve Parçaları', priceChange: +15 }
                ]
            }
        ],
        FOOD: [
            {
                id: 'sauce', title: 'Soslar', type: 'checkbox',
                choices: [
                    { label: 'Ketçap & Mayonez', priceChange: 0 },
                    { label: 'Barbekü Sos', priceChange: +5 },
                    { label: 'Acı Sos', priceChange: +5 }
                ]
            }
        ]
    };

    // --- 2. KATEGORİ BELİRLEME MANTIĞI ---
    useEffect(() => {
        if (!product) return;

        const cat = product.category || '';
        let options = [];

        // Akıllı Eşleştirme (İçinde geçen kelimeye göre)
        if (cat.includes('Sıcak Kahve')) options = OPTION_GROUPS.HOT_COFFEE;
        else if (cat.includes('Soğuk Kahve')) options = OPTION_GROUPS.COLD_COFFEE;
        else if (cat.includes('Çay')) options = OPTION_GROUPS.TEA;
        else if (cat.includes('Tatlı') || cat.includes('Pasta')) options = OPTION_GROUPS.DESSERT;
        else if (cat.includes('Yiyecek') || cat.includes('Atıştırma') || cat.includes('Tost')) options = OPTION_GROUPS.FOOD;
        
        setCurrentOptions(options);

        // Varsayılan seçimleri ayarla
        const defaults = {};
        options.forEach(group => {
            if (group.type === 'radio') {
                const def = group.choices.find(c => c.default);
                if (def) defaults[group.id] = def;
            }
        });
        setSelections(defaults);
        setExtras([]);
        setNote('');
        setQuantity(1);

    }, [product]);

    if (!isOpen || !product) return null;

    // Fiyat Hesaplama
    const calculateTotal = () => {
        let total = product.price;
        Object.values(selections).forEach(sel => total += sel.priceChange);
        extras.forEach(ext => total += ext.priceChange);
        return total;
    };

    const unitPrice = calculateTotal();
    const totalPrice = unitPrice * quantity;

    const handleConfirm = () => {
        let finalName = product.name;
        const details = [];

        Object.values(selections).forEach(sel => {
            if (sel.priceChange !== 0 || !sel.default) details.push(sel.label);
        });
        extras.forEach(ext => details.push(ext.label));
        
        if (details.length > 0) finalName += ` (${details.join(', ')})`;
        if (note) finalName += ` [Not: ${note}]`;

        onConfirm({
            ...product,
            name: finalName,
            price: unitPrice,
            originalPrice: product.price,
            quantity: quantity
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className={`${THEME.card} w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]`}>
                
                {/* Header */}
                <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-3xl sm:rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                        <p className="text-emerald-400 font-bold text-lg">{formatCurrency(unitPrice)} ₺</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={20}/></button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    
                    {currentOptions.length > 0 ? currentOptions.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{group.title}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {group.choices.map((choice, idx) => {
                                    const isSelected = group.type === 'radio' 
                                        ? selections[group.id]?.label === choice.label 
                                        : extras.some(e => e.label === choice.label);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (group.type === 'radio') {
                                                    setSelections(prev => ({ ...prev, [group.id]: choice }));
                                                } else {
                                                    if (isSelected) setExtras(prev => prev.filter(e => e.label !== choice.label));
                                                    else setExtras(prev => [...prev, choice]);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all flex justify-between items-center ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}
                                        >
                                            <span>{choice.label}</span>
                                            {choice.priceChange !== 0 && (
                                                <span className={`text-xs font-bold ${choice.priceChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {choice.priceChange > 0 ? '+' : ''}{choice.priceChange}₺
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                            <p className="text-slate-500 text-sm">Bu kategori için özel seçenek tanımlanmamış.</p>
                            <p className="text-xs text-slate-600 mt-1">Yine de not ekleyebilir veya adet seçebilirsiniz.</p>
                        </div>
                    )}

                    {/* Not Alanı */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Özel Not</h4>
                        <input type="text" placeholder="Örn: Çok sıcak olsun..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"/>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-2 border border-slate-700">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-slate-400 hover:text-white"><Minus size={18}/></button>
                            <span className="font-bold text-white w-6 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-slate-400 hover:text-white"><Plus size={18}/></button>
                        </div>
                        <button onClick={handleConfirm} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                            <CheckCircle2 size={20}/>
                            <span>EKLE • {formatCurrency(totalPrice)} ₺</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOptionsModal;