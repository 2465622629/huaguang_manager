// 通用响应结构 - 匹配后端 Result<T> 模式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 专用的 void 响应类型
export interface ResultVoid {
  code: number;
  message: string;
  data?: string;
  timestamp: number;
}

// 分页请求参数 - 保持兼容性
export interface PageRequest {
  page?: number;
  size?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

// 排序项定义 - 匹配后端 OrderItem
export interface OrderItem {
  column: string;
  asc: boolean;
}

// 分页响应数据 - 匹配后端分页结构
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  orders?: OrderItem[];
  optimizeCountSql?: string;
  searchCount?: string;
  optimizeJoinOfCountSql?: boolean;
  maxLimit?: number;
  countId?: string;
}

// 兼容旧版本的分页响应
export interface LegacyPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 用户类型枚举 - 与后端保持一致
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

// 性别枚举
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
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

// 管理员基本信息 - 匹配后端 AdminInfo
export interface AdminInfo {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  role: AdminRole;
  roleDescription?: string;
  status: AdminStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  avatarUrl?: string;
}

// 管理员登录请求 - 匹配后端 AdminLoginRequest
export interface AdminLoginRequest {
  username: string;
  password: string;
  captcha?: string;
  captchaKey?: string;
  rememberMe?: boolean;
}

// 管理员登录响应 - 匹配后端 AdminLoginResponse
export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  adminInfo: AdminInfo;
  permissions: string[];
  needChangePassword?: boolean;
}

// 管理端用户信息响应 - 匹配后端 AdminUserResponse
export interface AdminUserResponse {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  userType: UserType;
  status: UserStatus;
  avatarUrl?: string;
  realName?: string;
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
  createdAt: string;
  updatedAt: string;
}

// 管理员账号管理响应 - 匹配后端 AdminAccountManagementResponse
export interface AdminAccountManagementResponse {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  role: AdminRole;
  roleDescription?: string;
  status: AdminStatus;
  statusDescription?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  loginAttempts?: number;
  passwordUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 基础分页查询参数
export interface BasePageQuery extends PageRequest {
  status?: string;
  userType?: UserType;
}

// 管理端分页查询参数
export interface AdminPageQuery extends PageRequest {
  role?: AdminRole;
  status?: AdminStatus;
}

// 通用 Result 类型别名
export type Result<T> = ApiResponse<T>;
export type ResultAdminLoginResponse = Result<AdminLoginResponse>;
export type ResultPageAdminUserResponse = Result<PageResponse<AdminUserResponse>>;
export type ResultPageAdminAccountManagementResponse = Result<PageResponse<AdminAccountManagementResponse>>;

// 错误码常量
export const API_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const;

// 默认分页参数
export const DEFAULT_PAGE_PARAMS = {
  page: 1,
  size: 10
} as const; 