import { Challenge, CustomerProfile, Badge } from '../types';

/**
 * Calculates the progress of a given challenge for a user.
 * @param challenge The challenge to calculate progress for.
 * @param user The user profile.
 * @param stats Optional additional stats (e.g., from order history).
 * @returns Object containing current progress and completion status.
 */
export const calculateProgress = (challenge: Challenge, user: CustomerProfile | null, stats?: Record<string, number>): { progress: number; isCompleted: boolean } => {
    if (!user) return { progress: 0, isCompleted: false };

    let progress = 0;

    switch (challenge.type) {
        case 'profile':
            if (challenge.criteria === 'photo_upload') {
                progress = user.photoURL ? 1 : 0;
            } else if (challenge.criteria === 'email_verify') {
                progress = user.email ? 1 : 0;
            } else if (challenge.criteria === 'complete_profile') {
                // Check if name, phone, email, birthday exist
                const filled = [user.firstName, user.lastName, user.phone, user.email, user.birthday].filter(Boolean).length;
                progress = filled;
            } else {
                progress = user.photoURL && user.email && user.firstName ? 1 : 0;
            }
            break;

        case 'order_count':
            if (challenge.criteria === 'category_coffee') {
                // Use coffeeStamps as a proxy for coffee orders
                progress = user.coffeeStamps || 0;
            } else if (challenge.criteria === 'category_dessert') {
                // Placeholder: In a real app, we'd query "dessert" category count.
                // For demo, we'll use a derived value or stats if available
                progress = stats?.dessertCount || 0;
            } else {
                progress = user.totalOrders || (user.coffeeStamps || 0);
            }
            break;

        case 'spend_amount':
            progress = user.totalSpend || 0;
            break;

        case 'social':
            // Logic for social connection (later)
            progress = 0;
            break;

        case 'referral':
            progress = user.referralCount || 0;
            break;

        default:
            progress = challenge.progress || 0;
    }

    return {
        progress,
        isCompleted: progress >= challenge.target
    };
};

/**
 * Predefined templates for "AI" generation.
 */
export const MISSION_TEMPLATES: Partial<Challenge>[] = [
    {
        title: 'Kahve Tutkunu',
        description: '5 kahve siparişi ver, anında ödül kazan!',
        reward: 150,
        target: 5,
        type: 'order_count',
        criteria: 'category_coffee',
        icon: '☕'
    },
    {
        title: 'Haftanın Gurmesi',
        description: 'Bu hafta 500₺ üzeri harcama yap.',
        reward: 300,
        target: 500,
        type: 'spend_amount',
        icon: '🍽️'
    },
    {
        title: 'Profil Yıldızı',
        description: 'Profil fotoğrafını yükle, hesabını renklendir.',
        reward: 50,
        target: 1,
        type: 'profile',
        criteria: 'photo_upload',
        icon: '📸'
    },
    {
        title: 'Sosyal Kelebek',
        description: 'Arkadaşını davet et, birlikte kazan.',
        reward: 500,
        target: 1,
        type: 'referral',
        icon: '🦋'
    },
    {
        title: 'Tatlı Kaçamağı',
        description: '3 adet tatlı siparişi ile gününü tatlandır.',
        reward: 100,
        target: 3,
        type: 'order_count',
        criteria: 'category_dessert',
        icon: '🍰'
    },
    {
        title: 'Sadık Müşteri',
        description: '10. siparişine özel büyük ödül!',
        reward: 1000,
        target: 10,
        type: 'order_count',
        icon: '🏆'
    }
];

/**
 * Generates a random mission based on templates with slight variations.
 */
export const generateAIMission = (): Partial<Challenge> => {
    const randomIndex = Math.floor(Math.random() * MISSION_TEMPLATES.length);
    const template = MISSION_TEMPLATES[randomIndex];

    // Add some "AI" variation
    const modulatedTemplate = { ...template };

    if (template.type === 'order_count' || template.type === 'spend_amount') {
        const multiplier = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        modulatedTemplate.target = (template.target || 1) * multiplier;
        modulatedTemplate.reward = (template.reward || 50) * multiplier;

        // Update description dynamically
        if (template.type === 'order_count') {
            modulatedTemplate.description = `${modulatedTemplate.target} sipariş ver, ödülleri topla!`;
        } else if (template.type === 'spend_amount') {
            modulatedTemplate.description = `${modulatedTemplate.target}₺ üzeri harcama yap.`;
        }
    }

    return modulatedTemplate;
};

/**
 * System Badges Definition
 */
export const SYSTEM_BADGES: Badge[] = [
    {
        id: 'newbie',
        name: 'Hoşgeldin',
        description: 'Motto ailesine katıldın.',
        icon: '👋',
        condition: 'first_order',
        rarity: 'common'
    },
    {
        id: 'coffee_lover',
        name: 'Kahve Tutkunu',
        description: 'Kahve senin hayat tarzın.',
        icon: '☕',
        condition: 'coffee_lover', // Logic: e.g. 10 coffee orders
        rarity: 'common'
    },
    {
        id: 'loyal_customer',
        name: 'Müdavim',
        description: '10 sipariş verdin!',
        icon: '🏅',
        condition: 'order_count_10',
        rarity: 'rare'
    },
    {
        id: 'vip_member',
        name: 'VIP',
        description: '50 sipariş ile zirvedesin.',
        icon: '👑',
        condition: 'order_count_50',
        rarity: 'epic'
    },
    {
        id: 'big_spender',
        name: 'Bonkör',
        description: 'Toplam 1000₺ harcama.',
        icon: '💎',
        condition: 'spend_1000',
        rarity: 'epic'
    },
    {
        id: 'motto_legend',
        name: 'Motto Efsanesi',
        description: 'Hem 100 sipariş hem de 5000₺ harcama.',
        icon: '🦄',
        condition: 'legend',
        rarity: 'legendary'
    }
];

/**
 * Checks which badges a user has earned.
 */
export const checkBadges = (user: CustomerProfile, stats?: Record<string, number>): Badge[] => {
    const earnedBadges: Badge[] = [];

    // Logic proxies
    const totalOrders = user.totalOrders || (stats?.totalOrders) || (user.coffeeStamps || 0);
    const totalSpend = user.totalSpend || (stats?.totalSpend) || 0;

    SYSTEM_BADGES.forEach(badge => {
        // Skip if already has badge
        if (user.badges?.includes(badge.id)) return;

        let unlocked = false;
        switch (badge.condition) {
            case 'first_order':
                if (totalOrders >= 1) unlocked = true;
                break;
            case 'order_count_10':
                if (totalOrders >= 10) unlocked = true;
                break;
            case 'order_count_50':
                if (totalOrders >= 50) unlocked = true;
                break;
            case 'spend_1000':
                if (totalSpend >= 1000) unlocked = true;
                break;
            case 'coffee_lover':
                // Simply checking total orders here for mock, ideally filtering by category
                if (totalOrders >= 5) unlocked = true;
                break;
            case 'legend':
                if (totalOrders >= 100 && totalSpend >= 5000) unlocked = true;
                break;
        }

        if (unlocked) {
            earnedBadges.push(badge);
        }
    });

    return earnedBadges;
};
