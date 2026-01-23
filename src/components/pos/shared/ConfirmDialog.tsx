// components/pos/shared/ConfirmDialog.tsx
import React from 'react';
import { HelpCircle, AlertTriangle, LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'question' | 'warning' | 'danger';
    isDarkMode: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    type = 'question',
    isDarkMode
}) => {
    if (!isOpen) return null;

    const themes: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
        question: { icon: HelpCircle, color: 'indigo', bg: 'bg-indigo-500/10' },
        warning: { icon: AlertTriangle, color: 'amber', bg: 'bg-amber-500/10' },
        danger: { icon: AlertTriangle, color: 'rose', bg: 'bg-rose-500/10' }
    };

    const theme = themes[type];
    const Icon = theme.icon;

    return (
        <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className={`
                w-full max-w-[340px] rounded-[40px] shadow-2xl overflow-hidden border
                scale-in-center transition-all duration-500
                ${isDarkMode ? 'bg-[#151921] border-white/5' : 'bg-white border-slate-200'}
            `}>
                <div className="p-8 flex flex-col items-center text-center">
                    {/* ICON BOX */}
                    <div className={`w-20 h-20 rounded-[30px] ${theme.bg} flex items-center justify-center mb-6`}>
                        <Icon size={40} className={`text-${theme.color}-500`} />
                    </div>

                    <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {message}
                    </p>

                    {/* ACTIONS */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-8">
                        <button
                            onClick={onCancel}
                            className={`h-14 rounded-2xl font-bold text-sm transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            İPTAL
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`h-14 rounded-2xl font-black text-sm text-white shadow-lg transition-all active:scale-95 bg-${theme.color}-600 shadow-${theme.color}-500/30`}
                        >
                            ONAYLA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
