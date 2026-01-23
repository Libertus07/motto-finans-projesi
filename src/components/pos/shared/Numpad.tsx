// components/pos/shared/Numpad.tsx
import React from 'react';
import { Delete } from 'lucide-react';

interface NumpadProps {
    onInput: (value: number | string) => void;
    showDot?: boolean;
    isDarkMode?: boolean;
}

const Numpad: React.FC<NumpadProps> = ({
    onInput,
    showDot = true,
    isDarkMode = true
}) => {
    const buttons = showDot
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 'CLR', 0];

    const handleClick = (value: number | string) => {
        if (value === 'CLR') {
            onInput('C');
        } else {
            onInput(value);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {buttons.map((num, index) => (
                <button
                    key={index}
                    onClick={() => handleClick(num)}
                    className={`
                        h-14 rounded-xl font-bold text-xl
                        border transition-all active:scale-95 shadow-lg
                        ${num === 'CLR'
                            ? (isDarkMode
                                ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 border-orange-500/30'
                                : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200')
                            : (isDarkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/5'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200')
                        }
                    `}
                >
                    {num === 'CLR' ? 'C' : num}
                </button>
            ))}

            {/* BACKSPACE BUTONU */}
            <button
                onClick={() => onInput('BACK')}
                className={`
                    h-14 rounded-xl flex items-center justify-center
                    transition-all active:scale-95
                    ${isDarkMode
                        ? 'bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200'}
                `}
            >
                <Delete size={24} />
            </button>
        </div>
    );
};

export default Numpad;
