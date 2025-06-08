import { AdminRole, AdminStatus } from './common';

// 管理员登录请求
export interface AdminLoginRequest {
  username: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
  rememberMe?: boolean;
}

// 管理员登录响应
export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  adminInfo: AdminInfo;
}

// 管理员信息
export interface AdminInfo {
  id: number;
  username: string;
  realName: string;
  email: string;
  avatar?: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
}

// 权限信息
export interface AdminPermissionInfo {
  adminId: number;
  role: AdminRole;
  permissions: string[];
  menus: MenuPermission[];
}

// 菜单权限
export interface MenuPermission {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuPermission[];
  permissions?: string[];
}

// 登出请求
export interface LogoutRequest {
  refreshToken?: string;
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 验证码响应
export interface CaptchaResponse {
  captchaId: string;
  captchaImage: string; // base64编码的图片
  expiresIn: number;
}

// 在线管理员信息
export interface OnlineAdminInfo {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  role: AdminRole;
  loginTime: string;
  lastActiveTime: string;
  ip: string;
  location: string;
  userAgent: string;
}

// 权限检查响应
export interface PermissionCheckResponse {
  hasPermission: boolean;
  permission: string;
  adminId: number;
}

// JWT令牌信息
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
} 