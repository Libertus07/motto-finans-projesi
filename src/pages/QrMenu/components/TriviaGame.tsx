import React, { useState, useEffect } from 'react';
import { Trophy, Zap, ArrowRight, CheckCircle2, XCircle, X, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Question {
    question: string;
    options: string[];
    correct: number;
}

const questions: Question[] = [
    {
        question: "Motto'nun en popüler kahvesi hangisidir?",
        options: ["Latte", "Flat White", "Americano", "Filter Coffee"],
        correct: 1
    },
    {
        question: "Espresso bazlı kahvelerde sütün en ince dokulu hali hangisidir?",
        options: ["Cappuccino", "Macchiato", "Flat White", "Cortado"],
        correct: 2
    },
    {
        question: "Motto Golden Age hangi yıl kurulmuştur?",
        options: ["2022", "2023", "2024", "2025"],
        correct: 1
    },
    {
        question: "Hangi mısır tanrısı Motto logosuna ilham vermiştir?",
        options: ["Ra", "Osiris", "Anubis", "Thoth"],
        correct: 0
    },
    {
        question: "Baristalarımızın 'altın vuruşu' dediği işlem hangisidir?",
        options: ["Tamping", "Extraction", "Milk Texturing", "Perfect Shot"],
        correct: 3
    }
];


const facts = [
    "Kahvenin keşfi 9. yüzyıla, Etyopya'ya dayanır.",
    "Dünyada petrolden sonra en çok ticareti yapılan ürün kahvedir.",
    "Espresso, İtalyanca'da 'preslenmiş' anlamına gelir.",
    "Motto kahveleri %100 Arabica çekirdeklerinden üretilir.",
    "Bir fincan kahve, günlük B2 vitamini ihtiyacının %11'ini karşılar."
];

interface TriviaGameProps {
    isOpen: boolean;
    onClose: () => void;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ isOpen, onClose }) => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [randomFact, setRandomFact] = useState<string>("");

    // Reset game state when opening
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setGameState('start');
                setCurrentQuestion(0);
                setScore(0);
                setSelectedAnswer(null);
                setIsCorrect(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        const correct = index === questions[currentQuestion].correct;
        setIsCorrect(correct);
        if (correct) setScore(score + 20);

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                if (score + (correct ? 20 : 0) >= 60) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#D4AF37', '#FDFBF7', '#432818']
                    });
                }
                setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
                setGameState('result');
            }
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050302]/95 backdrop-blur-2xl"
                    />

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm relative z-10"
                    >
                        {/* Floating Close Button - Centered above */}
                        <button
                            onClick={onClose}
                            className="absolute -top-16 right-0 left-0 mx-auto w-10 h-10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] transition-all bg-white/5 rounded-full hover:scale-110 active:scale-90 ring-1 ring-white/10 hover:ring-[#D4AF37]/50"
                        >
                            <X size={20} />
                        </button>

                        <div className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative border border-[#D4AF37]/20 shadow-[0_0_80px_rgba(212,175,55,0.1)]">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-50 pointer-events-none" />
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-[60px] pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#432818]/30 rounded-full blur-[60px] pointer-events-none" />

                            <div className="relative p-8 min-h-[460px] flex flex-col">
                                {gameState === 'start' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-[#D4AF37] blur-[40px] opacity-20 animate-pulse" />
                                            <div className="w-24 h-24 bg-gradient-to-br from-[#1a110d] to-[#0a0a0a] rounded-3xl flex items-center justify-center border border-[#D4AF37]/30 shadow-2xl relative z-10 group">
                                                <BrainCircuit size={48} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black text-[#FDFBF7] font-cinzel tracking-wider">MOTTO<br /><span className="text-[#D4AF37]">TRIVIA</span></h3>
                                            <div className="h-px w-10 bg-[#D4AF37]/50 mx-auto" />
                                            <p className="text-[#FDFBF7]/50 text-xs font-medium tracking-[0.2em] uppercase leading-relaxed max-w-[200px] mx-auto">
                                                Bilgeliğini Kanıtla<br />Kaderini Çiz
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setGameState('playing')}
                                            className="w-full bg-[#D4AF37] text-[#0a0a0a] py-5 rounded-2xl font-black font-cinzel tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            BAŞLA
                                        </button>
                                    </motion.div>
                                )}

                                {gameState === 'playing' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        {/* Header / Stats */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                <span className="text-[10px] font-black text-[#FDFBF7]/40 tracking-widest">SORU</span>
                                                <span className="text-sm font-black text-[#D4AF37] font-cinzel">{currentQuestion + 1}<span className="text-[#FDFBF7]/20 text-[10px] font-sans mx-0.5">/</span>{questions.length}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                <Zap size={12} className="text-[#D4AF37]" fill="currentColor" />
                                                <span className="text-sm font-black text-[#FDFBF7] font-cinzel">{score}</span>
                                            </div>
                                        </div>

                                        {/* Question Area */}
                                        <div className="flex-1 flex flex-col justify-center mb-8 relative">
                                            <motion.h4
                                                key={currentQuestion}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-xl text-center font-bold text-[#FDFBF7] font-cinzel leading-relaxed"
                                            >
                                                {questions[currentQuestion].question}
                                            </motion.h4>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-3">
                                            {questions[currentQuestion].options.map((option, index) => {
                                                const isSelected = selectedAnswer === index;
                                                const isCorrectAnswer = index === questions[currentQuestion].correct;
                                                const showResult = selectedAnswer !== null;

                                                const cardStyle = showResult
                                                    ? (isSelected
                                                        ? (isCorrect
                                                            ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                                            : "bg-red-500/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]")
                                                        : (isCorrectAnswer
                                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                                            : "bg-white/5 border-white/5 opacity-50"))
                                                    : "bg-white/5 border-white/10 hover:bg-white/10";

                                                const textStyle = "text-[#FDFBF7]/80";

                                                return (
                                                    <motion.button
                                                        key={index}
                                                        disabled={showResult}
                                                        onClick={() => handleAnswer(index)}
                                                        whileHover={!showResult ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                                                        whileTap={!showResult ? { scale: 0.98 } : {}}
                                                        className={`w-full p-4 rounded-xl border flex items-center justify-center group transition-all duration-300 relative overflow-hidden ${cardStyle}`}
                                                    >
                                                        <span className={`text-sm font-bold tracking-wide transition-colors text-center ${textStyle} ${isSelected && isCorrect ? 'text-emerald-400' : ''} ${isSelected && !isCorrect ? 'text-red-400' : ''}`}>
                                                            {option}
                                                        </span>

                                                        {showResult && isSelected && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                    {isCorrect ?
                                                                        <CheckCircle2 size={18} className="text-emerald-500" /> :
                                                                        <XCircle size={18} className="text-red-500" />
                                                                    }
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {gameState === 'result' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex-1 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-[#D4AF37] blur-[50px] opacity-20 animate-pulse" />
                                            <Trophy size={64} className="text-[#D4AF37] drop-shadow-2xl relative z-10" />
                                        </div>

                                        <h3 className="text-3xl font-black text-[#FDFBF7] font-cinzel mb-2 tracking-wide">
                                            {score >= 60 ? 'MUHTEŞEM!' : 'TAMAMLANDI'}
                                        </h3>
                                        <p className="text-[#FDFBF7]/40 text-xs tracking-[0.2em] font-medium uppercase mb-8">
                                            Oyun Sona Erdi
                                        </p>

                                        <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#432818]/30 px-10 py-6 rounded-3xl border border-[#D4AF37]/20 mb-10 relative overflow-hidden w-full">
                                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
                                            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-30" />
                                            <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black block mb-2">Toplam Puan</span>
                                            <span className="text-5xl font-black text-[#FDFBF7] font-cinzel tracking-tighter shadow-black drop-shadow-lg">{score}</span>
                                        </div>

                                        <div className="mb-10 max-w-[280px]">
                                            <div className="flex items-center justify-center gap-2 mb-3 opacity-60">
                                                <Sparkles size={12} className="text-[#D4AF37]" />
                                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">BİLİYOR MUYDUNUZ?</span>
                                                <Sparkles size={12} className="text-[#D4AF37]" />
                                            </div>
                                            <p className="text-[#FDFBF7]/80 text-xs font-medium italic leading-relaxed text-center">
                                                "{randomFact}"
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setGameState('start');
                                                setCurrentQuestion(0);
                                                setScore(0);
                                                setSelectedAnswer(null);
                                                setIsCorrect(null);
                                            }}
                                            className="w-full bg-white text-black py-4 rounded-xl font-black font-cinzel tracking-[0.2em] hover:bg-[#FDFBF7] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group shadow-xl"
                                        >
                                            TEKRAR DENE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TriviaGame;
