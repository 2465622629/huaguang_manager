'use client';

import React, { useRef, useState } from 'react';
import { Button, Tag, Space, Modal, Form, Input, Select, message, Descriptions, Image } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ContentReviewApi } from '@/api';
import type { 
  AdminAssistanceApplicationResponse, 
  BaseReviewQuery,
  ReviewRequest 
} from '@/api/types/content-review';

const { TextArea } = Input;
const { confirm } = Modal;

export default function AssistanceApplicationsPage() {
  const router = useRouter();
  const actionRef = useRef<ActionType>();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AdminAssistanceApplicationResponse | null>(null);
  const [reviewForm] = Form.useForm();

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'orange',
      pending_review: 'blue',
      under_review: 'cyan',
      approved: 'green',
      rejected: 'red',
      completed: 'purple'
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: '待审核',
      pending_review: '待复审',
      under_review: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
      completed: '已完成'
    };
    return textMap[status] || status;
  };

  const getUrgencyColor = (level: string) => {
    const colorMap: Record<string, string> = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      urgent: 'magenta'
    };
    return colorMap[level] || 'default';
  };

  const handleReview = (record: AdminAssistanceApplicationResponse, status: 'approved' | 'rejected') => {
    setCurrentRecord(record);
    reviewForm.setFieldsValue({ status });
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!currentRecord) return;

      await ContentReviewApi.reviewAssistanceApplication(currentRecord.id, values);
      message.success('审核操作成功');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setCurrentRecord(null);
      actionRef.current?.reload();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const columns: ProColumns<AdminAssistanceApplicationResponse>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '申请标题',
      dataIndex: 'title',
      ellipsis: true,
      copyable: true,
    },
    {
      title: '申请人',
      dataIndex: 'userName',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'userPhone',
      width: 130,
      search: false,
    },
    {
      title: '申请类型',
      dataIndex: 'applicationTypeText',
      width: 120,
      search: false,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgencyLevel',
      width: 100,
      search: false,
      render: (_, record) => (
        <Tag color={getUrgencyColor(record.urgencyLevel)}>
          {record.urgencyLevelText}
        </Tag>
      ),
    },
    {
      title: '申请金额',
      dataIndex: 'amount',
      width: 120,
      search: false,
      render: (amount) => amount ? `¥${amount.toLocaleString()}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待审核', status: 'Warning' },
        pending_review: { text: '待复审', status: 'Processing' },
        under_review: { text: '审核中', status: 'Processing' },
        approved: { text: '已通过', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Error' },
        completed: { text: '已完成', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: '审核人',
      dataIndex: 'reviewerName',
      width: 100,
      search: false,
      render: (name) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/dashboard/content-review/assistance/${record.id}`)}
        >
          查看详情
        </Button>,
        record.status === 'pending' && (
          <Button
            key="approve"
            type="link"
            icon={<CheckCircleOutlined />}
            style={{ color: '#52c41a' }}
            onClick={() => handleReview(record, 'approved')}
          >
            通过
          </Button>
        ),
        record.status === 'pending' && (
          <Button
            key="reject"
            type="link"
            icon={<CloseCircleOutlined />}
            danger
            onClick={() => handleReview(record, 'rejected')}
          >
            拒绝
          </Button>
        ),
      ].filter(Boolean),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          帮扶申请审核
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          审核和管理用户提交的帮扶申请
        </p>
      </div>

      <ProTable<AdminAssistanceApplicationResponse>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          try {
            const response = await ContentReviewApi.getAssistanceApplications({
              page: params.current || 1,
              size: params.pageSize || 20,
              status: params.status,
              keyword: params.title || params.userName,
              startDate: params.createdTime?.[0],
              endDate: params.createdTime?.[1],
            });
            
            if (response.success) {
              return {
                data: response.data?.records || [],
                success: true,
                total: response.data?.total || 0,
              };
            }
            return { data: [], success: false, total: 0 };
          } catch (error) {
            return { data: [], success: false, total: 0 };
          }
        }}
        rowKey="id"
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        dateFormatter="string"
        headerTitle="帮扶申请列表"
        toolBarRender={() => [
          <Button
            key="refresh"
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
      />

      {/* 审核模态框 */}
      <Modal
        title={`审核申请 - ${currentRecord?.title}`}
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
          setCurrentRecord(null);
        }}
        width={600}
      >
        {currentRecord && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="申请人">{currentRecord.userName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentRecord.userPhone}</Descriptions.Item>
              <Descriptions.Item label="申请类型">{currentRecord.applicationTypeText}</Descriptions.Item>
              <Descriptions.Item label="紧急程度">
                <Tag color={getUrgencyColor(currentRecord.urgencyLevel)}>
                  {currentRecord.urgencyLevelText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请金额" span={2}>
                {currentRecord.amount ? `¥${currentRecord.amount.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请描述" span={2}>
                {currentRecord.description}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="status"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select>
              <Select.Option value="approved">通过</Select.Option>
              <Select.Option value="rejected">拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="comment"
            label="审核意见"
            rules={[{ required: true, message: '请填写审核意见' }]}
          >
            <TextArea rows={4} placeholder="请填写审核意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 