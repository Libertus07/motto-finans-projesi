// components/ProductOptionsModal.jsx (ADET SEÇİMİ EKLENDİ ✅)

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Plus, Coffee, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const ProductOptionsModal = ({ isOpen, onClose, product, onConfirm }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    // 👇 YENİ: Adet State'i
    const [quantity, setQuantity] = useState(1);

    // Modal her açıldığında verileri sıfırla
    useEffect(() => {
        if (product && isOpen) {
            setTotalPrice(Number(product.price));
            setSelectedOptions([]);
            setQuantity(1); // Adet 1'e döner
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const handleOptionToggle = (option) => {
        const isSelected = selectedOptions.some(opt => opt.id === option.id);
        let newOptions = [];
        
        if (isSelected) {
            newOptions = selectedOptions.filter(opt => opt.id !== option.id);
        } else {
            newOptions = [...selectedOptions, option];
        }

        // Yeni opsiyonların toplamını hesapla
        const optionsTotal = newOptions.reduce((acc, opt) => acc + Number(opt.priceDiff), 0);
        
        setSelectedOptions(newOptions);
        setTotalPrice(Number(product.price) + optionsTotal);
    };

    // 👇 YENİ: Adet Fonksiyonları
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleConfirm = () => {
        let finalName = product.name;
        
        if (selectedOptions.length > 0) {
            const optionsString = selectedOptions.map(o => o.name).join(', ');
            finalName = `${product.name} (${optionsString})`;
        }

        const customizedProduct = {
            ...product,
            name: finalName,
            price: totalPrice, // Birim fiyat (Opsiyonlar dahil)
            selectedOptions: selectedOptions,
            quantity: quantity // 👇 Seçilen adet gönderiliyor
        };

        onConfirm(customizedProduct);
        onClose();
    };

    const hasOptions = product.options && product.options.length > 0;
    // Toplam Tutar = (Birim Fiyat + Opsiyonlar) * Adet
    const grandTotal = totalPrice * quantity;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Coffee className="text-indigo-400" size={24}/>
                            {product.name}
                        </h3>
                        <p className="text-slate-400 text-sm">Seçenekleri Düzenle</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {!hasOptions ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                            Bu ürün için tanımlı ekstra seçenek yok.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ekstralar & Tercihler</p>
                            {product.options.map((option, index) => {
                                const optId = option.id || index;
                                const isSelected = selectedOptions.some(opt => opt.id === optId);
                                
                                return (
                                    <button
                                        key={optId}
                                        onClick={() => handleOptionToggle({ ...option, id: optId })}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                                            isSelected 
                                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-400 bg-indigo-400' : 'border-slate-500'}`}>
                                                {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                            </div>
                                            <span className="font-medium">{option.name}</span>
                                        </div>
                                        <span className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                                            +{formatCurrency(option.priceDiff)} ₺
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer / Total & Quantity */}
                <div className="p-6 bg-slate-800/50 border-t border-slate-800 rounded-b-3xl space-y-4">
                    
                    {/* 👇 YENİ: ADET SEÇİCİ */}
                    <div className="flex justify-center items-center gap-6 bg-slate-900 p-3 rounded-2xl border border-slate-700">
                        <button onClick={decreaseQuantity} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white transition-colors active:scale-90">
                            <Minus size={20} />
                        </button>
                        <div className="text-center w-12">
                            <span className="block text-2xl font-black text-white">{quantity}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">ADET</span>
                        </div>
                        <button onClick={increaseQuantity} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white transition-colors active:scale-90">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-slate-400 text-xs font-bold uppercase block">Toplam Tutar</span>
                            <span className="text-3xl font-black text-emerald-400">{formatCurrency(grandTotal)} ₺</span>
                        </div>
                        <button 
                            onClick={handleConfirm}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            EKLE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOptionsModal;