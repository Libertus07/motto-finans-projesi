import React from 'react';

const CoffeeLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-24 h-24 mb-6">
                {/* Cup Body */}
                <div className="absolute bottom-0 left-0 w-24 h-16 bg-[#FDFBF7] border-4 border-[#432818] rounded-b-[3rem] overflow-hidden shadow-xl z-10 box-border">
                    {/* Coffee Liquid */}
                    <div className="absolute bottom-0 left-0 w-full bg-[#432818] animate-fill-coffee origin-bottom"></div>
                    {/* Smoke/Steam */}
                    <div className="absolute top-0 left-1/4 w-2 h-0 bg-white/20 blur-sm animate-steam-1"></div>
                    <div className="absolute top-0 left-1/2 w-2 h-0 bg-white/20 blur-sm animate-steam-2"></div>
                    <div className="absolute top-0 left-3/4 w-2 h-0 bg-white/20 blur-sm animate-steam-3"></div>
                </div>
                {/* Cup Handle */}
                <div className="absolute top-2 -right-4 w-8 h-10 border-4 border-[#432818] rounded-r-2xl border-l-0 z-0"></div>
                {/* Saucer */}
                <div className="absolute -bottom-2 -left-4 w-32 h-2 bg-[#432818] rounded-full z-0 opacity-20 transform scale-x-0 animate-expand-saucer"></div>
            </div>

            <div className="text-center">
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] font-cinzel block mb-2 animate-pulse">OLIMPOS</span>
                <p className="text-[#432818] text-sm font-bold font-cinzel tracking-widest animate-pulse opacity-80">HAZIRLANIYOR...</p>
            </div>

            <style>{`
                @keyframes fill-coffee {
                    0% { height: 0%; opacity: 0.5; }
                    50% { height: 70%; opacity: 1; }
                    100% { height: 85%; opacity: 1; }
                }
                @keyframes steam-1 {
                    0% { height: 0; opacity: 0; transform: translateY(0) scaleX(1); }
                    50% { height: 20px; opacity: 0.5; }
                    100% { height: 40px; opacity: 0; transform: translateY(-30px) scaleX(2); }
                }
                @keyframes steam-2 {
                    0% { height: 0; opacity: 0; transform: translateY(0) scaleX(1); }
                    50% { height: 30px; opacity: 0.5; }
                    100% { height: 50px; opacity: 0; transform: translateY(-40px) scaleX(2); }
                }
                @keyframes steam-3 {
                    0% { height: 0; opacity: 0; transform: translateY(0) scaleX(1); }
                    50% { height: 15px; opacity: 0.5; }
                    100% { height: 35px; opacity: 0; transform: translateY(-25px) scaleX(2); }
                }
                @keyframes expand-saucer {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .animate-fill-coffee { animation: fill-coffee 2s ease-out infinite alternate; }
                .animate-steam-1 { animation: steam-1 2s ease-out infinite 0.5s; }
                .animate-steam-2 { animation: steam-2 2s ease-out infinite 1s; }
                .animate-steam-3 { animation: steam-3 2s ease-out infinite 1.5s; }
                .animate-expand-saucer { animation: expand-saucer 1s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CoffeeLoader;
