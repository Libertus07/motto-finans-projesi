import React from 'react';
import { Flame } from 'lucide-react';

interface SpiritOfOlimposProps {
    message?: string;
}

const SpiritOfOlimpos: React.FC<SpiritOfOlimposProps> = ({
    message = "Olimpos'un ateşi seni korusun."
}) => {
    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-black/80 backdrop-blur-xl border border-[#D4AF37]/20 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                    <Flame size={20} />
                </div>
                <h3 className="font-cinzel font-black text-[#D4AF37] tracking-widest text-sm uppercase">
                    OLİMPOS RUHU
                </h3>
            </div>
            <div className="relative z-10 text-[#FDFBF7]/80 italic">
                {message}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-white/5 pointer-events-none" />
        </div>
    );
};

export default SpiritOfOlimpos;
