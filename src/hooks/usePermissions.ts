import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';
import { ROLE_PERMISSIONS, RoleType, Permission } from '../utils/roles';

export function usePermissions(roleOverride?: string) {
    const context = useOutletContext<DashboardContextType | null>();
    const userRole = roleOverride || context?.userRole;

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!userRole) return false;

        // Ensure userRole is a valid RoleType, otherwise access denied
        const rolePermissions = ROLE_PERMISSIONS[userRole as RoleType];

        if (!rolePermissions) {
            console.warn(`Role '${userRole}' undefined in ROLE_PERMISSIONS.`);
            return false;
        }

        return rolePermissions.includes(permission);
    }, [userRole]);

    const isRole = useCallback((role: RoleType) => userRole === role, [userRole]);

    return {
        userRole: userRole as RoleType,
        hasPermission,
        isRole
    };
}
