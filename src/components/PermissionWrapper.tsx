'use client';

import React from 'react';
import { AuthUtils } from '@/api/admin/auth';

interface PermissionWrapperProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 需要的权限列表，满足其中任一即可 */
  permissions?: string[];
  /** 需要的角色列表，满足其中任一即可 */
  roles?: string[];
  /** 当没有权限时显示的内容 */
  fallback?: React.ReactNode;
  /** 是否严格模式，需要满足所有权限 */
  strict?: boolean;
}

/**
 * 权限控制包装组件
 * 根据用户权限和角色决定是否渲染子组件
 */
const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  strict = false,
}) => {
  // 检查是否已登录
  if (!AuthUtils.isLoggedIn()) {
    return <>{fallback}</>;
  }

  const adminInfo = AuthUtils.getAdminInfo();
  if (!adminInfo) {
    return <>{fallback}</>;
  }

  // 超级管理员拥有所有权限
  if (adminInfo.role === 'super_admin') {
    return <>{children}</>;
  }

  let hasPermission = true;
  let hasRole = true;

  // 检查权限
  if (permissions.length > 0) {
    if (strict) {
      // 严格模式：需要拥有所有权限
      hasPermission = permissions.every(permission => 
        AuthUtils.hasPermission(permission)
      );
    } else {
      // 非严格模式：拥有任一权限即可
      hasPermission = permissions.some(permission => 
        AuthUtils.hasPermission(permission)
      );
    }
  }

  // 检查角色
  if (roles.length > 0) {
    if (strict) {
      // 严格模式：需要拥有所有角色（通常不会有这种情况）
      hasRole = roles.every(role => AuthUtils.hasRole(role));
    } else {
      // 非严格模式：拥有任一角色即可
      hasRole = roles.some(role => AuthUtils.hasRole(role));
    }
  }

  // 权限和角色都需要通过验证
  if (hasPermission && hasRole) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionWrapper; 