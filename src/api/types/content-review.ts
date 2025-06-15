/**
 * 内容审核相关类型定义
 */

// 审核状态枚举
export type ReviewStatus = 'pending' | 'pending_review' | 'under_review' | 'approved' | 'rejected' | 'completed';

// 审核类型枚举
export type ReviewType = 'legal_document' | 'assistance_application' | 'credit_repair';

// 基础查询参数
export interface BaseReviewQuery {
  page?: number;
  size?: number;
  status?: ReviewStatus;
  reviewType?: ReviewType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  reviewerId?: number;
  userId?: number;
}

// 帮扶申请响应类型
export interface AdminAssistanceApplicationResponse {
  id: number;
  userId: number;
  userName: string;
  userPhone: string;
  applicationType: string;
  applicationTypeText: string;
  title: string;
  description: string;
  attachments: string[];
  status: ReviewStatus;
  statusText: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewTime?: string;
  reviewComment?: string;
  createdTime: string;
  updatedTime: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  urgencyLevelText: string;
  amount?: number;
  expectedCompletionDate?: string;
}

// 信用修复申请响应类型
export interface AdminCreditRepairApplicationResponse {
  id: number;
  userId: number;
  userName: string;
  userPhone: string;
  idCard: string;
  creditIssueType: string;
  creditIssueTypeText: string;
  description: string;
  evidenceFiles: string[];
  status: ReviewStatus;
  statusText: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewTime?: string;
  reviewComment?: string;
  createdTime: string;
  updatedTime: string;
  repairAmount?: number;
  expectedRepairDate?: string;
}

// 法律文书响应类型
export interface AdminLegalDocumentResponse {
  id: number;
  userId: number;
  userName: string;
  userPhone: string;
  documentType: string;
  documentTypeText: string;
  title: string;
  content: string;
  attachments: string[];
  status: ReviewStatus;
  statusText: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewTime?: string;
  reviewComment?: string;
  createdTime: string;
  updatedTime: string;
  lawyerId?: number;
  lawyerName?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  urgencyLevelText: string;
}

// 在线管理员信息
export interface OnlineAdminInfo {
  adminId: number;
  username: string;
  realName: string;
  avatar?: string;
  roleName: string;
  loginTime: string;
  lastActiveTime: string;
  ipAddress: string;
  location?: string;
  deviceInfo?: string;
  onlineDuration: number; // 在线时长（分钟）
}

// 审核操作请求
export interface ReviewRequest {
  status: ReviewStatus;
  comment?: string;
}

// 批准帮扶申请请求
export interface ApproveAssistanceRequest {
  approvedAmount?: number;
  comment?: string;
  expectedCompletionDate?: string;
} 