import React from 'react';
import { Home, Search, Bell, Phone } from 'lucide-react';

interface BottomNavProps {
    view: string;
    setView: (view: string) => void;
    cartCount?: number;
    onOpenService: () => void;
    onCloseService?: () => void;
    onResetCategory: () => void;
    t?: (key: string) => string;
    onPaymentClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
    view,
    setView,
    onOpenService,
    onCloseService,
    onResetCategory
}) => {
    const navItems = [
        {
            key: 'home',
            label: 'Ana Sayfa',
            icon: Home,
            onClick: () => {
                onCloseService?.();
                setView('home');
                onResetCategory();
            }
        },
        {
            key: 'search',
            label: 'Arama',
            icon: Search,
            onClick: () => {
                onCloseService?.();
                setView('search');
            }
        },
        {
            key: 'waiter',
            label: 'Garson',
            icon: Bell,
            onClick: () => {
                onOpenService();
            }
        },
        {
            key: 'contact',
            label: 'İletişim',
            icon: Phone,
            onClick: () => {
                onCloseService?.();
                setView('contact');
            }
        }
    ];

    return (
        <div className="fixed left-0 right-0 bottom-4 z-[9999] px-4">
            <nav className="mx-auto flex h-[76px] max-w-md items-center justify-between gap-2 rounded-[28px] border border-[#432818]/15 bg-[#FDFBF7] px-3 shadow-[0_-10px_35px_rgba(67,40,24,0.22)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={item.onClick}
                            className={`flex h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] transition-all ${isActive
                                    ? 'bg-[#432818] text-[#D4AF37]'
                                    : 'text-[#432818]/55'
                                }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.6 : 2.1} />
                            <span className="text-[10px] font-black">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;