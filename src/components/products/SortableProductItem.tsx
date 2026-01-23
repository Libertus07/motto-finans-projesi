import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { Product } from '../../types';

interface Category {
    id: string;
    name: string;
}

interface SortableProductItemProps {
    product: Product;
    canEdit: boolean;
    getCategoryIcon: (category: string) => React.ReactNode;
    handleUpdateProduct: (id: string, field: string, value: any) => void;
    handleDeleteOption: (productId: string, option: any) => void;
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
            className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${isDragging
                ? 'border-indigo-500 shadow-2xl scale-105 ring-2 ring-indigo-500/50'
                : 'border-slate-700/50 hover:border-indigo-500/40'
                }`}
        >
            {/* Drag Handle */}
            {canEdit && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-3 right-3 p-2 text-slate-600 hover:text-indigo-400 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 rounded-lg touch-none z-10 transition-all"
                >
                    <GripVertical size={18} />
                </div>
            )}

            <div className="p-5 space-y-4">
                {/* Header: Icon + Category */}
                <div className="flex justify-between items-start pr-8">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-3 rounded-xl border border-slate-700/50 group-hover:border-indigo-500/30 transition-all duration-300">
                            {getCategoryIcon(product.category)}
                        </div>
                        {(product.sold || 0) > 0 && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {product.sold}
                            </div>
                        )}
                    </div>

                    {canEdit ? (
                        <select
                            value={product.category}
                            onChange={(e) => handleUpdateProduct(product.id, 'category', e.target.value)}
                            className="bg-slate-900/50 text-[10px] text-slate-400 font-bold uppercase px-2 py-1 rounded-lg outline-none cursor-pointer hover:text-indigo-400 hover:bg-slate-800/50 border border-slate-700/50 transition-all"
                        >
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    ) : (
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900/30 px-2 py-1 rounded-lg">
                            {product.category}
                        </span>
                    )}
                </div>

                {/* Product Name */}
                <div className="min-h-[3rem]">
                    {canEdit ? (
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                            className="bg-transparent w-full text-white font-bold text-base leading-tight outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-600 py-1"
                            placeholder="Ürün adı"
                        />
                    ) : (
                        <h4 className="text-white font-bold text-base leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
                            {product.name}
                        </h4>
                    )}
                </div>

                {/* Options */}
                {product.options && product.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {product.options.map((opt, i) => (
                            <span
                                key={i}
                                className="text-[10px] bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-600/50 flex items-center gap-1.5 group/opt hover:bg-slate-700 transition-all"
                            >
                                <span className="font-semibold">{opt.name}</span>
                                <span className="text-emerald-400 font-bold">
                                    {Number(opt.priceDiff) > 0 ? '+' : ''}{opt.priceDiff}₺
                                </span>
                                {canEdit && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOption(product.id, opt); }}
                                        className="text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full p-0.5 transition-colors ml-1"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                    <div className="flex items-baseline gap-1">
                        {canEdit ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-emerald-400 text-sm font-bold">₺</span>
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)}
                                    className="bg-transparent w-20 text-emerald-400 text-xl font-black outline-none border-b-2 border-transparent focus:border-emerald-500 font-mono"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-emerald-400 text-sm font-bold">₺</span>
                                <span className="text-emerald-400 text-2xl font-black font-mono">
                                    {formatCurrency(product.price).replace('₺', '')}
                                </span>
                            </div>
                        )}
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Ürünü Sil"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
        </div>
    );
};

export default SortableProductItem;
