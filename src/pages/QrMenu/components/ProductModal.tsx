import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Star, Info, ChevronRight } from 'lucide-react';
import { Product } from '../../../types';
import { getProductImage } from '../../../utils/imageHelpers';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product, options: any, e?: React.MouseEvent) => void;
    t: (key: string) => string;
    relatedProduct?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart, t, relatedProduct }) => {
    const [productOptions, setProductOptions] = useState<{ size: string | null; extras: any[]; sugar: string | null; notes: string; }>({ size: 'medium', extras: [], sugar: 'normal', notes: '' });
    const [activeTab, setActiveTab] = useState<'details' | 'ingredients'>('details');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (product) {
            const timer = setTimeout(() => setIsAnimating(true), 50);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 50);
            return () => clearTimeout(timer);
        }
    }, [product]);

    if (!product) return null;

    const handleAdd = (e: React.MouseEvent) => {
        onAddToCart(product, productOptions, e);
        // Optional: Close modal after add? For now let's keep it open or rely on parent.
        // Usually better to give feedback and close or let user add more.
        onClose();
    };

    const handleAddRelated = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (relatedProduct) {
            // Add related product with default options
            onAddToCart(relatedProduct, { size: 'medium', notes: 'Hızlı Ekleme (Öneri)' }, e);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-1000" onClick={onClose}>
            <div className={`absolute inset-0 bg-[#1a110d]/60 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} />

            <div
                className={`w-full max-w-md bg-[#FDFBF7] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative transform transition-all duration-500 ease-out ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Parallax Image Header */}
                <div className="relative h-80 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FDFBF7] z-10" />
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all border border-white/10 active:scale-95"
                    >
                        <X size={20} />
                    </button>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                        {product.isVegan && <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">VEGAN</span>}
                        {product.price > 100 && <span className="px-3 py-1 bg-[#D4AF37]/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">PREMIUM</span>}
                    </div>
                </div>

                {/* Content Container */}
                <div className="relative z-20 -mt-12 px-6 pb-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 mr-4">
                            <h2 className="text-3xl font-black text-[#432818] font-cinzel leading-none mb-2">{product.name}</h2>
                            <div className="flex items-center gap-2 text-[#432818]/40 text-xs font-bold tracking-wider">
                                <Clock size={12} />
                                <span>15-20 DK</span>
                                <span className="mx-1">•</span>
                                <Star size={12} className="text-[#D4AF37]" fill="currentColor" />
                                <span>4.9</span>
                            </div>
                        </div>
                        <div className="bg-[#432818] text-[#D4AF37] px-4 py-3 rounded-2xl shadow-xl shadow-[#432818]/20 flex flex-col items-center min-w-[80px]">
                            <span className="text-xs font-bold opacity-80">Fiyat</span>
                            <span className="text-xl font-black font-cinzel">{product.price} ₺</span>
                        </div>
                    </div>

                    {/* Tabs (Visual Only for now) */}
                    <div className="flex gap-6 border-b border-[#432818]/5 mb-6">
                        <button
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'text-[#432818] border-b-2 border-[#432818]' : 'text-[#432818]/40'}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Detaylar
                        </button>
                        <button
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ingredients' ? 'text-[#432818] border-b-2 border-[#432818]' : 'text-[#432818]/40'}`}
                            onClick={() => setActiveTab('ingredients')}
                        >
                            İçerik
                        </button>
                    </div>

                    <div className="space-y-6">
                        <p className="text-[#432818]/70 text-sm leading-relaxed font-medium">
                            {product.description}
                        </p>

                        {/* Special Requests */}
                        <div className="bg-[#F7F3F0] rounded-2xl p-4 border border-[#432818]/5">
                            <label className="flex items-center gap-2 text-xs font-black text-[#432818] uppercase tracking-wider mb-3">
                                <Edit3 size={12} className="text-[#BB9457]" />
                                {t('special_note')}
                            </label>
                            <textarea
                                value={productOptions.notes}
                                onChange={e => setProductOptions({ ...productOptions, notes: e.target.value })}
                                className="w-full bg-white rounded-xl p-3 text-sm text-[#432818] placeholder:text-[#432818]/20 outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all resize-none border-none shadow-sm"
                                placeholder={t('note_placeholder')}
                                rows={2}
                            />
                        </div>

                        {/* Related Product / Upsell */}
                        {relatedProduct && (
                            <div className="relative overflow-hidden rounded-2xl bg-[#432818] text-[#FDFBF7] p-4 shadow-lg isolate">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <img src={getProductImage(relatedProduct)} alt="Upsell" className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#D4AF37]/50" />
                                        <div>
                                            <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-0.5">Yanına İyi Gider</p>
                                            <h4 className="font-cinzel font-bold text-sm leading-none">{relatedProduct.name}</h4>
                                            <p className="text-xs opacity-60 mt-0.5">{relatedProduct.price} ₺</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddRelated}
                                        className="bg-[#D4AF37] text-[#432818] p-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-4 border-t border-[#432818]/5">
                        <button
                            onClick={handleAdd}
                            className="w-full bg-[#432818] text-[#D4AF37] py-5 rounded-2xl font-black text-lg font-cinzel tracking-wider shadow-2xl shadow-[#432818]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                            <span className="relative z-10">{t('add_to_cart')}</span>
                            <div className="w-8 h-8 bg-[#D4AF37] text-[#432818] rounded-full flex items-center justify-center relative z-10 group-hover:rotate-90 transition-transform duration-300">
                                <Plus size={20} />
                            </div>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const Edit3 = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

export default ProductModal;
