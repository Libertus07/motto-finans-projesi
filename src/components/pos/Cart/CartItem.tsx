// components/pos/Cart/CartItem.tsx
import React from 'react';
import { Minus, Plus, Trash2, StickyNote } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { CartItem as CartItemType } from '../../../types';

interface CartItemProps {
    item: CartItemType;
    isSelectionMode: boolean;
    selectedItems: Record<string, number>;
    onUpdateQuantity: (id: string, change: number) => void;
    onToggleSelection: (id: string, maxQty: number, change: number) => void;
    onRemove: (id: string) => void;
    isDarkMode: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
    item,
    isSelectionMode,
    selectedItems,
    onUpdateQuantity,
    onToggleSelection,
    onRemove,
    isDarkMode
}) => {
    const isSelected = isSelectionMode && (selectedItems[item.id] || 0) > 0;
    const selectedQty = selectedItems[item.id] || 0;

    return (
        <div className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 
            ${isSelected
                ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                : (isDarkMode
                    ? 'bg-slate-800/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md')}
        `}>
            <div className="flex flex-col flex-1 min-w-0 pr-3">
                <span className={`font-bold text-sm tracking-tight truncate ${isSelected ? 'text-purple-400' : (isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-black')}`}>
                    {item.name}
                </span>
                {/* 📝 NOT GÖSTERİMİ */}
                {item.note && (
                    <div className="flex items-start gap-1 mt-1 text-[10px] text-orange-400 font-medium italic leading-tight"><StickyNote size={10} className="shrink-0 mt-[1px]" /> <span>{item.note}</span></div>
                )}
                <div className="flex items-center gap-2 mt-1">
                    <span className={`${isSelected ? 'text-purple-500' : (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')} font-bold text-xs`}>
                        {formatCurrency(item.price)} ₺
                    </span>
                </div>
            </div>

            {isSelectionMode ? (
                <div className={`flex items-center rounded-xl p-1 border ${isSelected ? 'bg-purple-500/20 border-purple-500/30' : (isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200')}`}>
                    <button
                        onClick={() => onToggleSelection(item.id, item.quantity, -1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isSelected ? 'text-purple-300 hover:bg-purple-500/30' : 'text-slate-500'}`}
                    >
                        <Minus size={14} />
                    </button>
                    <span className={`w-7 text-center text-sm font-bold font-mono ${isSelected ? 'text-purple-200' : (isDarkMode ? 'text-slate-500' : 'text-slate-700')}`}>
                        {selectedQty}
                    </span>
                    <button
                        onClick={() => onToggleSelection(item.id, item.quantity, 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isSelected ? 'text-purple-300 hover:bg-purple-500/30' : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black')}`}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <div className={`flex items-center rounded-lg border shadow-inner h-8 ${isDarkMode ? 'bg-[#0F131C] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className={`w-7 h-full flex items-center justify-center rounded-l-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}
                        >
                            <Minus size={14} />
                        </button>
                        <span className={`w-8 text-center text-sm font-bold font-mono leading-none pt-[1px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className={`w-7 h-full flex items-center justify-center rounded-r-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-black hover:bg-slate-200'}`}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-transparent hover:border-rose-500/30"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartItem;
