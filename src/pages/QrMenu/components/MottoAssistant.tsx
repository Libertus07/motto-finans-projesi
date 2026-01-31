import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Mic, ChevronRight, Plus, Wine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../../types';

interface MottoAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onAddToCart: (product: Product, options: any) => void;
    t: (key: string) => string;
    customerName?: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    suggestedProducts?: Product[];
    actions?: { label: string; action: string }[];
}

const MottoAssistant: React.FC<MottoAssistantProps> = ({ isOpen, onClose, products, onAddToCart, t, customerName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Royal Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsTyping(true);
            const hour = new Date().getHours();
            const timeGreeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

            setTimeout(() => {
                const greeting = customerName
                    ? `${timeGreeting} ${customerName} Bey/Hanım. Ben Motto Kraliyet Asistanı. 🎩\nSizin için bugün neler yapabilirim?`
                    : `${timeGreeting} efendim. Ben Motto Kraliyet Asistanı. 🎩\nDamak zevkinize uygun bir öneri ister misiniz?`;

                addMessage({
                    id: 1,
                    text: greeting,
                    sender: 'bot',
                    timestamp: new Date(),
                    actions: [
                        { label: "Sürpriz Yap ✨", action: "surprise" },
                        { label: "Kahve Öner ☕", action: "coffee" },
                        { label: "Tatlı Krizi 🍰", action: "dessert" }
                    ]
                });
                setIsTyping(false);
            }, 1000);
        }
    }, [isOpen, customerName]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        // User Message
        addMessage({
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        });
        setInputValue('');
        setIsTyping(true);

        // Analyze Intent & Reply
        setTimeout(() => {
            const response = generateRoyalResponse(text, products);

            addMessage({
                id: Date.now() + 1,
                text: response.reply,
                sender: 'bot',
                timestamp: new Date(),
                suggestedProducts: response.suggestions,
                actions: response.actions
            });
            setIsTyping(false);
        }, 1500);
    };

    // --- ROYAL INTELLIGENCE LOGIC ---
    const generateRoyalResponse = (input: string, allProducts: Product[]): { reply: string, suggestions?: Product[], actions?: any[] } => {
        const lowerInput = input.toLowerCase();
        let reply = "Affedersiniz efendim, tam olarak anlayamadım. Ancak menümüzdeki en seçkin lezzetlere göz atabiliriz. 🥂";
        let suggestions: Product[] = [];
        let actions = [{ label: "Menüyü Göster", action: "menu" }];

        // Keywords
        if (lowerInput.includes('tatlı') || lowerInput.includes('pasta') || lowerInput.includes('kriz')) {
            suggestions = allProducts.filter(p => p.category === 'Tatlı').slice(0, 5);
            reply = "Mükemmel bir seçim efendim. Tatlı krizinizi bir şölene dönüştürecek şaheserlerimiz şunlardır: 🍰";
        }
        else if (lowerInput.includes('kahve') || lowerInput.includes('uyku') || lowerInput.includes('ayılt')) {
            suggestions = allProducts.filter(p => p.category === 'Kahve').slice(0, 5);
            reply = "Günün yorgunluğunu üzerinizden atacak, özenle kavrulmuş çekirdeklerimizden hazırladığımız kahvelerimiz emrinize amade. ☕";
        }
        else if (lowerInput.includes('aç') || lowerInput.includes('yemek') || lowerInput.includes('doyur')) {
            suggestions = allProducts.filter(p => p.category === 'Ana Yemek' || p.category === 'Burger').slice(0, 5);
            reply = "Şefimizin özel tarifleriyle hazırlanan, damak çatlatan ana yemeklerimiz sizi bekliyor efendim. 🍽️";
        }
        else if (lowerInput.includes('hafif') || lowerInput.includes('diyet') || lowerInput.includes('form')) {
            suggestions = allProducts.filter(p => p.category === 'Salata' || (p.calories && p.calories < 400)).slice(0, 3);
            reply = "Formunu korumak isteyen misafirlerimiz için hazırladığımız hafif ve taze seçeneklerimiz... 🥗";
        }
        else if (lowerInput.includes('sürpriz') || lowerInput.includes('rastgele') || lowerInput.includes('öner')) {
            const random = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
            suggestions = random;
            reply = "Bugün şanslı gününüzdesiniz efendim! Sizin için seçtiğim özel lezzetler. Beğeneceğinizi umuyorum. ✨";
        }

        // Fallback
        if (suggestions.length === 0) {
            suggestions = allProducts.filter(p => p.isFavorite).slice(0, 3);
        }

        return { reply, suggestions, actions };
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#050302]/60 backdrop-blur-sm z-[90]"
                        onClick={onClose}
                    />

                    {/* Chat Interface */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 h-[85vh] sm:h-[600px] z-[100] flex flex-col bg-[#FDFBF7]/90 backdrop-blur-xl border-t sm:border border-[#D4AF37]/30 sm:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden"
                    >
                        {/* --- Header --- */}
                        <div className="relative bg-gradient-to-r from-[#1a110d] to-[#432818] p-5 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-[#1a110d] rounded-full flex items-center justify-center border border-[#D4AF37]/50 relative z-10">
                                        <Bot size={24} className="text-[#D4AF37]" />
                                    </div>
                                    {/* Breathing Animation */}
                                    <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-md animate-pulse opacity-40"></div>
                                </div>
                                <div>
                                    <h2 className="text-[#D4AF37] font-cinzel font-black tracking-widest text-lg">MOTTO ASİSTAN</h2>
                                    <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-medium block">Kraliyet Konsiyerji</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- Messages Area --- */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-[#FDFBF7]/50 to-[#FDFBF7]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] space-y-3 ${msg.sender === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>

                                        {/* Text Bubble */}
                                        <div className={`p-4 rounded-[1.2rem] text-sm leading-relaxed shadow-sm relative ${msg.sender === 'user'
                                                ? 'bg-[#432818] text-[#D4AF37] rounded-tr-sm'
                                                : 'bg-white border border-[#432818]/10 text-[#432818] rounded-tl-sm'
                                            }`}>
                                            {msg.text.split('\n').map((line, i) => (
                                                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                            ))}
                                            <span className={`text-[9px] absolute -bottom-5 ${msg.sender === 'user' ? 'right-1' : 'left-1'} opacity-40 font-bold`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Product Suggestions (Horizontal Scroll) */}
                                        {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                            <div className="w-screen sm:w-full -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto pb-4 pt-1 flex gap-3 snap-x scrollbar-hide">
                                                {msg.suggestedProducts.map((product, idx) => (
                                                    <motion.div
                                                        key={product.id}
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="snap-center shrink-0 w-60 bg-white rounded-2xl shadow-md border border-[#432818]/5 overflow-hidden group"
                                                    >
                                                        <div className="h-32 bg-[#1a110d] relative overflow-hidden">
                                                            <img src={product.image || 'https://images.unsplash.com/photo-1544787210-28274d6c66cf?w=400&q=80'} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold">
                                                                ₺{product.price}
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="font-black text-[#432818] font-cinzel text-sm truncate">{product.name}</h4>
                                                            <p className="text-xs text-[#432818]/50 line-clamp-1 mt-1 mb-3">{product.description}</p>
                                                            <button
                                                                onClick={() => onAddToCart(product, {})}
                                                                className="w-full py-2 bg-[#F9F7F5] border border-[#432818]/10 rounded-xl text-xs font-bold text-[#432818] hover:bg-[#432818] hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={14} /> Sepete Ekle
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quick Actions */}
                                        {msg.actions && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.actions.map((act, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            if (act.action === 'surprise') handleSendMessage("Bana sürpriz bir şeyler öner");
                                                            if (act.action === 'coffee') handleSendMessage("Kahve içmek istiyorum");
                                                            if (act.action === 'dessert') handleSendMessage("Canım tatlı çekiyor");
                                                        }}
                                                        className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#432818] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#D4AF37] hover:text-white transition-all active:scale-95"
                                                    >
                                                        {act.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-[#432818]/10 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-12">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-[#D4AF37] rounded-full"></motion.div>
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-[#D4AF37] rounded-full"></motion.div>
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-[#D4AF37] rounded-full"></motion.div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* --- Input Area --- */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-[#432818]/5 pb-safe-bottom">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-[#F5F2EB] rounded-[1.5rem] px-5 py-3 border border-[#432818]/5 focus-within:ring-2 focus-within:ring-[#D4AF37]/30 focus-within:border-[#D4AF37] transition-all flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent outline-none text-[#432818] placeholder:text-[#432818]/40 font-medium text-sm"
                                        placeholder="Arzunuzu yazın..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                    />
                                    <button className="text-[#432818]/40 hover:text-[#D4AF37] transition-colors">
                                        <Mic size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim()}
                                    className="w-12 h-12 bg-[#432818] rounded-full flex items-center justify-center text-[#D4AF37] shadow-xl hover:bg-[#2e1b10] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <Send size={20} className={inputValue.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MottoAssistant;
