'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Table, Tag, Space, message } from 'antd';
import { 
  AuditOutlined, 
  FileTextOutlined, 
  CreditCardOutlined, 
  HistoryOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ContentReviewApi } from '@/api';
import type { AdminAssistanceApplicationResponse } from '@/api/types/content-review';

export default function ContentReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<AdminAssistanceApplicationResponse[]>([]);

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await ContentReviewApi.getContentReviewStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取最近的申请
  const fetchRecentApplications = async () => {
    try {
      const response = await ContentReviewApi.getAssistanceApplications({
        page: 1,
        size: 5,
        status: 'pending'
      });
      if (response.success) {
        setRecentApplications(response.data?.records || []);
      }
    } catch (error) {
      console.error('获取最近申请失败:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchRecentApplications();
  }, []);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'orange',
      under_review: 'blue',
      approved: 'green',
      rejected: 'red',
      completed: 'purple'
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: '待审核',
      under_review: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
      completed: '已完成'
    };
    return textMap[status] || status;
  };

  const columns = [
    {
      title: '申请标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '申请人',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '申请类型',
      dataIndex: 'applicationTypeText',
      key: 'applicationTypeText',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: AdminAssistanceApplicationResponse) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/dashboard/content-review/assistance/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <AuditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          内容审核概览
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          管理和审核平台上的各类申请和文档
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核总数"
              value={statistics?.totalPending || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已审核总数"
              value={statistics?.totalReviewed || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="帮扶申请待审"
              value={statistics?.assistanceApplications?.pending || 0}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="信用修复待审"
              value={statistics?.creditRepairApplications?.pending || 0}
              prefix={<CreditCardOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => router.push('/dashboard/content-review/assistance')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>帮扶申请审核</div>
              <div style={{ color: '#666', fontSize: 12 }}>审核用户提交的帮扶申请</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => router.push('/dashboard/content-review/credit-repair')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <CreditCardOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>信用修复审核</div>
              <div style={{ color: '#666', fontSize: 12 }}>审核信用修复申请</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            onClick={() => router.push('/dashboard/content-review/legal-documents')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ textAlign: 'center' }}>
              <HistoryOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>法律文书历史</div>
              <div style={{ color: '#666', fontSize: 12 }}>查看法律文书审核记录</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近待审核申请 */}
      <Card 
        title="最近待审核申请"
        extra={
          <Button 
            type="primary" 
            onClick={() => router.push('/dashboard/content-review/assistance')}
          >
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recentApplications}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: '暂无待审核申请' }}
        />
      </Card>
    </div>
  );
} 