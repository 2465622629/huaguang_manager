'use client';

import React, { useRef, useState } from 'react';
import { Button, Tag, Modal, Form, Input, Select, message, Descriptions } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { ContentReviewApi } from '@/api';
import type { 
  AdminCreditRepairApplicationResponse, 
  BaseReviewQuery,
  ReviewRequest 
} from '@/api/types/content-review';

const { TextArea } = Input;

export default function CreditRepairApplicationsPage() {
  const actionRef = useRef<ActionType>();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AdminCreditRepairApplicationResponse | null>(null);
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

  const handleReview = (record: AdminCreditRepairApplicationResponse, status: 'approved' | 'rejected') => {
    setCurrentRecord(record);
    reviewForm.setFieldsValue({ status });
    setReviewModalVisible(true);
  };

  const handleViewDetail = (record: AdminCreditRepairApplicationResponse) => {
    setCurrentRecord(record);
    setDetailModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!currentRecord) return;

      await ContentReviewApi.reviewCreditRepairApplication(currentRecord.id, values);
      message.success('审核操作成功');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setCurrentRecord(null);
      actionRef.current?.reload();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const columns: ProColumns<AdminCreditRepairApplicationResponse>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
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
      title: '身份证号',
      dataIndex: 'idCard',
      width: 180,
      search: false,
      render: (idCard: string) => {
        if (!idCard) return '-';
        // 脱敏处理
        return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
      },
    },
    {
      title: '信用问题类型',
      dataIndex: 'creditIssueTypeText',
      width: 150,
      search: false,
    },
    {
      title: '修复金额',
      dataIndex: 'repairAmount',
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
          onClick={() => handleViewDetail(record)}
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
          <CreditCardOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          信用修复申请审核
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          审核和管理用户提交的信用修复申请
        </p>
      </div>

      <ProTable<AdminCreditRepairApplicationResponse>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          try {
            const response = await ContentReviewApi.getCreditRepairApplications({
              page: params.current || 1,
              size: params.pageSize || 20,
              status: params.status,
              keyword: params.userName,
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
        headerTitle="信用修复申请列表"
        toolBarRender={() => [
          <Button
            key="refresh"
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
      />

      {/* 详情模态框 */}
      <Modal
        title={`信用修复申请详情 - ID: ${currentRecord?.id}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCurrentRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          currentRecord?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleReview(currentRecord, 'approved');
              }}
            >
              通过
            </Button>
          ),
          currentRecord?.status === 'pending' && (
            <Button
              key="reject"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleReview(currentRecord, 'rejected');
              }}
            >
              拒绝
            </Button>
          ),
        ].filter(Boolean)}
        width={800}
      >
        {currentRecord && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="申请人">{currentRecord.userName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentRecord.userPhone}</Descriptions.Item>
              <Descriptions.Item label="身份证号">
                {currentRecord.idCard?.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')}
              </Descriptions.Item>
              <Descriptions.Item label="信用问题类型">
                {currentRecord.creditIssueTypeText}
              </Descriptions.Item>
              <Descriptions.Item label="修复金额" span={2}>
                {currentRecord.repairAmount ? `¥${currentRecord.repairAmount.toLocaleString()}` : '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="预期修复时间" span={2}>
                {currentRecord.expectedRepairDate || '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {currentRecord.description}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态" span={2}>
                <Tag color={getStatusColor(currentRecord.status)}>
                  {getStatusText(currentRecord.status)}
                </Tag>
              </Descriptions.Item>
              {currentRecord.reviewerName && (
                <Descriptions.Item label="审核人">{currentRecord.reviewerName}</Descriptions.Item>
              )}
              {currentRecord.reviewTime && (
                <Descriptions.Item label="审核时间">
                  {new Date(currentRecord.reviewTime).toLocaleString()}
                </Descriptions.Item>
              )}
              {currentRecord.reviewComment && (
                <Descriptions.Item label="审核意见" span={2}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {currentRecord.reviewComment}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 证据文件 */}
            {currentRecord.evidenceFiles && currentRecord.evidenceFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>证据文件</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentRecord.evidenceFiles.map((file, index) => (
                    <Button
                      key={index}
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(file)}
                    >
                      证据文件 {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 审核模态框 */}
      <Modal
        title={`审核信用修复申请 - ${currentRecord?.userName}`}
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
              <Descriptions.Item label="信用问题类型">{currentRecord.creditIssueTypeText}</Descriptions.Item>
              <Descriptions.Item label="修复金额">
                {currentRecord.repairAmount ? `¥${currentRecord.repairAmount.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>
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