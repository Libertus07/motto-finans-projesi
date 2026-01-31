import { X, Sparkles, Moon, Star, Sun, Compass } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../../types';
import { useToast } from './ToastProvider';

interface TheOracleProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onAddToCart: (product: Product, options: any) => void;
    t: (key: string) => string;
}

const divinePhrases = [
    "Olimpos'un rüzgarları fısıldıyor...",
    "Yıldız tozları kaderinizi dokuyor...",
    "Antik metinlerdeki sırlar çözülüyor...",
    "Gök kubbe sizin için hizalanıyor...",
    "Kaderin kadehinden bir damla süzülüyor..."
];

const TheOracle: React.FC<TheOracleProps> = ({ isOpen, onClose, products, onAddToCart, t }) => {
    const { showToast } = useToast();
    const [isThinking, setIsThinking] = useState(false);
    const [prediction, setPrediction] = useState<Product | null>(null);
    const [phrase, setPhrase] = useState(divinePhrases[0]);

    // Constant stars data
    const stars = useMemo(() => [...Array(50)].map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5
    })), []);

    if (!isOpen) return null;

    const consultOracle = () => {
        if (isThinking) return;
        setIsThinking(true);
        setPrediction(null);

        // Cycle phrases with aura
        let phraseIndex = 0;
        const phraseInterval = setInterval(() => {
            phraseIndex = (phraseIndex + 1) % divinePhrases.length;
            setPhrase(divinePhrases[phraseIndex]);
        }, 1000);

        // Filter valid candidates
        const candidates = products.filter(p =>
            !p.category.toLowerCase().includes('su') &&
            !p.category.toLowerCase().includes('ekstra')
        );

        setTimeout(() => {
            clearInterval(phraseInterval);
            const randomProduct = candidates[Math.floor(Math.random() * candidates.length)];
            setPrediction(randomProduct);
            setIsThinking(false);
        }, 4000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#050302] overflow-hidden">
                {/* --- COSMIC NEBULA BACKGROUND --- */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Deep Nebula Layers */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#432818_0%,transparent_50%)] opacity-40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#D4AF37_0%,transparent_50%)] opacity-10"></div>

                    {/* Twinkling Stars */}
                    {stars.map((star) => (
                        <motion.div
                            key={star.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.3, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 3 + star.delay, ease: "easeInOut", delay: star.delay }}
                            className="absolute bg-white rounded-full shadow-[0_0_8px_white]"
                            style={{
                                width: star.size,
                                height: star.size,
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                            }}
                        />
                    ))}

                    {/* Mystical Constellation Lines (CSS only) */}
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.3 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            d="M 10 10 L 40 30 L 70 10 L 90 40"
                            stroke="#D4AF37"
                            strokeWidth="0.5"
                            fill="none"
                            strokeDasharray="5,5"
                        />
                    </svg>
                </div>

                <div className="relative w-full max-w-sm text-center z-10 flex flex-col items-center">
                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { onClose(); setPrediction(null); }}
                        className="absolute -top-12 right-0 text-white/30 hover:text-[#D4AF37] p-3 transition-colors"
                    >
                        <X size={28} strokeWidth={1.5} />
                    </motion.button>

                    {/* --- INITIAL STATE --- */}
                    {!prediction && !isThinking && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-64 h-64 relative mb-12 group cursor-pointer" onClick={consultOracle}>
                                {/* Rotating Sacred Geometry */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[1px] border-[#D4AF37]/20 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border-[1px] border-[#D4AF37]/40 rounded-full border-dashed"
                                />

                                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1a110d] to-[#050302] flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)] border border-[#D4AF37]/30 ring-4 ring-[#D4AF37]/5 overflow-hidden">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Compass size={80} strokeWidth={0.5} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-14">
                                <h2 className="text-5xl font-black text-[#D4AF37] font-cinzel tracking-[0.2em] uppercase leading-none">{t('oracle_title')}</h2>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                                    <span className="text-[10px] font-black text-[#D4AF37]/60 tracking-[0.5em] uppercase font-cinzel">İLAHİ GÖRÜŞ</span>
                                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                                </div>
                            </div>

                            <p className="text-[#FDFBF7]/50 font-cinzel text-sm max-w-[260px] leading-relaxed italic mb-12 px-4 whitespace-pre-line">
                                {t('oracle_desc')}
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={consultOracle}
                                className="group relative px-12 py-5 bg-gradient-to-br from-[#D4AF37] via-[#F5E6AD] to-[#BB9457] text-[#1a110d] rounded-2xl font-black font-cinzel tracking-[0.3em] shadow-[0_15px_40px_rgba(212,175,55,0.3)] overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3 text-xs">
                                    {t('consult_oracle').toUpperCase()} <Sparkles size={16} />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* --- THINKING STATE --- */}
                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-72 h-72 relative mb-16">
                                {/* Glowing Sacred Geometry Rings */}
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            rotate: i % 2 === 0 ? 360 : -360,
                                            scale: [1, 1.05, 1],
                                            opacity: [0.3, 0.6, 0.3]
                                        }}
                                        transition={{
                                            duration: 5 + i * 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="absolute inset-0 border-[1px] border-[#D4AF37] rounded-full"
                                        style={{
                                            margin: `${i * 20}px`,
                                            filter: 'blur(1px)'
                                        }}
                                    />
                                ))}

                                {/* Core Divine Light */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 0.8, 0.5]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-20 h-20 bg-[#D4AF37] rounded-full blur-[40px]"
                                    />
                                    <motion.div
                                        animate={{ scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute w-8 h-8 bg-white rounded-full blur-[5px] opacity-80 shadow-[0_0_30px_white]"
                                    />
                                </div>

                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                                    <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.5em] animate-pulse">BAĞLANILIYOR</span>
                                </div>
                            </div>

                            <motion.p
                                key={phrase}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[#D4AF37] font-cinzel text-xl font-black tracking-widest px-6"
                            >
                                {phrase.toUpperCase()}
                            </motion.p>
                        </motion.div>
                    )}

                    {/* --- PREDICTION STATE --- */}
                    {prediction && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="relative w-full"
                        >
                            {/* Divine aura */}
                            <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>

                            <div className="bg-[#1a110d] p-1 rounded-[3.5rem] border border-[#D4AF37]/40 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                                <div className="relative bg-[#050302] border border-white/5 rounded-[3.3rem] p-8">

                                    <div className="flex flex-col items-center mb-10">
                                        <div className="flex items-center gap-3 text-[#D4AF37] text-[10px] font-black tracking-[0.6em] mb-3">
                                            <Star size={12} fill="currentColor" className="animate-pulse" />
                                            KADERİNİZİN SEÇİMİ
                                            <Star size={12} fill="currentColor" className="animate-pulse" />
                                        </div>
                                        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
                                    </div>

                                    {/* Product Visual */}
                                    <div className="aspect-square w-full max-w-[200px] mx-auto bg-gradient-to-br from-[#111] to-[#050505] rounded-[2.5rem] flex items-center justify-center text-[5.5rem] mb-8 relative border border-[#D4AF37]/10 shadow-[inner_0_0_30px_rgba(0,0,0,0.5)] group/img overflow-hidden">
                                        <motion.span
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="relative z-10 drop-shadow-[0_15px_30px_rgba(212,175,55,0.4)]"
                                        >
                                            {prediction.image}
                                        </motion.span>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-white/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000"></div>
                                    </div>

                                    <h3 className="text-3xl font-black text-white font-cinzel leading-tight tracking-tight mb-4 px-2 select-none uppercase">
                                        {prediction.name}
                                    </h3>

                                    <div className="flex flex-col items-center mb-10">
                                        <span className="text-[9px] font-black text-[#BB9457] tracking-[0.4em] mb-1 opacity-60">KEHANET BEDELİ</span>
                                        <div className="text-3xl font-black text-[#D4AF37] font-cinzel leading-none select-none">
                                            {prediction.price} <span className="text-sm">₺</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                onAddToCart(prediction, {});
                                                onClose();
                                                setPrediction(null);
                                                showToast("Kaderin seçimi kucaklandı. ✨", 'success');
                                            }}
                                            className="group relative h-16 bg-[#D4AF37] text-[#1a110d] rounded-2xl font-black font-cinzel tracking-[0.2em] shadow-[0_20px_40px_rgba(212,175,55,0.3)] overflow-hidden flex items-center justify-center"
                                        >
                                            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            <span className="relative z-10 flex items-center gap-2 text-sm">
                                                <Sparkles size={18} /> {t('accept').toUpperCase()}
                                            </span>
                                        </motion.button>

                                        <button
                                            onClick={() => { setPrediction(null); consultOracle(); }}
                                            className="h-12 text-[#D4AF37]/40 hover:text-[#D4AF37] font-cinzel text-[10px] font-black tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-2"
                                        >
                                            <Moon size={14} /> KEHANETİ YENİLE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AnimatePresence>
    );
};

export default TheOracle;

