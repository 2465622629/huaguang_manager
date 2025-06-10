'use client';

import { useMemo } from 'react';
import { AuthUtils } from '@/api/admin/auth';
import type { MenuItem, PermissionContext } from '@/types/menu';

/**
 * 权限检查Hook
 * 提供权限验证相关的工具函数
 */
export const usePermission = () => {
  const permissionContext: PermissionContext = useMemo(() => {
    const adminInfo = AuthUtils.getAdminInfo();
    
    return {
      role: adminInfo?.role,
      permissions: adminInfo?.permissions || [],
      
      hasPermission: (permission: string) => {
        return AuthUtils.hasPermission(permission);
      },
      
      hasRole: (role: string) => {
        return AuthUtils.hasRole(role);
      },
      
      canAccessMenu: (menuItem: MenuItem) => {
        // 超级管理员可以访问所有菜单
        if (adminInfo?.role === 'super_admin') {
          return true;
        }
        
        // 检查角色要求
        if (menuItem.roles && menuItem.roles.length > 0) {
          const hasRequiredRole = menuItem.roles.some(role => 
            AuthUtils.hasRole(role)
          );
          if (!hasRequiredRole) {
            return false;
          }
        }
        
        // 检查权限要求
        if (menuItem.permissions && menuItem.permissions.length > 0) {
          const hasRequiredPermission = menuItem.permissions.some(permission => 
            AuthUtils.hasPermission(permission)
          );
          if (!hasRequiredPermission) {
            return false;
          }
        }
        
        return true;
      },
    };
  }, []);
  
  /**
   * 检查是否有指定权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissionContext.hasPermission(permission);
  };
  
  /**
   * 检查是否有指定角色
   */
  const hasRole = (role: string): boolean => {
    return permissionContext.hasRole(role);
  };
  
  /**
   * 检查是否可以访问指定菜单
   */
  const canAccessMenu = (menuItem: MenuItem): boolean => {
    return permissionContext.canAccessMenu(menuItem);
  };
  
  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  /**
   * 检查是否有任一角色
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };
  
  /**
   * 检查是否已登录
   */
  const isLoggedIn = (): boolean => {
    return AuthUtils.isLoggedIn();
  };
  
  /**
   * 获取当前用户信息
   */
  const getCurrentUser = () => {
    return AuthUtils.getAdminInfo();
  };
  
  return {
    permissionContext,
    hasPermission,
    hasRole,
    canAccessMenu,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    isLoggedIn,
    getCurrentUser,
  };
}; 