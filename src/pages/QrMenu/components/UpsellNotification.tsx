import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../../../types';

interface UpsellNotificationProps {
    upsellItem: Product | null;
    onClose: () => void;
    onAdd: (item: Product) => void;
}

const UpsellNotification: React.FC<UpsellNotificationProps> = ({ upsellItem, onClose, onAdd }) => {

    if (!upsellItem) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-[#432818] rounded-2xl p-4 shadow-2xl border border-[#D4AF37] flex items-center gap-4 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-[#D4AF37]/50 hover:text-[#D4AF37]"><X size={14} /></button>
                <div className="w-12 h-12 bg-[#FDFBF7] rounded-lg flex items-center justify-center text-2xl shrink-0">
                    {upsellItem.image}
                </div>
                <div className="flex-1">
                    <h4 className="text-[#D4AF37] font-bold font-cinzel text-sm mb-0.5">Kahven yalnız kalmasın?</h4>
                    <p className="text-[#FDFBF7]/80 text-[10px] leading-tight">Yanına {upsellItem.name} çok yakışır.</p>
                </div>
                <button
                    onClick={() => {
                        onAdd(upsellItem);
                    }}
                    className="bg-[#D4AF37] text-[#432818] px-3 py-2 rounded-lg text-xs font-bold font-cinzel whitespace-nowrap"
                >
                    Ekle +{upsellItem.price}₺
                </button>
            </div>
        </div>
    );
};

export default UpsellNotification;
