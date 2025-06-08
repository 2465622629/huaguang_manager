import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  AdminListQuery,
  AdminResponse,
  AdminCreateRequest,
  AdminUpdateRequest,
  UpdateAdminStatusRequest,
  AssignRoleRequest,
  ResetPasswordRequest
} from '../types/administrators';

/**
 * 管理员管理API
 */
export class AdministratorsApi {
  /**
   * 获取管理员列表
   */
  static async getAdministratorList(params: AdminListQuery): Promise<ApiResponse<PageResponse<AdminResponse>>> {
    return request.get('/admin/administrators', { params });
  }

  /**
   * 创建管理员账号
   */
  static async createAdministrator(data: AdminCreateRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/administrators', data);
  }

  /**
   * 更新管理员信息
   */
  static async updateAdministrator(adminId: number, data: AdminUpdateRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/administrators/${adminId}`, data);
  }

  /**
   * 删除管理员账号
   */
  static async deleteAdministrator(adminId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/administrators/${adminId}`);
  }

  /**
   * 更新管理员状态
   */
  static async updateAdministratorStatus(data: UpdateAdminStatusRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/administrators/${data.adminId}/status`, data);
  }

  /**
   * 分配角色
   */
  static async assignRole(data: AssignRoleRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/administrators/${data.adminId}/role`, data);
  }

  /**
   * 重置密码
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return request.post(`/admin/administrators/${data.adminId}/reset-password`, data);
  }

  /**
   * 强制下线
   */
  static async forceLogout(adminId: number): Promise<ApiResponse<void>> {
    return request.post(`/admin/administrators/${adminId}/force-logout`);
  }

  /**
   * 获取登录记录
   */
  static async getLoginRecords(adminId: number, params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<{
    id: number;
    loginTime: string;
    ip: string;
    location: string;
    userAgent: string;
    success: boolean;
  }>>> {
    return request.get(`/admin/administrators/${adminId}/login-records`, { params });
  }

  /**
   * 获取管理员统计数据
   */
  static async getAdministratorStatistics(): Promise<ApiResponse<{
    totalAdmins: number;
    activeAdmins: number;
    onlineAdmins: number;
    roleDistribution: { role: string; count: number }[];
  }>> {
    return request.get('/admin/administrators/statistics');
  }
}

// 为方便使用，也导出函数式API
export const {
  getAdministratorList,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator,
  updateAdministratorStatus,
  assignRole,
  resetPassword,
  forceLogout,
  getLoginRecords,
  getAdministratorStatistics
} = AdministratorsApi; 