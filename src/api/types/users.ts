import { BaseUser, BasePageQuery, UserType, UserStatus, Gender } from './common';

// 用户查询参数
export interface UserListQuery extends BasePageQuery {
  userType?: UserType;
  status?: UserStatus;
  startDate?: string;
  endDate?: string;
}

// 用户响应数据 - 匹配后端AdminUserResponse
export interface UserResponse extends BaseUser {
  userType: UserType;
  avatarUrl?: string;
  nickname?: string;
  gender?: Gender;
  birthDate?: string;
  bio?: string;
  address?: string;
  wechat?: string;
  qq?: string;
  educationLevel?: string;
  workExperience?: string;
  skills?: string;
  parentContact?: string;
  memberId?: string;
  inviteCode?: string;
  invitedBy?: number;
  updatedAt: string;
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