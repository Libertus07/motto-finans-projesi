import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, appId } from './firebase';
import { SHOP_ID } from '../utils/constants';
import { Investment, Debt, Ingredient, QuickAction } from '../types';

export const FinanceService = {
    subscribeToInvestments: (onUpdate: (data: Investment[]) => void): Unsubscribe => {
        return onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'investments'),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
                onUpdate(data);
            }
        );
    },

    subscribeToDebts: (onUpdate: (data: Debt[]) => void): Unsubscribe => {
        return onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'debts'),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
                onUpdate(data);
            }
        );
    },

    subscribeToIngredients: (onUpdate: (data: Ingredient[]) => void): Unsubscribe => {
        return onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'ingredients'),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
                onUpdate(data);
            }
        );
    },

    subscribeToQuickActions: (onUpdate: (data: QuickAction[]) => void): Unsubscribe => {
        return onSnapshot(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'quickActions'),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuickAction));
                onUpdate(data);
            }
        );
    }
};
