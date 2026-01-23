import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full fade-in duration-300 ${toast.type === 'success' ? 'bg-[#432818] text-[#D4AF37] border border-[#D4AF37]/20' :
                                toast.type === 'error' ? 'bg-red-900 text-white border border-red-700/50' :
                                    'bg-[#FDFBF7] text-[#432818] border border-[#432818]/10'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="shrink-0" size={20} />}
                        {toast.type === 'error' && <AlertCircle className="shrink-0" size={20} />}
                        {toast.type === 'info' && <Info className="shrink-0" size={20} />}

                        <p className="text-sm font-bold font-cinzel flex-1">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
