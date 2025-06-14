"use client"

import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { Button, Dropdown, message, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import defaultProps from './_defaultProps';
import { useRouter, usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { AuthUtils } from '@/api/admin/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // 在客户端获取用户信息
  useEffect(() => {
    const info = AuthUtils.getAdminInfo();
    setAdminInfo(info);
  }, []);

  // 处理登出
  const handleLogout = () => {
    AuthUtils.clearLoginInfo();
    message.success('已退出登录');
    router.replace('/');
  };

  return (
    <AuthGuard>
      <div
        id="test-pro-layout"
        style={{
          height: '100vh',
        }}
      >
        <ProLayout
          siderWidth={216}
          title="华光管理系统"
          bgLayoutImgList={[]}
          {...defaultProps}
          location={{
            pathname,
          }}
          breadcrumbRender={false}
          menuItemRender={(item, dom) => (
            <div
              onClick={() => {
                router.push(item.path || '/dashboard/users/list');
              }}
            >
              {dom}
            </div>
          )}
          avatarProps={{
            src: adminInfo?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            title: adminInfo?.realName || adminInfo?.username || '管理员',
            size: 'small',
            render: (props, dom) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: '个人信息',
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: handleLogout,
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            ),
          }}
          actionsRender={() => []}
        >
          <PageContainer>
            {children}
          </PageContainer>
        </ProLayout>
      </div>
    </AuthGuard>
  );
}