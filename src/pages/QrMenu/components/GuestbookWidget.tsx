import React, { useState } from 'react';
import { MessageSquare, Heart, Send, Ghost, User, Sparkles } from 'lucide-react';

const GuestbookWidget: React.FC = () => {
    const [messages, setMessages] = useState([
        { id: 1, name: 'Deniz', table: '04', text: 'Americano efsane! ☕️', likes: 5, time: '2 dakika önce' },
        { id: 2, name: 'Motto Guest', table: '12', text: 'San Sebastian denemeyen çok şey kaybeder...', likes: 12, time: '10 dakika önce' },
        { id: 3, name: 'Coffee Lover', table: '07', text: 'Müzikler harika, ortam çok premium.', likes: 8, time: '15 dakika önce' }
    ]);

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = {
            id: Date.now(),
            name: 'Masa Sakini',
            table: '--',
            text: newMessage,
            likes: 0,
            time: 'Şimdi'
        };
        setMessages([msg, ...messages]);
        setNewMessage('');
    };

    return (
        <div className="px-4 mt-6">
            <div className="bg-[#f0ece9] rounded-[2.5rem] overflow-hidden border border-[#432818]/10 shadow-sm flex flex-col max-h-[400px]">
                {/* Header */}
                <div className="bg-[#432818] p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#D4AF37]" />
                        <h3 className="text-[#FDFBF7] font-black font-cinzel text-xs tracking-wider">ANI DEFTERİ</h3>
                    </div>
                    <div className="bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                        <span className="text-[#D4AF37] text-[10px] font-black">CANLI</span>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#432818]/5 animate-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#432818]/5 rounded-full flex items-center justify-center text-[#432818]/40">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#432818] text-[11px] font-cinzel">{msg.name}</p>
                                        <p className="text-[9px] text-[#432818]/30 font-bold uppercase tracking-tighter">Masa {msg.table}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] text-[#432818]/40 font-medium">{msg.time}</span>
                            </div>
                            <p className="text-[#432818] text-xs leading-relaxed font-medium pl-1">{msg.text}</p>
                            <div className="flex justify-end mt-3">
                                <button className="flex items-center gap-1.5 text-[#432818]/40 hover:text-red-500 transition-colors group">
                                    <Heart size={12} className="group-hover:fill-current" />
                                    <span className="text-[10px] font-black">{msg.likes}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-[#432818]/5">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Bir şeyler yaz..."
                            className="flex-1 bg-[#FDFBF7] border border-[#432818]/10 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#D4AF37] transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="w-10 h-10 bg-[#432818] rounded-xl flex items-center justify-center text-[#D4AF37] hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-1 justify-center mt-3">
                        <Sparkles size={10} className="text-[#D4AF37]" />
                        <p className="text-[9px] text-[#432818]/30 font-bold uppercase tracking-widest">Nazik olun, Motto'dasınız.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestbookWidget;
