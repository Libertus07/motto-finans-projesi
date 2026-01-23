import { appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';

const BASE_PATH = `artifacts/${appId}/shops/${SHOP_ID}`;

export const COLLECTIONS = {
    CUSTOMERS: `${BASE_PATH}/customers`,
    TRANSACTIONS: `${BASE_PATH}/transactions`,
    ORDERS: `${BASE_PATH}/orders`,
    CAMPAIGNS: `${BASE_PATH}/campaigns`,
    PRODUCTS: `${BASE_PATH}/products`,
    NOTIFICATIONS: `${BASE_PATH}/notifications`, // Shop notifications
};

export const DOCUMENTS = {
    SETTINGS_WHEEL: `${BASE_PATH}/settings/wheel`,
    SETTINGS_LOYALTY: `${BASE_PATH}/settings/loyalty`,
};

export const CUSTOMER_SUBCOLLECTIONS = {
    CARDS: 'cards',
    NOTIFICATIONS: 'notifications',
};