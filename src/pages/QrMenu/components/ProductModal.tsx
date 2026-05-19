import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Leaf, Sparkles } from 'lucide-react';
import { Product } from '../../../types';

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, options: any) => void;
    t: (key: string) => string;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, t }) => {
    const [selectedSize, setSelectedSize] = useState('Standart');
    const [specialNote, setSpecialNote] = useState('');

    useEffect(() => {
        if (product) {
            setSelectedSize('Standart');
            setSpecialNote('');
        }
    }, [product]);

    if (!product) return null;

    const handleAdd = () => {
        onAddToCart(product, {
            size: selectedSize,
            note: specialNote
        });
        onClose();
    };

    const getProductImage = (p: Product) => {
        if (p.image) return p.image;
        return 'https://images.unsplash.com/photo-1544787210-28274d6c66cf?w=800&q=80';
    };

    // Responsive Modal Variants
    const modalVariants = {
        hidden: { opacity: 0, y: 100, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, y: 100, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050302]/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-lg bg-[#FDFBF7] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-[#D4AF37]/20 z-10"
                    >
                        {/* --- Close Button --- */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[60] w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-black/50 transition-all border border-white/20 shadow-lg group/close"
                        >
                            <X size={20} className="group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* --- Edge-to-Edge Image --- */}
                        <div className="relative shrink-0 h-64 sm:h-72 w-full bg-[#1a110d] overflow-hidden group">
                            <motion.img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2s] ease-out"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/20 to-transparent z-10" />

                            {/* Floating Badges */}
                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                                {product.isVegan && (
                                    <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5">
                                        <Leaf size={12} fill="currentColor" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] font-cinzel">VEGAN</span>
                                    </div>
                                )}
                                {product.isGlutenFree && (
                                    <div className="bg-[#D4AF37] backdrop-blur-md text-[#432818] px-3 py-1.5 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5">
                                        <Sparkles size={12} fill="currentColor" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] font-cinzel">CHEF'S CHOICE</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- Content Flow --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 pt-2 pb-32 sm:pb-36 space-y-8 bg-[#FDFBF7]">
                            
                            {/* Title & Price Header */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-[#432818] font-cinzel leading-tight tracking-tight mb-1">
                                        {product.name}
                                    </h2>
                                    <span className="text-[#432818]/50 text-[10px] font-black uppercase tracking-[0.3em] font-cinzel">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-br from-[#432818] to-[#2a1810] text-[#D4AF37] px-4 py-2 rounded-2xl shadow-lg border border-[#D4AF37]/20 shrink-0">
                                    <span className="font-black text-xl font-cinzel tracking-tighter">₺{product.price}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="prose prose-sm">
                                <p className="text-[#432818]/70 text-base leading-relaxed font-medium font-serif italic relative">
                                    <span className="absolute -left-3 -top-2 text-4xl text-[#D4AF37]/20 font-serif">"</span>
                                    {product.description || "Bu ürün özel Motto tarifleri ile hazırlanmış, taze ve kaliteli malzemeler içeren eşsiz bir lezzettir."}
                                    <span className="absolute ml-1 text-4xl text-[#D4AF37]/20 font-serif leading-none">"</span>
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#432818]/10 to-transparent" />

                            {/* Size Selection */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-[#432818] uppercase tracking-[0.3em] font-cinzel">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                    Porsiyon
                                </label>
                                <div className="flex gap-3 bg-white p-1.5 rounded-[1.5rem] border border-[#432818]/5 shadow-inner">
                                    {['Standart', 'Büyük'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`flex-1 py-3 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                                                selectedSize === size
                                                    ? 'bg-[#432818] text-[#D4AF37] shadow-[0_8px_16px_rgba(67,40,24,0.15)]'
                                                    : 'text-[#432818]/50 hover:bg-[#FDFBF7]'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Note */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-[#432818] uppercase tracking-[0.3em] font-cinzel">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                    Özel Notunuz
                                </label>
                                <textarea
                                    placeholder="Şeker oranı, alerji uyarısı vb..."
                                    value={specialNote}
                                    onChange={(e) => setSpecialNote(e.target.value)}
                                    className="w-full bg-white border border-[#432818]/10 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-0 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all resize-none min-h-[100px] placeholder-[#432818]/30 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* --- Sticky Footer --- */}
                        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent pt-12 z-[70] backdrop-blur-[2px]">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAdd}
                                disabled={product.stock !== undefined && product.stock <= 0}
                                className={`w-full py-4 sm:py-5 rounded-[2rem] font-black text-lg font-cinzel tracking-[0.2em] shadow-[0_15px_30px_rgba(67,40,24,0.2)] flex items-center justify-center gap-4 relative overflow-hidden group/btn transition-all ${
                                    product.stock !== undefined && product.stock <= 0
                                        ? 'bg-[#432818]/20 text-[#432818]/50 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-[#432818] to-[#2a1810] text-[#D4AF37] border border-[#D4AF37]/20 hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)]'
                                }`}
                            >
                                {/* Button Hover Shine */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />

                                <span className="relative z-10">
                                    {product.stock !== undefined && product.stock <= 0 ? 'TÜKENDİ' : t('add_to_cart')}
                                </span>

                                {!(product.stock !== undefined && product.stock <= 0) && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#432818] rounded-full flex items-center justify-center relative z-10 group-hover/btn:rotate-90 group-active/btn:scale-90 transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-white/20">
                                        <Plus size={24} strokeWidth={3} />
                                    </div>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Custom Scrollbar Styles for this component */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(212, 175, 55, 0.6);
                }
            `}</style>
        </AnimatePresence>
    );
};

export default ProductModal;
