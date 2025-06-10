import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  RoleItem,
  RoleListQuery,
  RoleCreateRequest,
  RoleUpdateRequest,
  RolePermissionUpdateRequest
} from '../types/roles';
import { AdministratorsApi } from './administrators';

/**
 * 角色管理API
 * 基于现有管理员统计API的混合实现方案
 */
export class RolesApi {
  /**
   * 获取角色列表
   * 基于管理员统计数据构建角色列表
   */
  static async getRoleList(params: RoleListQuery): Promise<ApiResponse<PageResponse<RoleItem>>> {
    try {
      // 获取管理员统计数据
      const statsResponse = await AdministratorsApi.getAdministratorStatistics();
      
      if (!statsResponse || !statsResponse.roleDistribution) {
        throw new Error('获取角色统计数据失败');
      }

      // 角色配置映射（前端配置）
      const roleConfigs = {
        'super_admin': {
          name: '超级管理员',
          description: '拥有系统所有权限',
          permissions: ['*'],
          status: 'active' as const
        },
        'operation_manager': {
          name: '运营管理员',
          description: '负责日常运营管理',
          permissions: ['user:list', 'user:edit', 'content:review', 'order:consultation:view'],
          status: 'active' as const
        },
        'reviewer': {
          name: '审核员',
          description: '负责内容和用户审核',
          permissions: ['lawyer:review', 'psychologist:review', 'content:review'],
          status: 'active' as const
        },
        'customer_service': {
          name: '客服专员',
          description: '负责客户服务和支持',
          permissions: ['user:list', 'order:consultation:view'],
          status: 'active' as const
        }
      };

      // 将统计数据转换为角色列表
      const roles: RoleItem[] = statsResponse.roleDistribution.map((item, index) => {
        const config = roleConfigs[item.role as keyof typeof roleConfigs];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        return {
          id: `role_${index + 1}`,
          name: config?.name || item.role,
          code: item.role,
          description: config?.description || `${item.role}角色`,
          permissions: config?.permissions || [],
          userCount: item.count,
          status: config?.status || 'active',
          createTime: now,
          updateTime: now
        };
      });

      // 应用查询过滤
      let filteredRoles = roles;
      
      if (params.status) {
        filteredRoles = filteredRoles.filter(role => role.status === params.status);
      }
      
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredRoles = filteredRoles.filter(role => 
          role.name.toLowerCase().includes(keyword) ||
          role.code.toLowerCase().includes(keyword) ||
          role.description.toLowerCase().includes(keyword)
        );
      }

      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          list: paginatedRoles,
          total: filteredRoles.length,
          current: page,
          pageSize: pageSize
        }
      };
    } catch (error) {
      console.error('获取角色列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建角色（预留接口）
   * 注意：当前后端暂无角色管理接口，这是为未来API预留的接口
   */
  static async createRole(data: RoleCreateRequest): Promise<ApiResponse<void>> {
    // TODO: 实际的API调用
    // return request.post('/admin/roles', data);
    
    console.log('创建角色 - 预留接口调用:', data);
    
    // 模拟API响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '功能开发中：角色创建接口暂未实现，请联系开发团队'
        });
      }, 500);
    });
  }

  /**
   * 更新角色（预留接口）
   * 注意：当前后端暂无角色管理接口，这是为未来API预留的接口
   */
  static async updateRole(roleId: string, data: RoleUpdateRequest): Promise<ApiResponse<void>> {
    // TODO: 实际的API调用
    // return request.put(`/admin/roles/${roleId}`, data);
    
    console.log('更新角色 - 预留接口调用:', { roleId, data });
    
    // 模拟API响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '功能开发中：角色更新接口暂未实现，请联系开发团队'
        });
      }, 500);
    });
  }

  /**
   * 删除角色（预留接口）
   * 注意：当前后端暂无角色管理接口，这是为未来API预留的接口
   */
  static async deleteRole(roleId: string): Promise<ApiResponse<void>> {
    // TODO: 实际的API调用
    // return request.delete(`/admin/roles/${roleId}`);
    
    console.log('删除角色 - 预留接口调用:', roleId);
    
    // 模拟API响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '功能开发中：角色删除接口暂未实现，请联系开发团队'
        });
      }, 500);
    });
  }

  /**
   * 更新角色权限（预留接口）
   * 注意：当前后端暂无权限管理接口，这是为未来API预留的接口
   */
  static async updateRolePermissions(data: RolePermissionUpdateRequest): Promise<ApiResponse<void>> {
    // TODO: 实际的API调用
    // return request.put(`/admin/roles/${data.roleId}/permissions`, { permissions: data.permissions });
    
    console.log('更新角色权限 - 预留接口调用:', data);
    
    // 模拟API响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '功能开发中：权限管理接口暂未实现，请联系开发团队'
        });
      }, 500);
    });
  }
}

// 为方便使用，也导出函数式API
export const {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions
} = RolesApi; 