'use client';

import React from 'react';
import { Layout, Menu, Card } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { 
  AuditOutlined, 
  FileTextOutlined, 
  CreditCardOutlined, 
  HistoryOutlined 
} from '@ant-design/icons';

const { Sider, Content } = Layout;

interface ContentReviewLayoutProps {
  children: React.ReactNode;
}

export default function ContentReviewLayout({ children }: ContentReviewLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      key: '/dashboard/content-review',
      icon: <AuditOutlined />,
      label: '审核概览',
    },
    {
      key: '/dashboard/content-review/assistance',
      icon: <FileTextOutlined />,
      label: '帮扶申请审核',
    },
    {
      key: '/dashboard/content-review/credit-repair',
      icon: <CreditCardOutlined />,
      label: '信用修复审核',
    },
    {
      key: '/dashboard/content-review/legal-documents',
      icon: <HistoryOutlined />,
      label: '法律文书历史',
    },
  ];

  // 确保只选中当前精确路径
  const getSelectedKeys = () => {
    // 如果是精确匹配的路径，返回该路径
    if (menuItems.some(item => item.key === pathname)) {
      return [pathname];
    }
    // 如果是子路径，找到最匹配的父路径
    const matchedItem = menuItems.find(item => 
      pathname.startsWith(item.key) && item.key !== '/dashboard/content-review'
    );
    return matchedItem ? [matchedItem.key] : [pathname];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Sider 
        width={240} 
        style={{ 
          background: '#fff',
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, color: '#1890ff' }}>
            <AuditOutlined style={{ marginRight: 8 }} />
            内容审核
          </h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Card 
            style={{ 
              minHeight: 'calc(100vh - 48px)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {children}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
} 