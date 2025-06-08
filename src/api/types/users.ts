import { BaseUser, BasePageQuery, UserType, UserStatus } from './common';

// 用户查询参数
export interface UserListQuery extends BasePageQuery {
  userType?: UserType;
  status?: UserStatus;
}

// 用户响应数据
export interface UserResponse extends BaseUser {
  userType: UserType;
  profileCompleted?: boolean;
  lastLoginAt?: string;
  statisticsData?: {
    loginCount: number;
    applicationCount: number;
    orderCount: number;
  };
}

// 用户详情响应
export interface UserDetailResponse extends UserResponse {
  profile?: {
    birthday?: string;
    gender?: string;
    address?: string;
    education?: string;
    occupation?: string;
    bio?: string;
  };
  verification?: {
    emailVerified: boolean;
    phoneVerified: boolean;
    idCardVerified: boolean;
  };
}

// 用户状态更新请求
export interface UpdateUserStatusRequest {
  userId: number;
  status: UserStatus;
  reason?: string;
} 