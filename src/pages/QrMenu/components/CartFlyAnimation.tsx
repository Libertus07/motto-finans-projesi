import React, { useEffect, useState } from 'react';

interface FlyingItem {
    id: number;
    startRect: DOMRect;
    image: string;
}

interface CartFlyAnimationProps {
    items: FlyingItem[];
    onComplete: (id: number) => void;
}

const CartFlyAnimation: React.FC<CartFlyAnimationProps> = ({ items, onComplete }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {items.map(item => (
                <FlyingElement key={item.id} item={item} onComplete={() => onComplete(item.id)} />
            ))}
        </div>
    );
};

const FlyingElement = ({ item, onComplete }: { item: FlyingItem, onComplete: () => void }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'absolute',
        left: item.startRect.left,
        top: item.startRect.top,
        width: item.startRect.width || 50,
        height: item.startRect.height || 50,
        opacity: 1,
        transform: 'scale(1)',
        transition: 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)',
        zIndex: 100
    });

    useEffect(() => {
        // Hedef: Ekranın alt ortası (Sepet ikonu civarı)
        // Hedef: Ekranın alt ortası (Sepet ikonu civarı)
        let targetX = window.innerWidth / 2 - 25;
        let targetY = window.innerHeight - 80; // BottomNav yüksekliği kadar yukarı

        const cartBtn = document.getElementById('cart-nav-button');
        if (cartBtn) {
            const rect = cartBtn.getBoundingClientRect();
            targetX = rect.left + (rect.width / 2) - 25; // Center
            targetY = rect.top + (rect.height / 2) - 25;
        }

        // Bir sonraki frame'de animasyonu başlat
        requestAnimationFrame(() => {
            setStyle(prev => ({
                ...prev,
                left: targetX,
                top: targetY,
                width: 20,
                height: 20,
                opacity: 0,
                transform: 'scale(0.5)'
            }));
        });

        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div style={style} className="flex items-center justify-center text-4xl rounded-full bg-white shadow-xl border border-[#432818]/10 overflow-hidden">
            {item.image}
        </div>
    );
};

export default CartFlyAnimation;