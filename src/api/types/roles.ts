import { BasePageQuery } from './common';

/**
 * 角色数据类型
 */
export interface RoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
}

/**
 * 角色列表查询参数
 */
export interface RoleListQuery extends BasePageQuery {
  status?: 'active' | 'inactive';
  keyword?: string;
}

/**
 * 创建角色请求
 */
export interface RoleCreateRequest {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
}

/**
 * 更新角色请求
 */
export interface RoleUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  permissions?: string[];
}

/**
 * 角色权限更新请求
 */
export interface RolePermissionUpdateRequest {
  roleId: string;
  permissions: string[];
}

/**
 * 角色统计信息（从管理员统计API获取）
 */
export interface RoleStatistics {
  role: string;
  count: number;
} 