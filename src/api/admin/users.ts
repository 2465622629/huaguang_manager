import request from '../request';
import type {
  ApiResponse,
  PageResponse,
  UserListQuery,
  UserResponse,
  UserDetailResponse,
  UpdateUserStatusRequest,
  EnterpriseListQuery,
  EnterpriseResponse
} from '../types';

/**
 * 用户管理API
 */
export class UsersApi {
  /**
   * 获取用户列表
   */
  static async getUserList(params: UserListQuery): Promise<ApiResponse<PageResponse<UserResponse>>> {
    return request.get('/admin/users', { params });
  }

  /**
   * 获取用户详情
   */
  static async getUserDetail(userId: number): Promise<ApiResponse<UserDetailResponse>> {
    return request.get(`/admin/users/${userId}`);
  }

  /**
   * 更新用户状态
   */
  static async updateUserStatus(data: UpdateUserStatusRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/users/${data.userId}/status`, data);
  }

  /**
   * 删除用户
   */
  static async deleteUser(userId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/users/${userId}`);
  }

  /**
   * 获取用户统计数据
   */
  static async getUserStatistics(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    userTypeDistribution: { type: string; count: number }[];
  }>> {
    return request.get('/admin/users/statistics');
  }

  /**
   * 获取律师列表
   */
  static async getLawyerList(params: UserListQuery): Promise<ApiResponse<PageResponse<UserResponse>>> {
    return request.get('/admin/users/lawyers', { params });
  }

  /**
   * 审核律师资质
   */
  static async verifyLawyer(lawyerId: number, data: { approved: boolean; reason?: string }): Promise<ApiResponse<void>> {
    return request.put(`/admin/users/lawyers/${lawyerId}/verify`, data);
  }

  /**
   * 获取心理师列表
   */
  static async getPsychologistList(params: UserListQuery): Promise<ApiResponse<PageResponse<UserResponse>>> {
    return request.get('/admin/users/psychologists', { params });
  }

  /**
   * 审核心理师资质
   */
  static async verifyPsychologist(psychologistId: number, data: { approved: boolean; reason?: string }): Promise<ApiResponse<void>> {
    return request.put(`/admin/users/psychologists/${psychologistId}/verify`, data);
  }

  /**
   * 获取企业列表
   */
  static async getEnterpriseList(params: EnterpriseListQuery): Promise<ApiResponse<PageResponse<EnterpriseResponse>>> {
    return request.get('/admin/users/enterprises', { params });
  }

  /**
   * 审核企业认证
   */
  static async verifyEnterprise(enterpriseId: number, data: { approved: boolean; reason?: string }): Promise<ApiResponse<void>> {
    return request.put(`/admin/users/enterprises/${enterpriseId}/verify`, data);
  }

  /**
   * 更新企业状态
   */
  static async updateEnterpriseStatus(enterpriseId: number, data: { status: string; reason?: string }): Promise<ApiResponse<void>> {
    return request.put(`/admin/users/enterprises/${enterpriseId}/status`, data);
  }
}

// 为方便使用，也导出函数式API
export const {
  getUserList,
  getUserDetail,
  updateUserStatus,
  deleteUser,
  getUserStatistics,
  getLawyerList,
  verifyLawyer,
  getPsychologistList,
  verifyPsychologist,
  getEnterpriseList,
  verifyEnterprise,
  updateEnterpriseStatus
} = UsersApi; 