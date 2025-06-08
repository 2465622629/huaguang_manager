import { BasePageQuery } from './common';

// 职位状态枚举
export enum JobStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  EXPIRED = 'expired',
  REJECTED = 'rejected'
}

// 职位查询参数
export interface JobListQuery extends BasePageQuery {
  status?: JobStatus;
  enterpriseId?: number;
  category?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
}

// 职位响应数据
export interface JobResponse {
  id: number;
  title: string;
  description: string;
  requirements: string;
  category: string;
  city: string;
  address: string;
  salaryMin: number;
  salaryMax: number;
  experienceRequired: string;
  educationRequired: string;
  status: JobStatus;
  viewCount: number;
  applicationCount: number;
  enterpriseInfo: {
    id: number;
    name: string;
    logo?: string;
    industry: string;
  };
  publishedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 更新职位状态请求
export interface UpdateJobStatusRequest {
  jobId: number;
  status: JobStatus;
  reason?: string;
}

// 审核职位请求
export interface ReviewJobRequest {
  jobId: number;
  approved: boolean;
  reason?: string;
}

// 批量操作职位请求
export interface BatchJobOperationRequest {
  jobIds: number[];
  operation: 'approve' | 'reject' | 'delete' | 'publish';
  reason?: string;
} 