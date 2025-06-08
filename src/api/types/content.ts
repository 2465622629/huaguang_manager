import { BasePageQuery } from './common';

// 内容状态枚举
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 课程查询参数
export interface CourseListQuery extends BasePageQuery {
  category?: string;
  status?: ContentStatus;
  instructorId?: number;
}

// 课程响应数据
export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
  duration: number; // 分钟
  status: ContentStatus;
  coverImage?: string;
  videoUrl?: string;
  viewCount: number;
  favoriteCount: number;
  rating: number;
  ratingCount: number;
  instructorInfo: {
    id: number;
    name: string;
    avatar?: string;
    title: string;
    bio: string;
  };
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 创建课程请求
export interface CourseCreateRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
  duration: number;
  coverImage?: string;
  videoUrl?: string;
  instructorId: number;
  tags: string[];
}

// 法律模板响应数据
export interface LegalTemplateResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  status: ContentStatus;
  downloadCount: number;
  fileUrl?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 心理测试响应数据
export interface PsychTestResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  status: ContentStatus;
  questionCount: number;
  completionCount: number;
  averageScore: number;
  duration: number; // 分钟
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 批量操作内容请求
export interface BatchContentOperationRequest {
  ids: number[];
  operation: 'publish' | 'archive' | 'delete';
} 