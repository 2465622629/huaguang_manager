import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  BaseReviewQuery,
  AdminAssistanceApplicationResponse,
  AdminCreditRepairApplicationResponse,
  AdminLegalDocumentResponse,
  ReviewRequest,
  ApproveAssistanceRequest
} from '../types/content-review';

/**
 * 内容审核API
 */
export class ContentReviewApi {
  /**
   * 获取帮扶申请列表
   */
  static async getAssistanceApplications(params: BaseReviewQuery): Promise<ApiResponse<PageResponse<AdminAssistanceApplicationResponse>>> {
    return request.get('/admin/content-review/assistance/applications', { params });
  }

  /**
   * 获取帮扶申请详情
   */
  static async getAssistanceApplicationDetail(applicationId: number): Promise<ApiResponse<AdminAssistanceApplicationResponse>> {
    return request.get(`/admin/content-review/assistance/applications/${applicationId}`);
  }

  /**
   * 审核帮扶申请
   */
  static async reviewAssistanceApplication(applicationId: number, data: ReviewRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/content-review/assistance/applications/${applicationId}/review`, data);
  }

  /**
   * 批准帮扶申请
   */
  static async approveAssistanceApplication(applicationId: number, data: ApproveAssistanceRequest): Promise<ApiResponse<void>> {
    return request.post(`/admin/content-review/assistance/applications/${applicationId}/approve`, data);
  }

  /**
   * 获取信用修复申请列表
   */
  static async getCreditRepairApplications(params: BaseReviewQuery): Promise<ApiResponse<PageResponse<AdminCreditRepairApplicationResponse>>> {
    return request.get('/admin/content-review/credit-repair/applications', { params });
  }

  /**
   * 获取信用修复申请详情
   */
  static async getCreditRepairApplicationDetail(applicationId: number): Promise<ApiResponse<AdminCreditRepairApplicationResponse>> {
    return request.get(`/admin/content-review/credit-repair/applications/${applicationId}`);
  }

  /**
   * 审核信用修复申请
   */
  static async reviewCreditRepairApplication(applicationId: number, data: ReviewRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/content-review/credit-repair/applications/${applicationId}/review`, data);
  }

  /**
   * 获取法律文书审核历史
   */
  static async getLegalDocumentHistory(params: BaseReviewQuery): Promise<ApiResponse<PageResponse<AdminLegalDocumentResponse>>> {
    return request.get('/admin/content-review/legal-documents/history', { params });
  }

  /**
   * 获取法律文书详情
   */
  static async getLegalDocumentDetail(documentId: number): Promise<ApiResponse<AdminLegalDocumentResponse>> {
    return request.get(`/admin/content-review/legal-documents/${documentId}`);
  }

  /**
   * 审核法律文书
   */
  static async reviewLegalDocument(documentId: number, data: ReviewRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/content-review/legal-documents/${documentId}/review`, data);
  }

  /**
   * 获取内容审核统计数据
   */
  static async getContentReviewStatistics(): Promise<ApiResponse<{
    totalPending: number;
    totalReviewed: number;
    assistanceApplications: {
      pending: number;
      approved: number;
      rejected: number;
    };
    creditRepairApplications: {
      pending: number;
      approved: number;
      rejected: number;
    };
    legalDocuments: {
      pending: number;
      approved: number;
      rejected: number;
    };
  }>> {
    return request.get('/admin/content-review/statistics');
  }
}

// 为方便使用，也导出函数式API
export const {
  getAssistanceApplications,
  getAssistanceApplicationDetail,
  reviewAssistanceApplication,
  approveAssistanceApplication,
  getCreditRepairApplications,
  getCreditRepairApplicationDetail,
  reviewCreditRepairApplication,
  getLegalDocumentHistory,
  getLegalDocumentDetail,
  reviewLegalDocument,
  getContentReviewStatistics
} = ContentReviewApi; 