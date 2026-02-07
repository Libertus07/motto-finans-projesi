import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { X, Plus, Info, Leaf, Flame, Sparkles, Star } from 'lucide-react';
import { Product } from '../../../types';

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, options: any) => void;
    t: (key: string) => string;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, t }) => {
    // --- 3D TILT LOGIC (Hooks Must Run Always) ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    // RotateX follows Y-axis movement, RotateY follows X-axis movement
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const [selectedSize, setSelectedSize] = useState('Standart');
    const [activeTab, setActiveTab] = useState<'details' | 'ingredients'>('details');
    const [specialNote, setSpecialNote] = useState('');

    // Update state when product changes
    useEffect(() => {
        if (product) {
            setSelectedSize('Standart');
            setActiveTab('details');
            setSpecialNote('');
        }
    }, [product]);

    // Return null ONLY after hooks
    if (!product) return null;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden perspective-1000">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050302]/85 backdrop-blur-xl"
                    />

                    {/* 3D Card Container */}
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="relative w-full max-w-lg bg-[#FDFBF7] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-[#D4AF37]/20 group/modal"
                    >
                        {/* --- Divine Glow Overlay --- */}
                        <div className="absolute inset-0 pointer-events-none z-50">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-[#D4AF37]/10 opacity-0 group-hover/modal:opacity-100 transition-opacity duration-700" />
                            <div
                                className="absolute w-full h-full opacity-0 group-hover/modal:opacity-20 transition-opacity duration-500"
                                style={{
                                    background: 'linear-gradient(135deg, transparent 25%, rgba(212,175,55,0.4) 50%, transparent 75%)',
                                    backgroundSize: '200% 200%',
                                    animation: 'shimmer 3s infinite linear'
                                }}
                            />
                        </div>

                        {/* --- Close Button --- */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-[60] w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/40 transition-all border border-white/10 group/close"
                        >
                            <X size={24} className="group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* --- Floating Badges (3D) --- */}
                        <div className="absolute top-8 left-8 z-[60] flex flex-col gap-3 pointer-events-none" style={{ transform: "translateZ(60px)" }}>
                            {product.isVegan && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(16,185,129,0.3)] border border-white/20 flex items-center gap-2 rotate-[-2deg]"
                                >
                                    <Leaf size={14} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-cinzel">VEGAN</span>
                                </motion.div>
                            )}
                            {product.isGlutenFree && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-[#D4AF37] backdrop-blur-md text-[#432818] px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(212,175,55,0.3)] border border-white/40 flex items-center gap-2 rotate-[1deg]"
                                >
                                    <Sparkles size={14} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-cinzel">CHEF'S CHOICE</span>
                                </motion.div>
                            )}
                        </div>

                        {/* --- Image Section (3D) --- */}
                        <div className="relative h-72 overflow-hidden bg-[#1a110d]" style={{ transform: "translateZ(30px)" }}>
                            <motion.img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover scale-110 group-hover/modal:scale-125 transition-transform duration-[2s] ease-out opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/20 to-transparent z-10" />

                            {/* Product Info Floating Overlay */}
                            <div className="absolute bottom-4 inset-x-8 z-20">
                                <motion.h2
                                    className="text-4xl font-black text-[#432818] font-cinzel leading-tight tracking-tight mb-2"
                                    style={{ transform: "translateZ(70px)" }}
                                >
                                    {product.name}
                                </motion.h2>
                                <div className="flex items-center gap-4" style={{ transform: "translateZ(50px)" }}>
                                    <div className="bg-[#432818] text-[#D4AF37] px-4 py-1.5 rounded-full shadow-lg">
                                        <span className="font-black text-xl font-cinzel">₺{product.price}</span>
                                    </div>
                                    <span className="text-[#432818]/60 text-xs font-black uppercase tracking-[0.3em] font-cinzel">{product.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- Content Section --- */}
                        <div className="bg-[#FDFBF7] px-8 py-6 pb-36 space-y-8" style={{ transform: "translateZ(20px)" }}>
                            {/* Tabs */}
                            <div className="flex gap-8 border-b border-[#432818]/5">
                                {[
                                    { id: 'details', label: t('details'), icon: Info },
                                    { id: 'ingredients', label: t('nutrition'), icon: Flame }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`pb-4 text-xs font-black uppercase tracking-[0.25em] font-cinzel flex items-center gap-2.5 transition-all relative ${activeTab === tab.id ? 'text-[#D4AF37]' : 'text-[#432818]/30 hover:text-[#432818]/60'
                                            }`}
                                    >
                                        <tab.icon size={16} strokeWidth={2.5} />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="min-h-[220px]"
                                >
                                    {activeTab === 'details' ? (
                                        <div className="space-y-8">
                                            <p className="text-[#432818]/70 text-base leading-relaxed font-medium font-serif italic">
                                                "{product.description || "Bu ürün özel Motto tarifleri ile hazırlanmış, taze ve kaliteli malzemeler içeren eşsiz bir lezzettir."}"
                                            </p>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] font-cinzel block">Porsiyon</label>
                                                    <div className="flex gap-3">
                                                        {['Standart', 'Büyük'].map((size) => (
                                                            <button
                                                                key={size}
                                                                onClick={() => setSelectedSize(size)}
                                                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedSize === size
                                                                    ? 'bg-[#432818] text-[#D4AF37] border-[#432818] shadow-[0_10px_20px_rgba(67,40,24,0.2)]'
                                                                    : 'bg-white text-[#432818]/40 border-[#432818]/5 hover:border-[#D4AF37]/30'
                                                                    }`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] font-cinzel block">Özel Not</label>
                                                <textarea
                                                    placeholder="Şeker oranı, alerji uyarısı vb..."
                                                    value={specialNote}
                                                    onChange={(e) => setSpecialNote(e.target.value)}
                                                    className="w-full bg-[#f8f5f0] border-2 border-transparent rounded-[1.5rem] p-5 text-sm font-medium focus:ring-0 focus:border-[#D4AF37]/30 transition-all resize-none min-h-[120px] placeholder-[#432818]/30"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { label: 'Kalori', value: product.calories?.toString() || '320', unit: 'kcal', icon: Flame, color: 'text-orange-500' },
                                                { label: 'Protein', value: '12', unit: 'g', icon: Star, color: 'text-blue-500' },
                                                { label: 'Karbonhidrat', value: '45', unit: 'g', icon: Sparkles, color: 'text-emerald-500' },
                                                { label: 'Yağ', value: '8', unit: 'g', icon: Leaf, color: 'text-amber-500' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-white border-2 border-[#432818]/5 p-5 rounded-[2rem] hover:border-[#D4AF37]/20 transition-all group/stat">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <stat.icon size={14} className={`${stat.color} opacity-60 group-hover/stat:opacity-100 transition-opacity`} />
                                                        <span className="text-[10px] font-black text-[#432818]/40 uppercase tracking-widest">{stat.label}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-[#432818] font-cinzel">{stat.value}</span>
                                                        <span className="text-[10px] font-black text-[#432818]/40 uppercase">{stat.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* --- Sticky Footer (3D) --- */}
                        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent pt-20 z-[70] backdrop-blur-[2px]">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleAdd}
                                disabled={product.stock !== undefined && product.stock <= 0}
                                className={`w-full py-6 rounded-[2.5rem] font-black text-xl font-cinzel tracking-[0.2em] shadow-[0_25px_50px_rgba(67,40,24,0.3)] flex items-center justify-center gap-5 relative overflow-hidden group/btn transition-all ${product.stock !== undefined && product.stock <= 0
                                    ? 'bg-slate-400 text-white cursor-not-allowed opacity-80'
                                    : 'bg-[#432818] text-[#D4AF37] border border-white/20'
                                    }`}
                                style={{ transform: "translateZ(80px)" }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1.5s] ease-in-out" />

                                <span className="relative z-10">
                                    {product.stock !== undefined && product.stock <= 0 ? 'TÜKENDİ' : t('add_to_cart')}
                                </span>

                                {!(product.stock !== undefined && product.stock <= 0) && (
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#432818] rounded-full flex items-center justify-center relative z-10 group-hover:rotate-90 group-active:scale-90 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-white/20">
                                        <Plus size={28} strokeWidth={3} />
                                    </div>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* CSS for Shimmer Animation */}
            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(67, 40, 24, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </AnimatePresence>
    );
};

export default ProductModal;
