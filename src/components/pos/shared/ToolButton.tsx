// components/pos/shared/ToolButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    icon: LucideIcon;
    label: string;
    colorClass?: string;
    iconColor?: string;
    isDarkMode: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({
    onClick,
    active,
    disabled,
    icon: Icon,
    label,
    colorClass,
    iconColor,
    isDarkMode
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            group relative w-full h-[60px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300
            ${active
                ? `${colorClass} shadow-lg scale-105 z-10 border-t border-white/20`
                : (isDarkMode
                    ? 'bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-200')
            }
            ${disabled ? 'opacity-30 cursor-not-allowed hover:translate-y-0' : 'hover:-translate-y-0.5'}
        `}
    >
        <Icon size={18} className={active ? 'text-white' : (iconColor || (isDarkMode ? 'text-slate-400' : 'text-slate-500'))} />
        <span className={`text-[9px] font-bold tracking-wide uppercase ${active ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-600')}`}>
            {label}
        </span>
    </button>
);

export default ToolButton;
