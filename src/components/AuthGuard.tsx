'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUtils } from '@/api/admin/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 * 检查用户登录状态，未登录则重定向到登录页面
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // 检查是否已登录
      if (!AuthUtils.isLoggedIn()) {
        // 未登录，重定向到登录页面
        router.replace('/');
        return;
      }

      // 检查token是否有效（这里可以添加更复杂的验证逻辑）
      const adminInfo = AuthUtils.getAdminInfo();
      if (!adminInfo) {
        // token无效，清除本地存储并重定向
        AuthUtils.clearLoginInfo();
        router.replace('/');
        return;
      }
    };

    checkAuth();
  }, [router]);

  // 如果未登录，不渲染子组件
  if (!AuthUtils.isLoggedIn()) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard; 