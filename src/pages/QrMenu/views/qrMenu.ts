export interface WheelPrize {
    id: string;
    label: string;
    type: string; // 'none' | 'points'
    value: number;
    weight: number;
    color: string;
    icon: string;
}

export interface CustomerProfile {
    uid: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    points: number;
    favorites: string[];
    createdAt: string;
    photoURL?: string;
    birthday?: string;
    inviteCode?: string;
    personalInviteCode?: string;
    lastSpinDate?: string;
    role?: string;
    isAdmin?: boolean;
    coffeeStamps?: number;
    lastCoffeeDate?: string;
}