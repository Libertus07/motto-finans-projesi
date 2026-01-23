import React from 'react';
import { X, Sun, Moon, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: string;
    setTheme: (theme: string) => void;
    language: string;
    setLanguage: (lang: string) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, language, setLanguage, showToast }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-sm rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Ayarlar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Theme */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-[#432818]/40 uppercase tracking-widest pl-1">Görünüm Modu</h3>
                        <div className="bg-[#432818]/5 p-1 rounded-xl flex">
                            <button
                                onClick={() => { setTheme('light'); showToast('Aydınlık mod aktif edildi.', 'success'); }}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all uppercase tracking-wide ${theme === 'light' ? 'bg-white text-[#432818] shadow-sm' : 'text-[#432818]/40 hover:text-[#432818]'}`}
                            >
                                <Sun size={16} strokeWidth={2.5} /> Aydınlık
                            </button>
                            <button
                                onClick={() => { setTheme('dark'); showToast('Karanlık mod aktif edildi.', 'success'); }}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold transition-all uppercase tracking-wide ${theme === 'dark' ? 'bg-[#432818] text-white shadow-sm' : 'text-[#432818]/40 hover:text-[#432818]'}`}
                            >
                                <Moon size={16} strokeWidth={2.5} /> Karanlık
                            </button>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-[#432818]/40 uppercase tracking-widest pl-1">Dil Seçimi</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => { setLanguage('tr'); showToast('Dil Türkçe olarak ayarlandı.', 'success'); }}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${language === 'tr' ? 'bg-white border-[#432818] shadow-sm' : 'bg-transparent border-[#432818]/10 text-[#432818]/60 hover:bg-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🇹🇷</span>
                                    <span className="font-bold text-xs">Türkçe</span>
                                </div>
                                {language === 'tr' && <div className="w-6 h-6 bg-[#432818] rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>}
                            </button>
                            <button
                                onClick={() => { setLanguage('en'); showToast('Language set to English.', 'success'); }}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${language === 'en' ? 'bg-white border-[#432818] shadow-sm' : 'bg-transparent border-[#432818]/10 text-[#432818]/60 hover:bg-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🇬🇧</span>
                                    <span className="font-bold text-xs">English</span>
                                </div>
                                {language === 'en' && <div className="w-6 h-6 bg-[#432818] rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={3} /></div>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;