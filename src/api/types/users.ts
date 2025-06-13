import { BaseUser, BasePageQuery, UserType, UserStatus, Gender } from './common';

// 用户查询参数
export interface UserListQuery extends BasePageQuery {
  userType?: UserType;
  status?: UserStatus;
  startDate?: string;
  endDate?: string;
}

// 企业用户查询参数
export interface EnterpriseListQuery extends BasePageQuery {
  status?: UserStatus;
  industry?: string;
  companySize?: string;
  enterpriseStatus?: string;
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

// 企业用户响应数据 - 匹配后端API响应结构
export interface EnterpriseResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  phone: string;
  status: string;
  companyName: string;
  companyType: string;
  companySize: string;
  industry: string;
  description: string;
  address: string;
  website: string;
  logoUrl: string;
  benefits: string[];
  enterpriseStatus: string;
  createdAt: string;
  updatedAt: string;
}

// 用户状态更新请求
export interface UpdateUserStatusRequest {
  userId: number;
  status: UserStatus;
  reason?: string;
} 