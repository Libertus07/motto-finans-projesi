---
name: component-factory
description: A skill to quickly scaffold new React components with the project's standard imports and styling.
---

# Component Factory Skill

Use this skill to create new UI components that are consistent with the MottoPos/QrMenu project's architecture and "Golden Age" aesthetic.

## 📦 Standard Template

When creating a new component (e.g., `NewWidget.tsx`), use this structure:

```tsx
import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Or local t prop

interface NewWidgetProps {
    title?: string;
    icon?: LucideIcon;
    className?: string;
}

const NewWidget: React.FC<NewWidgetProps> = ({ 
    title = "Default Title", 
    icon: Icon = Sparkles,
    className = "" 
}) => {
    // 1. Accessibility / Translation
    const { t } = useTranslation();

    return (
        <div className={`relative overflow-hidden rounded-[2rem] bg-black/80 backdrop-blur-xl border border-[#D4AF37]/20 p-6 shadow-2xl ${className}`}>
            {/* 🏛️ Heritage Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                    <Icon size={20} />
                </div>
                <h3 className="font-cinzel font-black text-[#D4AF37] tracking-widest text-sm uppercase">
                    {title}
                </h3>
            </div>

            {/* 🏮 Content Area */}
            <div className="relative z-10 text-[#FDFBF7]/80">
                {/* Content goes here */}
            </div>

            {/* ✨ Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-white/5 pointer-events-none" />
        </div>
    );
};

export default NewWidget;
```

## 🏗️ Folder Structure
- **Global Components**: `src/components/common/`
- **QR Menu Specific**: `src/pages/QrMenu/components/`
- **POS Specific**: `src/components/pos/`

## 💡 Guidelines
- **Props**: Always use explicit interfaces.
- **Styling**: Prefer Tailwind classes. For complex animations, use `framer-motion` (if available) or standard CSS transitions.
- **Icons**: Always include a `lucide-react` icon to maintain the visual language.
