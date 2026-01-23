import React from 'react';
import { Smartphone } from 'lucide-react';

interface NewTransaction {
    cardBank?: string | null;
    [key: string]: any;
}

interface BankSelectorProps {
    newTrans: NewTransaction;
    setNewTrans: (trans: any) => void;
}

// 👇 BANKA SEÇİM BİLEŞENİ
const BankSelector: React.FC<BankSelectorProps> = ({ newTrans, setNewTrans }) => {
    const bankOptions = [
        { key: 'ziraat', label: 'ZİRAAT', color: 'bg-red-600 border-red-500' },
        { key: 'halk', label: 'HALK', color: 'bg-blue-600 border-blue-500' },
        { key: 'iban', label: 'DİĞER', icon: <Smartphone size={14} />, color: 'bg-purple-600 border-purple-500' },
    ];
    return (
        <div className="grid grid-cols-3 gap-2">
            {bankOptions.map(option => (
                <button
                    key={option.key}
                    onClick={() => setNewTrans({ ...newTrans, cardBank: option.key })}
                    className={`p-2.5 rounded-lg text-xs font-bold border transition-all
                        ${newTrans.cardBank === option.key ? `${option.color} text-white` : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    {option.icon} {option.label}
                </button>
            ))}
        </div>
    );
};

export default BankSelector;
