'use client';

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiDataOptions {
  /** 是否立即执行请求 */
  immediate?: boolean;
  /** 成功时是否显示提示 */
  showSuccessMessage?: boolean;
  /** 错误时是否显示提示 */
  showErrorMessage?: boolean;
  /** 成功提示文本 */
  successMessage?: string;
  /** 错误提示文本 */
  errorMessage?: string;
}

/**
 * API数据管理Hook
 * 提供加载状态、错误处理、重新请求等功能
 */
export function useApiData<T>(
  apiFunction: () => Promise<T>,
  options: UseApiDataOptions = {}
) {
  const {
    immediate = true,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage,
    errorMessage,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // 执行API请求
  const run = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction();
      setState({
        data: result,
        loading: false,
        error: null,
      });
      
      if (showSuccessMessage && successMessage) {
        message.success(successMessage);
      }
      
      return result;
    } catch (error) {
      const errorObj = error as Error;
      setState({
        data: null,
        loading: false,
        error: errorObj,
      });
      
      if (showErrorMessage) {
        const msg = errorMessage || errorObj.message || '请求失败';
        message.error(msg);
      }
      
      throw error;
    }
  }, [apiFunction, showSuccessMessage, showErrorMessage, successMessage, errorMessage]);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // 立即执行
  useEffect(() => {
    if (immediate) {
      run();
    }
  }, [immediate, run]);

  return {
    ...state,
    run,
    reset,
    refresh: run,
  };
}

interface UseApiMutationOptions {
  /** 成功时是否显示提示 */
  showSuccessMessage?: boolean;
  /** 错误时是否显示提示 */
  showErrorMessage?: boolean;
  /** 成功提示文本 */
  successMessage?: string;
  /** 错误提示文本 */
  errorMessage?: string;
  /** 成功回调 */
  onSuccess?: (data: any) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * API变更操作Hook
 * 用于处理创建、更新、删除等操作
 */
export function useApiMutation<T, P = any>(
  apiFunction: (params: P) => Promise<T>,
  options: UseApiMutationOptions = {}
) {
  const {
    showSuccessMessage = true,
    showErrorMessage = true,
    successMessage = '操作成功',
    errorMessage,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
  });

  const mutate = useCallback(async (params: P): Promise<T> => {
    setState({ loading: true, error: null });
    
    try {
      const result = await apiFunction(params);
      setState({ loading: false, error: null });
      
      if (showSuccessMessage) {
        message.success(successMessage);
      }
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error as Error;
      setState({ loading: false, error: errorObj });
      
      if (showErrorMessage) {
        const msg = errorMessage || errorObj.message || '操作失败';
        message.error(msg);
      }
      
      onError?.(errorObj);
      throw error;
    }
  }, [apiFunction, showSuccessMessage, showErrorMessage, successMessage, errorMessage, onSuccess, onError]);

  return {
    ...state,
    mutate,
  };
}

/**
 * 分页数据Hook
 * 专门处理分页列表数据
 */
export function usePaginatedData<T>(
  apiFunction: (params: {
    current: number;
    pageSize: number;
    [key: string]: any;
  }) => Promise<{
    data: T[];
    total: number;
    success: boolean;
  }>,
  options: UseApiDataOptions = {}
) {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  const fetchData = useCallback(async (params: any = {}) => {
    const requestParams = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...searchParams,
      ...params,
    };

    try {
      const result = await apiFunction(requestParams);
      
      if (result.success) {
        setPagination(prev => ({
          ...prev,
          total: result.total,
          current: requestParams.current,
          pageSize: requestParams.pageSize,
        }));
        
        return {
          data: result.data,
          success: true,
          total: result.total,
        };
      } else {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      if (options.showErrorMessage !== false) {
        message.error('获取数据失败');
      }
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  }, [apiFunction, pagination.current, pagination.pageSize, searchParams, options.showErrorMessage]);

  const search = useCallback((params: Record<string, any>) => {
    setSearchParams(params);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const changePage = useCallback((current: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  return {
    fetchData,
    search,
    changePage,
    pagination,
  };
} 