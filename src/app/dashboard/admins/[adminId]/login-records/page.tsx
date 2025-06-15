'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, message, Space, Descriptions } from 'antd';
import { 
  ArrowLeftOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { AdministratorsApi } from '@/api';

interface LoginRecord {
  id: number;
  loginTime: string;
  ip: string;
  location: string;
  userAgent: string;
  success: boolean;
}

export default function AdminLoginRecordsPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = Number(params.adminId);
  
  const [loading, setLoading] = useState(false);
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 获取登录记录
  const fetchLoginRecords = async (page = 1, size = 20) => {
    try {
      setLoading(true);
      const response = await AdministratorsApi.getLoginRecords(adminId, { page, size });
      if (response.success) {
        setLoginRecords(response.data?.records || []);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data?.total || 0,
        });
      } else {
        message.error('获取登录记录失败');
      }
    } catch (error) {
      message.error('获取登录记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchLoginRecords();
    }
  }, [adminId]);

  // 解析User-Agent
  const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return { browser: '未知', os: '未知' };
    
    // 简单的User-Agent解析
    let browser = '未知';
    let os = '未知';
    
    // 浏览器检测
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // 操作系统检测
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return { browser, os };
  };

  const columns = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
      sorter: (a: LoginRecord, b: LoginRecord) => 
        new Date(a.loginTime).getTime() - new Date(b.loginTime).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '登录状态',
      dataIndex: 'success',
      key: 'success',
      width: 100,
      render: (success: boolean) => (
        <Tag 
          color={success ? 'success' : 'error'}
          icon={success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {success ? '成功' : '失败'}
        </Tag>
      ),
      filters: [
        { text: '登录成功', value: true },
        { text: '登录失败', value: false },
      ],
      onFilter: (value: any, record: LoginRecord) => record.success === value,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip: string) => (
        <code style={{ fontSize: 12 }}>{ip}</code>
      ),
    },
    {
      title: '地理位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location: string) => (
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <span>{location || '未知'}</span>
        </Space>
      ),
    },
    {
      title: '设备信息',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (userAgent: string) => {
        const { browser, os } = parseUserAgent(userAgent);
        return (
          <div>
            <div style={{ fontSize: 12 }}>
              <DesktopOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              {browser} / {os}
            </div>
            <div 
              style={{ 
                fontSize: 11, 
                color: '#666', 
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={userAgent}
            >
              {userAgent}
            </div>
          </div>
        );
      },
    },
  ];

  // 统计数据
  const totalRecords = loginRecords.length;
  const successCount = loginRecords.filter(record => record.success).length;
  const failureCount = totalRecords - successCount;
  const successRate = totalRecords > 0 ? ((successCount / totalRecords) * 100).toFixed(1) : '0';

  // 最近登录信息
  const recentLogin = loginRecords.find(record => record.success);
  const lastFailedLogin = loginRecords.find(record => !record.success);

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <HistoryOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            管理员登录记录
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            管理员ID: {adminId}
          </p>
        </div>
      </div>

      {/* 统计信息 */}
      <Card title="登录统计" style={{ marginBottom: 24 }}>
        <Descriptions column={4}>
          <Descriptions.Item label="总登录次数">
            <span style={{ fontSize: 16, fontWeight: 500 }}>{pagination.total}</span>
          </Descriptions.Item>
          <Descriptions.Item label="成功次数">
            <span style={{ fontSize: 16, fontWeight: 500, color: '#52c41a' }}>{successCount}</span>
          </Descriptions.Item>
          <Descriptions.Item label="失败次数">
            <span style={{ fontSize: 16, fontWeight: 500, color: '#ff4d4f' }}>{failureCount}</span>
          </Descriptions.Item>
          <Descriptions.Item label="成功率">
            <span style={{ fontSize: 16, fontWeight: 500, color: '#1890ff' }}>{successRate}%</span>
          </Descriptions.Item>
        </Descriptions>
        
        {recentLogin && (
          <div style={{ marginTop: 16, padding: 16, background: '#f6ffed', borderRadius: 6 }}>
            <h4 style={{ margin: 0, color: '#52c41a' }}>最近成功登录</h4>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              时间: {new Date(recentLogin.loginTime).toLocaleString()} | 
              IP: {recentLogin.ip} | 
              位置: {recentLogin.location || '未知'}
            </p>
          </div>
        )}
        
        {lastFailedLogin && (
          <div style={{ marginTop: 16, padding: 16, background: '#fff2f0', borderRadius: 6 }}>
            <h4 style={{ margin: 0, color: '#ff4d4f' }}>最近失败登录</h4>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              时间: {new Date(lastFailedLogin.loginTime).toLocaleString()} | 
              IP: {lastFailedLogin.ip} | 
              位置: {lastFailedLogin.location || '未知'}
            </p>
          </div>
        )}
      </Card>

      {/* 登录记录表格 */}
      <Card 
        title="登录记录详情"
        extra={
          <Button 
            onClick={() => fetchLoginRecords(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={loginRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              fetchLoginRecords(page, pageSize);
            },
          }}
          rowClassName={(record) => record.success ? '' : 'failed-login-row'}
          locale={{ emptyText: '暂无登录记录' }}
        />
      </Card>

      <style jsx>{`
        :global(.failed-login-row) {
          background-color: #fff2f0 !important;
        }
        :global(.failed-login-row:hover) {
          background-color: #ffebe6 !important;
        }
      `}</style>
    </div>
  );
} 