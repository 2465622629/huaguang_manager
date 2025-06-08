// 通用响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code?: number;
  timestamp?: string;
}

// 分页请求参数
export interface PageRequest {
  page?: number;
  size?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

// 分页响应数据
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 用户类型枚举
export enum UserType {
  USER = 'user',
  LAWYER = 'lawyer',
  PSYCHOLOGIST = 'psychologist',
  ENTERPRISE = 'enterprise'
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

// 管理员角色枚举
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  OPERATION_MANAGER = 'operation_manager',
  REVIEWER = 'reviewer',
  CUSTOMER_SERVICE = 'customer_service'
}

// 管理员状态枚举
export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked'
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 咨询师类型枚举
export enum ConsultantType {
  LAWYER = 'lawyer',
  PSYCHOLOGIST = 'psychologist'
}

// 服务类型枚举
export enum ServiceType {
  TEXT_CONSULTATION = 'text_consultation',
  VOICE_CONSULTATION = 'voice_consultation',
  VIDEO_CONSULTATION = 'video_consultation'
}

// 基础用户信息
export interface BaseUser {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// 基础分页查询参数
export interface BasePageQuery extends PageRequest {
  status?: string;
  userType?: string;
} 