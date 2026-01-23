import { X, Sparkles, Moon, Star } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Product } from '../../../types';
import { useToast } from './ToastProvider';

interface TheOracleProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onAddToCart: (product: Product, options: any) => void;
    t: (key: string) => string;
}

const mysteriousPhrases = [
    "Yıldızlar hizalanıyor...",
    "Kaderin iplikleri dokunuyor...",
    "Eski metinler okunuyor...",
    "Cevap sislerin ardında...",
    "Evrenin fısıltısı dinleniyor..."
];

// Constant stars defined outside to satisfy purity rules
const STARS_DATA = [...Array(40)].map((_, i) => ({
    id: i,
    width: (Math.floor(Math.random() * 2) + 1) + 'px',
    height: (Math.floor(Math.random() * 2) + 1) + 'px',
    top: (Math.floor(Math.random() * 100)) + '%',
    left: (Math.floor(Math.random() * 100)) + '%',
    animationDelay: (Math.floor(Math.random() * 4)) + 's'
}));

const TheOracle: React.FC<TheOracleProps> = ({ isOpen, onClose, products, onAddToCart, t }) => {
    const { showToast } = useToast();
    const [isThinking, setIsThinking] = useState(false);
    const [prediction, setPrediction] = useState<Product | null>(null);
    const [phrase, setPhrase] = useState(mysteriousPhrases[0]);

    if (!isOpen) return null;

    const consultOracle = () => {
        if (isThinking) return;
        setIsThinking(true);
        setPrediction(null);

        // Cycle phrases
        let phraseIndex = 0;
        const phraseInterval = setInterval(() => {
            phraseIndex = (phraseIndex + 1) % mysteriousPhrases.length;
            setPhrase(mysteriousPhrases[phraseIndex]);
        }, 800);

        const candidates = products.filter(p => !p.category.includes('Su') && !p.category.includes('Ekstra'));

        setTimeout(() => {
            clearInterval(phraseInterval);
            const randomProduct = candidates[Math.floor(Math.random() * candidates.length)];
            setPrediction(randomProduct);
            setIsThinking(false);
        }, 3500);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#050302] animate-in fade-in duration-700">
            {/* Cosmic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] animate-[pulse_10s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 bg-[#050302] opacity-40"></div>
                {STARS_DATA.map((star) => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full opacity-0 animate-[twinkle_4s_ease-in-out_infinite]"
                        style={{
                            width: star.width,
                            height: star.height,
                            top: star.top,
                            left: star.left,
                            animationDelay: star.animationDelay,
                            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                        }}
                    ></div>
                ))}
                {/* Mystical Energy Lines */}
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" className="animate-[pulse_15s_linear_infinite]">
                        <defs>
                            <linearGradient id="mystic-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#D4AF37" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        {[...Array(5)].map((_, i) => (
                            <path
                                key={i}
                                d={`M ${-100 + i * 50} ${200 + i * 100} Q ${500} ${500} ${1200} ${200 + i * 50}`}
                                stroke="url(#mystic-line)"
                                strokeWidth="0.5"
                                fill="none"
                                className="animate-[shimmer_10s_linear_infinite]"
                                style={{ animationDelay: `${i * 2}s` }}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            <div className="relative w-full max-w-sm text-center z-10 p-6">
                <button
                    onClick={() => { onClose(); setPrediction(null); }}
                    className="absolute -top-16 right-4 text-white/40 hover:text-[#D4AF37] transition-all p-3 bg-white/5 rounded-full hover:scale-110 active:scale-90"
                >
                    <X size={24} />
                </button>

                {!prediction && !isThinking && (
                    <div className="animate-in zoom-in slide-in-from-bottom-12 duration-1000">
                        <div className="w-56 h-56 mx-auto mb-10 relative group cursor-pointer" onClick={consultOracle}>
                            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full animate-ping duration-[4s]"></div>
                            <div className="absolute inset-4 border-2 border-[#D4AF37]/20 border-dashed rounded-full animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute inset-8 border border-[#D4AF37]/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                            <div className="absolute inset-0 border-2 border-[#D4AF37]/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-700 bg-gradient-to-br from-[#0a0a0a]/80 to-[#050302]/80 backdrop-blur-xl shadow-2xl">
                                <Sparkles size={80} className="text-[#D4AF37] opacity-90 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" strokeWidth={0.5} />
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-12">
                            <h2 className="text-5xl font-black text-[#D4AF37] font-cinzel leading-none tracking-[0.2em] uppercase drop-shadow-2xl">{t('oracle_title')}</h2>
                            <p className="text-[#D4AF37]/50 font-cinzel text-xs font-black tracking-[0.4em] uppercase">KADERİN FISILTISI</p>
                        </div>

                        <p className="text-[#FDFBF7]/60 mb-12 font-cinzel text-sm max-w-[240px] mx-auto leading-relaxed italic">
                            {t('oracle_desc')}
                        </p>

                        <button
                            onClick={consultOracle}
                            className="group relative px-14 py-6 bg-gradient-to-br from-[#D4AF37] via-[#FDFBF7] to-[#B8860B] text-[#050302] rounded-2xl font-black font-cinzel shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:shadow-[0_30px_60px_rgba(212,175,55,0.5)] hover:scale-110 active:scale-95 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative tracking-[0.3em] text-sm uppercase flex items-center gap-3">
                                {t('consult_oracle')} <Moon size={18} fill="currentColor" />
                            </span>
                        </button>
                    </div>
                )}

                {isThinking && (
                    <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
                        <div className="w-64 h-64 mx-auto mb-12 relative">
                            {/* Mystical Orbs Layered */}
                            <div className="absolute inset-0 border-2 border-[#D4AF37]/40 rounded-full animate-[spin_5s_linear_infinite]"></div>
                            <div className="absolute inset-4 border-2 border-[#D4AF37]/30 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                            <div className="absolute inset-8 border-2 border-[#D4AF37]/20 rounded-full animate-[spin_12s_linear_infinite]"></div>

                            {/* Glowing Center */}
                            <div className="absolute inset-[35%] bg-[#D4AF37] rounded-full blur-[40px] animate-pulse"></div>
                            <div className="absolute inset-[42%] bg-white rounded-full blur-[10px] opacity-80 animate-pulse"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <Sparkles size={48} className="text-[#D4AF37] animate-[bounce_2s_infinite] drop-shadow-[0_0_15px_#D4AF37]" strokeWidth={1} />
                                <div className="text-[10px] text-[#D4AF37] font-black tracking-[0.5em] uppercase">OKUNUYOR</div>
                            </div>
                        </div>
                        <p className="text-[#D4AF37] font-cinzel text-xl tracking-[0.2em] font-black animate-pulse h-12 uppercase drop-shadow-lg">
                            {phrase}
                        </p>
                    </div>
                )}

                {prediction && (
                    <div className="relative animate-in zoom-in slide-in-from-bottom-24 duration-700">
                        {/* Divine light effect */}
                        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)] blur-3xl rounded-full -z-10 animate-pulse"></div>

                        <div className="bg-gradient-to-br from-[#1a110d] via-[#0a0a0a] to-[#1a110d] p-1 rounded-[3rem] border border-[#D4AF37]/40 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                            <div className="relative bg-[#050302]/90 backdrop-blur-3xl rounded-[2.8rem] p-8 text-left overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[60px] -mr-24 -mt-24 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-[40px] -ml-16 -mb-16"></div>

                                <div className="text-center mb-8">
                                    <div className="inline-flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em] font-cinzel">
                                            <Star size={12} fill="currentColor" />
                                            {t('stars_choice')}
                                            <Star size={12} fill="currentColor" />
                                        </div>
                                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mt-2"></div>
                                    </div>
                                </div>

                                <div className="aspect-square bg-[#111] rounded-[2rem] flex items-center justify-center text-7xl mb-8 relative group overflow-hidden border border-[#D4AF37]/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-white/5"></div>
                                    <div className="absolute inset-4 border border-[#D4AF37]/10 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <span className="relative drop-shadow-[0_10px_30px_rgba(212,175,55,0.6)] transform group-hover:scale-125 transition-transform duration-1000 ease-out">
                                        {prediction.image}
                                    </span>
                                </div>

                                <h3 className="text-center font-black text-3xl text-white font-cinzel mb-3 leading-tight tracking-tight px-2">
                                    {prediction.name}
                                </h3>

                                <div className="flex flex-col items-center mb-10">
                                    <span className="text-[10px] text-[#D4AF37] font-black tracking-[0.4em] uppercase mb-1 opacity-60">KEHANET BEDELİ</span>
                                    <p className="text-[#D4AF37] text-2xl font-black font-cinzel leading-none">
                                        {prediction.price} ₺
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        onAddToCart(prediction, {});
                                        onClose();
                                        setPrediction(null);
                                        showToast("Kaderin seçimi kucaklandı. ✨", 'success');
                                    }}
                                    className="group w-full relative h-16 bg-[#D4AF37] text-[#050302] rounded-2xl font-black font-cinzel shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all overflow-hidden flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <div className="relative flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
                                        <Sparkles size={20} className="animate-pulse" />
                                        {t('accept').toUpperCase()}
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setPrediction(null); consultOracle(); }}
                                    className="w-full mt-4 text-[#D4AF37]/50 hover:text-[#D4AF37] font-cinzel text-[10px] font-black tracking-[0.3em] uppercase transition-colors"
                                >
                                    BAŞKA BİR KEHANET ARA
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default TheOracle;
