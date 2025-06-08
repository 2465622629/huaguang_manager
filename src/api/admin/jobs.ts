import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  JobListQuery,
  JobResponse,
  UpdateJobStatusRequest,
  ReviewJobRequest,
  BatchJobOperationRequest
} from '../types/jobs';

/**
 * 职位管理API
 */
export class JobsApi {
  /**
   * 获取职位列表
   */
  static async getJobList(data: JobListQuery): Promise<ApiResponse<PageResponse<JobResponse>>> {
    return request.post('/admin/jobs/list', data);
  }

  /**
   * 获取职位详情
   */
  static async getJobDetail(jobId: number): Promise<ApiResponse<JobResponse>> {
    return request.get(`/admin/jobs/${jobId}`);
  }

  /**
   * 更新职位状态
   */
  static async updateJobStatus(data: UpdateJobStatusRequest): Promise<ApiResponse<void>> {
    return request.put('/admin/jobs/status', data);
  }

  /**
   * 审核职位
   */
  static async reviewJob(data: ReviewJobRequest): Promise<ApiResponse<void>> {
    return request.put('/admin/jobs/review', data);
  }

  /**
   * 删除职位
   */
  static async deleteJob(jobId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/jobs/${jobId}`);
  }

  /**
   * 批量操作职位
   */
  static async batchJobOperation(data: BatchJobOperationRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/jobs/batch-operation', data);
  }

  /**
   * 获取职位统计数据
   */
  static async getJobStatistics(): Promise<ApiResponse<{
    totalJobs: number;
    publishedJobs: number;
    pendingJobs: number;
    expiredJobs: number;
    categoryDistribution: { category: string; count: number }[];
    cityDistribution: { city: string; count: number }[];
  }>> {
    return request.get('/admin/jobs/statistics');
  }

  /**
   * 获取企业职位列表
   */
  static async getEnterpriseJobs(enterpriseId: number, params?: JobListQuery): Promise<ApiResponse<PageResponse<JobResponse>>> {
    return request.get(`/admin/jobs/enterprise/${enterpriseId}`, { params });
  }

  /**
   * 获取求职申请列表
   */
  static async getJobApplications(data: {
    page?: number;
    size?: number;
    jobId?: number;
    applicantId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PageResponse<{
    id: number;
    jobInfo: {
      id: number;
      title: string;
      company: string;
    };
    applicantInfo: {
      id: number;
      name: string;
      avatar?: string;
      phone?: string;
      email?: string;
    };
    status: string;
    resumeUrl?: string;
    appliedAt: string;
    updatedAt: string;
  }>>> {
    return request.post('/admin/jobs/applications/list', data);
  }

  /**
   * 获取求职申请详情
   */
  static async getJobApplicationDetail(applicationId: number): Promise<ApiResponse<{
    id: number;
    jobInfo: JobResponse;
    applicantInfo: {
      id: number;
      name: string;
      avatar?: string;
      phone?: string;
      email?: string;
      profile: Record<string, any>;
    };
    status: string;
    resumeUrl?: string;
    coverLetter?: string;
    appliedAt: string;
    updatedAt: string;
  }>> {
    return request.get(`/admin/jobs/applications/${applicationId}`);
  }

  /**
   * 获取申请统计数据
   */
  static async getApplicationStatistics(): Promise<ApiResponse<{
    totalApplications: number;
    todayApplications: number;
    statusDistribution: { status: string; count: number }[];
    monthlyTrend: { month: string; count: number }[];
  }>> {
    return request.get('/admin/jobs/applications/statistics');
  }

  /**
   * 获取申请趋势分析
   */
  static async getApplicationTrends(): Promise<ApiResponse<{
    dailyTrend: { date: string; count: number }[];
    jobCategoryTrend: { category: string; count: number }[];
    successRate: number;
  }>> {
    return request.get('/admin/jobs/applications/trends');
  }

  /**
   * 获取招聘活动监控数据
   */
  static async getRecruitmentMonitor(): Promise<ApiResponse<{
    activeJobs: number;
    totalViews: number;
    totalApplications: number;
    conversionRate: number;
    topPerformingJobs: Array<{
      id: number;
      title: string;
      views: number;
      applications: number;
      conversionRate: number;
    }>;
  }>> {
    return request.get('/admin/jobs/recruitment/monitor');
  }
}

// 为方便使用，也导出函数式API
export const {
  getJobList,
  getJobDetail,
  updateJobStatus,
  reviewJob,
  deleteJob,
  batchJobOperation,
  getJobStatistics,
  getEnterpriseJobs,
  getJobApplications,
  getJobApplicationDetail,
  getApplicationStatistics,
  getApplicationTrends,
  getRecruitmentMonitor
} = JobsApi; 