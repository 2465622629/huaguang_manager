import { ReactNode } from 'react';

/**
 * 菜单项配置接口
 */
export interface MenuItem {
  /** 菜单项唯一标识 */
  key: string;
  /** 菜单项名称 */
  name: string;
  /** 路由路径 */
  path?: string;
  /** 菜单图标 */
  icon?: ReactNode;
  /** 子菜单 */
  children?: MenuItem[];
  /** 是否隐藏 */
  hideInMenu?: boolean;
  /** 是否隐藏子菜单 */
  hideChildrenInMenu?: boolean;
  /** 访问该菜单所需的权限 */
  permissions?: string[];
  /** 访问该菜单所需的角色 */
  roles?: string[];
  /** 菜单组件路径 */
  component?: string;
  /** 重定向路径 */
  redirect?: string;
  /** 是否为分割线 */
  divider?: boolean;
  /** 菜单项是否禁用 */
  disabled?: boolean;
  /** 外链地址 */
  target?: string;
}

/**
 * 菜单配置
 */
export interface MenuConfig {
  /** 菜单路由根路径 */
  path: string;
  /** 菜单项列表 */
  routes: MenuItem[];
}

/**
 * 权限控制上下文
 */
export interface PermissionContext {
  /** 用户角色 */
  role?: string;
  /** 用户权限列表 */
  permissions?: string[];
  /** 检查是否有指定权限 */
  hasPermission: (permission: string) => boolean;
  /** 检查是否有指定角色 */
  hasRole: (role: string) => boolean;
  /** 检查是否可以访问菜单项 */
  canAccessMenu: (menuItem: MenuItem) => boolean;
}

/**
 * 菜单权限验证函数类型
 */
export type MenuPermissionChecker = (
  menuItem: MenuItem,
  context: PermissionContext
) => boolean; 