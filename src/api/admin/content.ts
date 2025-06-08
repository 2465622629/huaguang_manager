import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  CourseListQuery,
  CourseResponse,
  CourseCreateRequest,
  LegalTemplateResponse,
  PsychTestResponse,
  BatchContentOperationRequest
} from '../types/content';

/**
 * 内容管理API
 */
export class ContentApi {
  /**
   * 获取课程列表
   */
  static async getCourseList(params: CourseListQuery): Promise<ApiResponse<PageResponse<CourseResponse>>> {
    return request.get('/admin/content/courses', { params });
  }

  /**
   * 创建课程
   */
  static async createCourse(data: CourseCreateRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/content/courses', data);
  }

  /**
   * 更新课程
   */
  static async updateCourse(courseId: number, data: Partial<CourseCreateRequest>): Promise<ApiResponse<void>> {
    return request.put(`/admin/content/courses/${courseId}`, data);
  }

  /**
   * 删除课程
   */
  static async deleteCourse(courseId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/content/courses/${courseId}`);
  }

  /**
   * 批量操作课程
   */
  static async batchCourseOperation(data: BatchContentOperationRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/content/courses/batch', data);
  }

  /**
   * 获取法律模板列表
   */
  static async getLegalTemplateList(params: {
    page?: number;
    size?: number;
    keyword?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PageResponse<LegalTemplateResponse>>> {
    return request.get('/admin/content/legal-templates', { params });
  }

  /**
   * 创建法律模板
   */
  static async createLegalTemplate(data: {
    title: string;
    description: string;
    content: string;
    category: string;
    fileUrl?: string;
    tags: string[];
  }): Promise<ApiResponse<void>> {
    return request.post('/admin/content/legal-templates', data);
  }

  /**
   * 更新法律模板
   */
  static async updateLegalTemplate(templateId: number, data: {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    fileUrl?: string;
    tags?: string[];
  }): Promise<ApiResponse<void>> {
    return request.put(`/admin/content/legal-templates/${templateId}`, data);
  }

  /**
   * 删除法律模板
   */
  static async deleteLegalTemplate(templateId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/content/legal-templates/${templateId}`);
  }

  /**
   * 批量操作法律模板
   */
  static async batchLegalTemplateOperation(data: BatchContentOperationRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/content/legal-templates/batch', data);
  }

  /**
   * 获取心理测试列表
   */
  static async getPsychTestList(params: {
    page?: number;
    size?: number;
    keyword?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PageResponse<PsychTestResponse>>> {
    return request.get('/admin/content/psychological-tests', { params });
  }

  /**
   * 创建心理测试
   */
  static async createPsychTest(data: {
    title: string;
    description: string;
    category: string;
    duration: number;
    questions: Array<{
      question: string;
      options: string[];
      type: string;
    }>;
    tags: string[];
  }): Promise<ApiResponse<void>> {
    return request.post('/admin/content/psychological-tests', data);
  }

  /**
   * 更新心理测试
   */
  static async updatePsychTest(testId: number, data: {
    title?: string;
    description?: string;
    category?: string;
    duration?: number;
    questions?: Array<{
      question: string;
      options: string[];
      type: string;
    }>;
    tags?: string[];
  }): Promise<ApiResponse<void>> {
    return request.put(`/admin/content/psychological-tests/${testId}`, data);
  }

  /**
   * 删除心理测试
   */
  static async deletePsychTest(testId: number): Promise<ApiResponse<void>> {
    return request.delete(`/admin/content/psychological-tests/${testId}`);
  }

  /**
   * 批量操作心理测试
   */
  static async batchPsychTestOperation(data: BatchContentOperationRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/content/psychological-tests/batch', data);
  }

  /**
   * 获取内容统计数据
   */
  static async getContentStatistics(): Promise<ApiResponse<{
    courses: {
      total: number;
      published: number;
      draft: number;
      archived: number;
    };
    legalTemplates: {
      total: number;
      published: number;
      draft: number;
      archived: number;
    };
    psychTests: {
      total: number;
      published: number;
      draft: number;
      archived: number;
    };
    categoryDistribution: { category: string; count: number }[];
  }>> {
    return request.get('/admin/content/statistics');
  }
}

// 为方便使用，也导出函数式API
export const {
  getCourseList,
  createCourse,
  updateCourse,
  deleteCourse,
  batchCourseOperation,
  getLegalTemplateList,
  createLegalTemplate,
  updateLegalTemplate,
  deleteLegalTemplate,
  batchLegalTemplateOperation,
  getPsychTestList,
  createPsychTest,
  updatePsychTest,
  deletePsychTest,
  batchPsychTestOperation,
  getContentStatistics
} = ContentApi; 