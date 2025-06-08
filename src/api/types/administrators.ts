import { BasePageQuery, AdminRole, AdminStatus } from './common';

// 管理员查询参数
export interface AdminListQuery extends BasePageQuery {
  role?: AdminRole;
  status?: AdminStatus;
}

// 管理员响应数据
export interface AdminResponse {
  id: number;
  username: string;
  realName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  avatar?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

// 创建管理员请求
export interface AdminCreateRequest {
  username: string;
  realName: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions?: string[];
}

// 更新管理员信息请求
export interface AdminUpdateRequest {
  realName?: string;
  email?: string;
  role?: AdminRole;
  permissions?: string[];
}

// 更新管理员状态请求
export interface UpdateAdminStatusRequest {
  adminId: number;
  status: AdminStatus;
  reason?: string;
}

// 分配角色请求
export interface AssignRoleRequest {
  adminId: number;
  role: AdminRole;
  permissions?: string[];
}

// 重置密码请求
export interface ResetPasswordRequest {
  adminId: number;
  newPassword: string;
} 