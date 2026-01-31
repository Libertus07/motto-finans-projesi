import { LoyaltyTier } from "../types";

export const getTier = (points: number): LoyaltyTier => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
};

export const getNextTier = (currentTier: LoyaltyTier): LoyaltyTier | null => {
    switch (currentTier) {
        case 'Bronze': return 'Silver';
        case 'Silver': return 'Gold';
        case 'Gold': return 'Platinum';
        case 'Platinum': return null;
    }
};

export const getTierThreshold = (tier: LoyaltyTier): number => {
    switch (tier) {
        case 'Bronze': return 0;
        case 'Silver': return 1000;
        case 'Gold': return 5000;
        case 'Platinum': return 10000;
        default: return 0;
    }
};

export const getTierColor = (tier: LoyaltyTier): string => {
    switch (tier) {
        case 'Bronze': return '#CD7F32'; // Bronze color
        case 'Silver': return '#C0C0C0'; // Silver color
        case 'Gold': return '#D4AF37';   // Gold color
        case 'Platinum': return '#E5E4E2'; // Platinum color (bright silver/white)
        default: return '#CD7F32';
    }
};

export const getTierBadge = (tier: LoyaltyTier): string => {
    switch (tier) {
        case 'Bronze': return '🥉';
        case 'Silver': return '🥈';
        case 'Gold': return '🥇';
        case 'Platinum': return '💎';
        default: return '🥉';
    }
};

export const getTierBenefits = (tier: LoyaltyTier): string[] => {
    switch (tier) {
        case 'Bronze':
            return [
                'Motto Club Üyeliği',
                'Hoşgeldin Hediyesi (50 Volt)',
                'Her harcamadan %5 Volt Puan'
            ];
        case 'Silver':
            return [
                'Her harcamadan %7.5 Volt Puan',
                'Doğum Gününde Ücretsiz Kahve',
                'Öncelikli Müşteri Desteği'
            ];
        case 'Gold':
            return [
                'Her harcamadan %10 Volt Puan',
                'Ayda 1 Ücretsiz Kahve',
                'Özel Etkinlik Davetleri',
                'Hediye Çarkında Çift Hak'
            ];
        case 'Platinum':
            return [
                'Her harcamadan %15 Volt Puan',
                'Haftada 1 Ücretsiz Kahve',
                'Rezarvasyon Önceliği',
                'Yeni Ürünleri İlk Deneme Hakkı',
                'Sürpriz Hediyeler'
            ];
        default:
            return [];
    }
};

export const getTierDescription = (tier: LoyaltyTier): string => {
    switch (tier) {
        case 'Bronze': return 'Yolculuğun başlangıcı. Lezzet dünyasına adım atın.';
        case 'Silver': return 'Sadakatiniz ödüllendiriliyor. Ayrıcalıkları hissetmeye başlayın.';
        case 'Gold': return 'Seçkin üyeler kulübü. Altın çağınızı yaşıyorsunuz.';
        case 'Platinum': return 'Zirvedeki yeriniz hazır. Sınırsız ayrıcalıkların keyfini çıkarın.';
        default: return '';
    }
};

export const getTierGradient = (tier: LoyaltyTier): string => {
    switch (tier) {
        case 'Bronze': return 'from-[#CD7F32] to-[#B87333]';
        case 'Silver': return 'from-[#E3E3E3] to-[#A0A0A0]';
        case 'Gold': return 'from-[#D4AF37] to-[#AA8C2C]';
        case 'Platinum': return 'from-[#E5E4E2] to-[#b0b0b0]';
        default: return 'from-[#CD7F32] to-[#B87333]';
    }
};
