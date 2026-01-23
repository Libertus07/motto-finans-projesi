---
name: premium-ui
description: Guidelines and snippets for the "Motto Golden Age" premium aesthetic.
---

# Premium UI Skill (Motto Golden Age)

Use this skill to apply consistent, high-end styling to components in the MottoPos/QrMenu project. The aesthetic is inspired by Ancient Greek/Olympic themes with a modern, glassmorphic touch.

## 🎨 Color Palette

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Olimpos Cream** | `#FDFBF7` | Primary background, text on dark surfaces |
| **Motto Dark** | `#432818` | Primary text, brand highlights |
| **Antik Gold** | `#D4AF37` | Accents, borders, buttons, lightning effects |
| **Gold Light** | `#F5E6AD` | Holographic effects, lighter accents |
| **Surface Dark** | `#0a0a0a` | Modal backgrounds, deep sections |

## 🏺 Typography

- **Headings**: Use `font-cinzel` for a classic, monumental look. Usually `font-black`.
- **Primary Labels**: Use `font-titan` for a bold, friendly look.
- **Body**: Use `font-sans` (Inter).

## ✨ Visual Effects

### Glassmorphism
Premium cards and modals should use high-blur backgrounds:
```tsx
className="bg-black/90 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)]"
```

### Shimmer Effect
Apply to buttons or critical highlights:
```tsx
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_linear_infinite]"></div>
```

### Divine Glow
Use radial gradients for "focus" areas:
```tsx
<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05),_transparent_70%)] pointer-events-none"></div>
```

## 📐 Layout Rules
- **Rounding**: Use large border-radius for a premium feel (`rounded-[3rem]` for modals, `rounded-2xl` for buttons).
- **Padding**: Generous whitespace is key to luxury design. Avoid cramped layouts.
- **Icons**: Use `lucide-react`. Often gold-tinted or with subtle pulses.
