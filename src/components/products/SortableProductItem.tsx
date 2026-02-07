import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { Product, ProductOption, Category } from '../../types';

interface SortableProductItemProps {
    product: Product;
    canEdit: boolean;
    getCategoryIcon: (category: string) => React.ReactNode;
    handleUpdateProduct: (id: string, field: keyof Product, value: string | number) => void;
    handleDeleteOption: (productId: string, option: ProductOption) => void;
    setDeleteId: (id: string | null) => void;
    categories: Category[];
}

const SortableProductItem: React.FC<SortableProductItemProps> = ({
    product,
    canEdit,
    getCategoryIcon,
    handleUpdateProduct,
    handleDeleteOption,
    setDeleteId,
    categories
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id, disabled: !canEdit });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.7 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col items-center text-center ${isDragging
                ? 'border-indigo-500/50 shadow-2xl scale-105 ring-8 ring-indigo-500/5 z-50'
                : 'border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/80 active:scale-[0.97]'
                }`}
        >
            {/* Geometric Accent Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Drag Handle - More Subtle */}
            {canEdit && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-6 right-6 p-2 text-slate-700 hover:text-indigo-400 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-xl touch-none z-10 transition-all opacity-0 group-hover:opacity-100"
                >
                    <GripVertical size={18} />
                </div>
            )}

            {/* Delete Button - Top Left */}
            {canEdit && (
                <button
                    onClick={() => setDeleteId(product.id)}
                    className="absolute top-6 left-6 p-2 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10 border border-transparent hover:border-red-400/20"
                    title="Ürünü Sil"
                >
                    <Trash2 size={16} />
                </button>
            )}

            <div className="p-8 pt-10 flex flex-col items-center w-full space-y-6">
                {/* Centered Icon Container */}
                <div className="relative">
                    <div className="bg-slate-950 border-2 border-white/5 p-5 rounded-[2rem] group-hover:border-indigo-500/40 group-hover:bg-indigo-500/5 transition-all duration-500 shadow-2xl group-hover:rotate-[360deg]">
                        <div className="text-indigo-400 group-hover:text-indigo-300 transform transition-transform group-hover:scale-110">
                            {getCategoryIcon(product.category)}
                        </div>
                    </div>
                    {(product.sold || 0) > 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30 border border-white/10">
                            {product.sold}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="space-y-3 w-full">
                    {/* Category Label */}
                    {canEdit ? (
                        <div className="flex justify-center">
                            <select
                                value={product.category}
                                onChange={(e) => handleUpdateProduct(product.id, 'category', e.target.value)}
                                className="bg-white/5 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full outline-none cursor-pointer hover:text-indigo-400 hover:bg-white/10 border border-white/5 transition-all text-center"
                            >
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] inline-block">
                            {product.category}
                        </span>
                    )}

                    {/* Product Name - Centered & Bold */}
                    <div className="px-2">
                        {canEdit ? (
                            <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                                className="bg-transparent w-full text-white font-black text-xl leading-tight outline-none border-b-2 border-transparent focus:border-indigo-500/30 transition-all placeholder:text-slate-700 text-center py-1"
                                placeholder="Ürün adı"
                            />
                        ) : (
                            <h4 className="text-white font-black text-xl leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                {product.name}
                            </h4>
                        )}
                    </div>
                </div>

                {/* Centered Options */}
                {product.options && product.options.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 max-w-[90%]">
                        {product.options.map((opt, i) => (
                            <div
                                key={i}
                                className="text-[10px] bg-slate-950/80 text-slate-400 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2 group/opt hover:border-indigo-500/20 transition-all shadow-inner"
                            >
                                <span className="font-bold tracking-tight">{opt.name}</span>
                                <span className="text-emerald-500 font-black border-l border-white/10 pl-2">
                                    {Number(opt.priceDiff) > 0 ? '+' : ''}{opt.priceDiff}₺
                                </span>
                                {canEdit && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOption(product.id, opt); }}
                                        className="text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full p-1 transition-all"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Price Section - Centered Bottom */}
                <div className="pt-4 w-full border-t border-white/5 mt-auto">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Fiyat</span>
                        {canEdit ? (
                            <div className="flex items-center gap-2 group/price relative">
                                <span className="text-emerald-500 text-sm font-black">₺</span>
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)}
                                    className="bg-transparent w-24 text-white text-3xl font-black outline-none border-b-2 border-transparent focus:border-emerald-500/50 transition-all font-mono text-center"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500 text-sm font-black">₺</span>
                                <span className="text-white text-4xl font-black font-mono tracking-tighter shadow-indigo-500/20">
                                    {formatCurrency(product.price).replace('₺', '')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableProductItem;
