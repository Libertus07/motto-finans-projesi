import React from 'react';
import { Permission } from '../utils/roles';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
