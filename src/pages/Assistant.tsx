import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, User, Loader2, Send } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { GEMINI_API_KEY } from '../utils/constants';
import { FinancialStats } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';

const Assistant: React.FC = () => {
    const { stats } = useOutletContext<DashboardContextType>();

    interface ChatMessage {
        role: 'ai' | 'user' | 'system';
        text: string;
    }
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'ai', text: 'Merhaba! İşletmenle ilgili finansal sorularını cevaplamaya hazırım.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    const formatHistoryForAPI = (messages: ChatMessage[]) => {
        return messages.filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
    };

    const handleSendMessage = async (textOverride: string | null = null) => {
        const userMessage = textOverride || chatInput.trim();
        if (!userMessage || aiLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userMessage };
        setChatMessages(prev => [...prev, newUserMessage]);
        setChatInput("");
        setAiLoading(true);

        const generateLocalResponse = () => {
            const lowerMsg = userMessage.toLowerCase();
            if (lowerMsg.includes('ciro')) return `📊 **Bugün Ciro:** ${formatCurrency(stats.dailyIncome)} ₺\n**Bu Ay:** ${formatCurrency(stats.monthlyIncome)} ₺`;
            if (lowerMsg.includes('kâr')) return `💰 **Net Kâr:** ${formatCurrency(stats.netProfit)} ₺\n**Gerçek Kâr:** ${formatCurrency(stats.netNetProfit)} ₺`;
            if (lowerMsg.includes('borç')) return `⚠️ **Toplam Borç:** ${formatCurrency(stats.totalDebt)} ₺`;
            if (lowerMsg.includes('yatırım')) return `📈 **Portföy Değeri:** ${formatCurrency(stats.investmentStats.currentValue)} ₺`;
            return "Şu an yapay zeka servisine ulaşılamıyor. 'Ciro', 'Kâr' veya 'Borç' yazarak sorgulama yapabilirsiniz.";
        };

        const systemPrompt = `Sen "Patron Finans" asistanısın. Para birimi: TL. Kısıtlı verileri kullan, bağlamı koru. VERİLER: Bugün Ciro: ${formatCurrency(stats.dailyIncome)}, Bu Ay: ${formatCurrency(stats.monthlyIncome)}, Net Kâr: ${formatCurrency(stats.netProfit)}, Borç: ${formatCurrency(stats.totalDebt)}.`;

        const chatHistory = formatHistoryForAPI([...chatMessages, newUserMessage]);

        // Google Gemini API expects prompt in a specific way sometimes, but here we inject context in the last user message if it's the first interaction or update context
        if (chatHistory.length === 1 && chatHistory[0].role === 'user') {
            chatHistory[0].parts[0].text = `${systemPrompt}\n\nSoru: ${chatHistory[0].parts[0].text}`;
        }

        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("API Anahtarı Yüklenemedi")) throw new Error("Anahtar Eksik");

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: chatHistory })
            });

            if (!response.ok) throw new Error(`API Hatası: ${response.status}`);

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponse) throw new Error("Boş cevap");

            setChatMessages(prev => {
                return [...prev, { role: 'ai', text: aiResponse }];
            });

        } catch (error) {
            console.error("AI İstek Hatası:", error);
            setChatMessages(prev => [...prev, { role: 'ai', text: generateLocalResponse() }]);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Sparkles className="text-purple-400" /> AI Asistan</h2>
                <button onClick={() => setChatMessages([{ role: 'ai', text: 'Merhaba! İşletmenle ilgili finansal sorularını cevaplamaya hazırım.' }])} className="text-xs bg-slate-800 px-3 py-2 rounded-lg text-slate-400 flex gap-2"><Trash2 size={14} /> Sohbeti Temizle</button>
            </div>
            <div className="flex-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 overflow-hidden flex flex-col shadow-2xl relative">
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-4">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-purple-600'}`}>{msg.role === 'user' ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}</div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-md ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'}`}>{msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part)}</div>
                            </div>
                        </div>
                    ))}
                    {aiLoading && <div className="flex justify-start"><div className="bg-slate-700/50 p-4 rounded-2xl rounded-tl-none flex items-center gap-2"><Loader2 className="animate-spin text-purple-400" size={16} /><span className="text-xs text-slate-400">Yazıyor...</span></div></div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar border-t border-slate-700/50 mt-2">
                    {[{ label: "Ciro Durumu", query: "Bugünkü ciro nedir?" }, { label: "Kâr Analizi", query: "Kâr durumum nasıl?" }, { label: "Borçlar", query: "Toplam borç nedir?" }, { label: "Yatırımlar", query: "Portföy ne durumda?" }].map((chip, i) => (
                        <button key={i} onClick={() => handleSendMessage(chip.query)} disabled={aiLoading} className="whitespace-nowrap px-4 py-2 bg-slate-700/50 hover:bg-purple-600/20 hover:text-purple-300 border border-slate-600 rounded-full text-xs font-medium text-slate-300 transition-all">{chip.label}</button>
                    ))}
                </div>
                <div className="mt-2 flex gap-2 relative">
                    <input type="text" placeholder="Bir soru sorun..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} disabled={aiLoading} className="flex-1 bg-slate-900 border border-slate-600 rounded-xl pl-4 pr-12 py-4 text-white outline-none focus:border-purple-500 transition-all" />
                    <button onClick={() => handleSendMessage()} disabled={aiLoading || !chatInput.trim()} className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-3 rounded-lg transition-colors">{aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}</button>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
