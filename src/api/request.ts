import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiUrl } from '@/utils/env';

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showErrorMessage?: boolean;
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: getApiUrl() + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 根据业务状态码处理响应
    if (data.success === false) {
      // 处理业务错误
      console.error('业务错误:', data.message);
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    return data;
  },
  (error) => {
    // 处理HTTP错误
    let errorMessage = '网络请求失败';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_info');
          window.location.href = '/';
          break;
        case 403:
          errorMessage = '权限不足';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络状态';
    }
    
    console.error('请求错误:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default request; 