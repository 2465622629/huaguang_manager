import request from '../request';
import type {
  ApiResponse
} from '../types';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminInfo,
  AdminPermissionInfo,
  LogoutRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  CaptchaResponse,
  OnlineAdminInfo,
  PermissionCheckResponse
} from '../types/auth';

/**
 * 管理员认证API
 */
export class AdminAuthApi {
  /**
   * 管理员登录
   */
  static async login(data: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
    return request.post('/admin/auth/login', data);
  }

  /**
   * 管理员登出
   */
  static async logout(data?: LogoutRequest): Promise<ApiResponse<string>> {
    return request.post('/admin/auth/logout', data || {});
  }

  /**
   * 刷新访问令牌
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AdminLoginResponse>> {
    return request.post('/admin/auth/refresh-token', data);
  }

  /**
   * 修改密码
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<string>> {
    return request.post('/admin/auth/change-password', data);
  }

  /**
   * 获取管理员权限
   */
  static async getPermissions(): Promise<ApiResponse<AdminPermissionInfo>> {
    return request.get('/admin/auth/permissions');
  }

  /**
   * 获取当前管理员信息
   */
  static async getCurrentAdmin(): Promise<ApiResponse<AdminInfo>> {
    return request.get('/admin/auth/current-admin');
  }

  /**
   * 检查权限
   */
  static async checkPermission(permission: string): Promise<ApiResponse<boolean>> {
    return request.get('/admin/auth/check-permission', { 
      params: { permission } 
    });
  }

  /**
   * 生成验证码
   */
  static async generateCaptcha(): Promise<ApiResponse<CaptchaResponse>> {
    return request.get('/admin/auth/captcha');
  }

  /**
   * 获取在线管理员列表
   */
  static async getOnlineAdmins(): Promise<ApiResponse<OnlineAdminInfo[]>> {
    return request.get('/admin/auth/online-admins');
  }

  /**
   * 强制下线指定管理员
   */
  static async forceLogout(adminId: number): Promise<ApiResponse<string>> {
    return request.post(`/admin/auth/force-logout/${adminId}`);
  }
}

/**
 * 认证工具类 - 提供本地存储和token管理
 */
export class AuthUtils {
  private static readonly ACCESS_TOKEN_KEY = 'admin_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'admin_refresh_token';
  private static readonly ADMIN_INFO_KEY = 'admin_info';

  /**
   * 保存登录信息
   */
  static saveLoginInfo(loginResponse: AdminLoginResponse): void {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken);
    localStorage.setItem(this.ADMIN_INFO_KEY, JSON.stringify(loginResponse.adminInfo));
  }

  /**
   * 获取访问令牌
   */
  static getAccessToken(): string | null {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * 获取刷新令牌
   */
  static getRefreshToken(): string | null {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * 获取管理员信息
   */
  static getAdminInfo(): AdminInfo | null {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return null;
    }
    
    const adminInfoStr = localStorage.getItem(this.ADMIN_INFO_KEY);
    if (adminInfoStr) {
      try {
        return JSON.parse(adminInfoStr);
      } catch (error) {
        console.error('解析管理员信息失败:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 清除登录信息
   */
  static clearLoginInfo(): void {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_INFO_KEY);
  }

  /**
   * 检查是否已登录
   */
  static isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * 检查管理员是否有指定权限
   */
  static hasPermission(permission: string): boolean {
    const adminInfo = this.getAdminInfo();
    if (!adminInfo) return false;
    
    // 超级管理员拥有所有权限
    if (adminInfo.role === 'super_admin') return true;
    
    return adminInfo.permissions.includes(permission);
  }

  /**
   * 检查管理员角色
   */
  static hasRole(role: string): boolean {
    const adminInfo = this.getAdminInfo();
    return adminInfo?.role === role;
  }
}

// 为方便使用，也导出函数式API
export const {
  login,
  logout,
  refreshToken,
  changePassword,
  getPermissions,
  getCurrentAdmin,
  checkPermission,
  generateCaptcha,
  getOnlineAdmins,
  forceLogout
} = AdminAuthApi; 