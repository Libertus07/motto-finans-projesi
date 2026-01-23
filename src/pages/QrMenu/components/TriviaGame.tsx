import React, { useState } from 'react';
import { HelpCircle, Trophy, Zap, ArrowRight, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';
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
                setGameState('result');
            }
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#050302]/95 backdrop-blur-2xl animate-in fade-in duration-700 overflow-y-auto">
            <div className="w-full max-w-sm relative">
                {/* Close Button */}
                <button
                    onClick={() => {
                        onClose();
                        setGameState('start');
                        setCurrentQuestion(0);
                        setScore(0);
                        setSelectedAnswer(null);
                        setIsCorrect(null);
                    }}
                    className="absolute -top-16 right-0 text-white/40 hover:text-[#D4AF37] transition-all p-3 bg-white/5 rounded-full hover:scale-110 active:scale-90 z-50"
                >
                    <X size={24} />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/80 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] relative border border-[#D4AF37]/30 min-h-[350px] flex flex-col p-8"
                >
                    {/* 🏛️ Divine Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                    <AnimatePresence mode="wait">
                        {gameState === 'start' && (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center z-10"
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-[#D4AF37]/20 blur-2xl rounded-full animate-ping"></div>
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#1a110d] to-[#432818] rounded-[2rem] flex items-center justify-center shadow-2xl border border-[#D4AF37]/40 relative z-10">
                                        <Sparkles size={48} className="text-[#D4AF37]" />
                                    </div>
                                </div>

                                <h3 className="text-[#D4AF37] font-black font-cinzel text-3xl mb-3 tracking-[0.2em]">MOTTO TRIVIA</h3>
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mb-6 mx-auto"></div>

                                <p className="text-[#FDFBF7]/60 text-xs mb-10 max-w-[240px] font-bold leading-relaxed uppercase tracking-[0.3em]">
                                    Bilgeliğini kanıtla, <span className="text-[#D4AF37]">Volt</span> puanları topla!
                                </p>

                                <button
                                    onClick={() => setGameState('playing')}
                                    className="group relative bg-[#D4AF37] text-[#0a0a0a] px-12 py-5 rounded-2xl font-black font-cinzel text-sm tracking-[0.2em] shadow-[0_15px_40px_rgba(212,175,55,0.3)] hover:scale-110 active:scale-95 transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    KADERİNİ BAŞLAT
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'playing' && (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col z-10"
                            >
                                {/* Progress Header */}
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex gap-2">
                                        {questions.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 w-10 rounded-full transition-all duration-500 shadow-sm ${i === currentQuestion ? 'bg-[#D4AF37] w-14' :
                                                    i < currentQuestion ? 'bg-[#D4AF37]/40' : 'bg-white/10'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-[#D4AF37]/20 shadow-inner">
                                        <Zap size={14} className="text-[#D4AF37] animate-pulse" fill="currentColor" />
                                        <span className="text-[#D4AF37] font-black text-sm font-cinzel">{score}</span>
                                    </div>
                                </div>

                                <motion.h4
                                    key={currentQuestion}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[#FDFBF7] font-black font-cinzel text-xl mb-10 leading-relaxed tracking-wide"
                                >
                                    {questions[currentQuestion].question}
                                </motion.h4>

                                <div className="grid grid-cols-1 gap-4">
                                    {questions[currentQuestion].options.map((option, index) => {
                                        let style = "bg-white/5 border-white/10 text-[#FDFBF7]/80";
                                        if (selectedAnswer === index) {
                                            style = isCorrect
                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                                : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
                                        } else if (selectedAnswer !== null && index === questions[currentQuestion].correct) {
                                            style = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400/70";
                                        }

                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={selectedAnswer === null ? { x: 5, backgroundColor: 'rgba(212, 175, 55, 0.05)', borderColor: 'rgba(212, 175, 55, 0.3)' } : {}}
                                                disabled={selectedAnswer !== null}
                                                onClick={() => handleAnswer(index)}
                                                className={`w-full p-5 rounded-[1.5rem] border text-left font-black font-cinzel text-xs transition-all flex items-center justify-between group overflow-hidden relative ${style}`}
                                            >
                                                <span className="relative z-10">{option}</span>
                                                {selectedAnswer === index && (
                                                    <div className="relative z-10">
                                                        {isCorrect ? <CheckCircle2 size={20} className="animate-bounce" /> : <XCircle size={20} className="animate-shake" />}
                                                    </div>
                                                )}
                                                {/* Subtle Shimmer on Hover */}
                                                {selectedAnswer === null && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {gameState === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center justify-center text-center z-10"
                            >
                                <div className="relative mb-10">
                                    <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)] animate-pulse"></div>
                                    <div className="w-28 h-28 bg-gradient-to-br from-[#D4AF37] to-[#8A6E2F] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.4)] border-4 border-black/20 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_linear_infinite]"></div>
                                        <Trophy size={56} className="text-[#0a0a0a] drop-shadow-lg" fill="currentColor" />
                                    </div>
                                </div>

                                <h3 className="text-[#FDFBF7] font-black font-cinzel text-4xl mb-4 tracking-wider leading-none">DESTANSI!</h3>
                                <p className="text-[#D4AF37] text-[10px] font-black tracking-[0.5em] uppercase mb-8 opacity-60">OKUNAN BİLGELİK</p>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.3 }}
                                    className="flex flex-col items-center gap-2 mb-12 bg-white/5 px-10 py-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
                                    <div className="flex items-center gap-3">
                                        <Zap size={24} className="text-[#D4AF37]" fill="currentColor" />
                                        <span className="text-white font-black text-5xl font-cinzel tracking-tighter tabular-nums">{score}</span>
                                    </div>
                                    <span className="text-[#D4AF37]/60 font-black text-[10px] uppercase tracking-[0.4em]">VOLT KAZANILDI</span>
                                </motion.div>

                                <button
                                    onClick={() => {
                                        setGameState('start');
                                        setCurrentQuestion(0);
                                        setScore(0);
                                        setSelectedAnswer(null);
                                        setIsCorrect(null);
                                    }}
                                    className="w-full group relative bg-white text-[#0a0a0a] py-6 rounded-2xl font-black font-cinzel text-sm tracking-[0.3em] shadow-2xl hover:bg-[#D4AF37] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="relative flex items-center gap-3">TEKRAR DENE <ArrowRight size={20} /></span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default TriviaGame;
