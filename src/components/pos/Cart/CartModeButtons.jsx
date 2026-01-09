// components/pos/Cart/CartModeButtons.jsx
import React from 'react';
import { ListChecks, PieChart, Scissors } from 'lucide-react';
import ToolButton from '../shared/ToolButton';

const CartModeButtons = ({ 
    isDarkMode,
    isSelectionMode,
    isPartialMode,
    splitCount,
    onSelectionToggle,
    onPartialClick,
    onSplitClick
}) => {
    return (
        <div className={`grid grid-cols-5 gap-2 p-2 border-t shrink-0 ${
            isDarkMode 
                ? 'border-white/5 bg-[#141824]/30' 
                : 'border-slate-200 bg-white'
        }`}>
            {/* SEÇİM MODU */}
            <ToolButton 
                icon={ListChecks} 
                label="Seç" 
                active={isSelectionMode} 
                colorClass="bg-purple-600 border-purple-500" 
                iconColor="text-purple-400" 
                disabled={isPartialMode} 
                onClick={onSelectionToggle}
                isDarkMode={isDarkMode}
            />

            {/* PARÇALI ÖDEME */}
            <ToolButton 
                icon={PieChart} 
                label="Parçalı" 
                active={isPartialMode} 
                colorClass="bg-pink-600 border-pink-500" 
                iconColor="text-pink-400" 
                disabled={isSelectionMode} 
                onClick={onPartialClick}
                isDarkMode={isDarkMode}
            />

            {/* BÖLME */}
            <ToolButton 
                icon={Scissors} 
                label={splitCount > 1 ? `${splitCount}` : "Böl"} 
                active={splitCount > 1} 
                colorClass="bg-blue-600 border-blue-500" 
                iconColor="text-blue-400" 
                disabled={isSelectionMode || isPartialMode} 
                onClick={onSplitClick}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

export default CartModeButtons;