import { appId } from '../services/firebase';
import { SHOP_ID } from './constants';

const BASE_PATH = `artifacts/${appId}/shops/${SHOP_ID}`;

export const COLLECTIONS = {
    CUSTOMERS: `${BASE_PATH}/customers`,
    TRANSACTIONS: `${BASE_PATH}/transactions`,
    ORDERS: `${BASE_PATH}/orders`,
    CAMPAIGNS: `${BASE_PATH}/campaigns`,
    PRODUCTS: `${BASE_PATH}/products`,
    NOTIFICATIONS: `${BASE_PATH}/notifications`,
    TABLES: `${BASE_PATH}/tables`,
    STAFF: `${BASE_PATH}/staff`,
    CATEGORIES: `${BASE_PATH}/categories`,
    INGREDIENTS: `${BASE_PATH}/ingredients`,
    DEBTS: `${BASE_PATH}/debts`,
    INVESTMENTS: `${BASE_PATH}/investments`,
    QUICK_ACTIONS: `${BASE_PATH}/quickActions`,
};

export const DOCUMENTS = {
    SETTINGS_WHEEL: `${BASE_PATH}/settings/wheel`,
    SETTINGS_LOYALTY: `${BASE_PATH}/settings/loyalty`,
};

export const CUSTOMER_SUBCOLLECTIONS = {
    CARDS: 'cards',
    NOTIFICATIONS: 'notifications',
};
