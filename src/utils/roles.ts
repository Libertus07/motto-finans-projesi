export type RoleType = 'patron' | 'kasiyer' | 'garson';

export const PERMISSIONS = {
    // Orders
    ORDER_CREATE: 'order.create',
    ORDER_UPDATE: 'order.update',
    ORDER_DELETE: 'order.delete', // Voiding an item from bill

    // Tables
    TABLE_VIEW: 'table.view',
    TABLE_MANAGE: 'table.manage', // Clear, Transfer, etc.
    TABLE_CLOSE: 'table.close',   // Taking payment

    // Reports & Analytics
    REPORT_VIEW: 'report.view',
    TRANSACTION_MANAGE: 'transaction.manage',
    VIEW_FINANCIALS: 'report.financials', // Investments, specific stats

    // Products & Inventory
    PRODUCT_MANAGE: 'product.manage', // Add/Edit/Delete Products
    INVENTORY_MANAGE: 'inventory.manage',
    RECIPE_MANAGE: 'recipe.manage',

    // Settings & Staff
    SETTINGS_EDIT: 'settings.edit',
    STAFF_MANAGE: 'staff.manage',
    MANAGE_CUSTOMERS: 'customer.manage',

    // POS specific
    POS_ACCESS: 'pos.access',
    POS_DISCOUNT: 'pos.discount',
    POS_REFUND: 'pos.refund'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
    patron: Object.values(PERMISSIONS), // Admin has all permissions

    kasiyer: [
        PERMISSIONS.ORDER_CREATE,
        PERMISSIONS.ORDER_UPDATE,
        PERMISSIONS.TABLE_VIEW,
        PERMISSIONS.TABLE_CLOSE,
        PERMISSIONS.REPORT_VIEW, // Limited view often, but allowing for now
        PERMISSIONS.POS_ACCESS,
        PERMISSIONS.POS_DISCOUNT,
        PERMISSIONS.POS_REFUND
    ],

    garson: [
        PERMISSIONS.ORDER_CREATE,
        PERMISSIONS.ORDER_UPDATE,
        PERMISSIONS.TABLE_VIEW
        // Cannot close tables or delete items by default
    ]
};

export const ROLE_LABELS: Record<RoleType, string> = {
    patron: 'Yönetici (Patron)',
    kasiyer: 'Kasiyer',
    garson: 'Garson'
};
