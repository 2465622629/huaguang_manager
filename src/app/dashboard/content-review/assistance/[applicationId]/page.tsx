'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Image,
  Timeline,
  Divider,
  Row,
  Col,
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { ContentReviewApi } from '@/api';
import type { 
  AdminAssistanceApplicationResponse,
  ReviewRequest,
  ApproveAssistanceRequest 
} from '@/api/types/content-review';

const { TextArea } = Input;

export default function AssistanceApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = Number(params.applicationId);
  
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<AdminAssistanceApplicationResponse | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();
  const [approveForm] = Form.useForm();

  // 获取申请详情
  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await ContentReviewApi.getAssistanceApplicationDetail(applicationId);
      if (response.success) {
        setApplication(response.data);
      } else {
        message.error('获取申请详情失败');
      }
    } catch (error) {
      message.error('获取申请详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

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

  // 处理审核
  const handleReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      await ContentReviewApi.reviewAssistanceApplication(applicationId, values);
      message.success('审核操作成功');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      fetchApplicationDetail();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  // 处理批准
  const handleApprove = async () => {
    try {
      const values = await approveForm.validateFields();
      await ContentReviewApi.approveAssistanceApplication(applicationId, values);
      message.success('批准操作成功');
      setApproveModalVisible(false);
      approveForm.resetFields();
      fetchApplicationDetail();
    } catch (error) {
      message.error('批准操作失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>申请不存在或已被删除</p>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            style={{ marginRight: 16 }}
          >
            返回
          </Button>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              帮扶申请详情
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              申请ID: {application.id}
            </p>
          </div>
        </div>
        
        <Space>
          {application.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setApproveModalVisible(true)}
              >
                批准申请
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  reviewForm.setFieldsValue({ status: 'rejected' });
                  setReviewModalVisible(true);
                }}
              >
                拒绝申请
              </Button>
            </>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* 基本信息 */}
        <Col xs={24} lg={16}>
          <Card title="申请信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="申请标题" span={2}>
                {application.title}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {application.userName}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {application.userPhone}
              </Descriptions.Item>
              <Descriptions.Item label="申请类型">
                {application.applicationTypeText}
              </Descriptions.Item>
              <Descriptions.Item label="紧急程度">
                <Tag color={getUrgencyColor(application.urgencyLevel)}>
                  {application.urgencyLevelText}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请金额" span={2}>
                {application.amount ? `¥${application.amount.toLocaleString()}` : '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="期望完成时间" span={2}>
                {application.expectedCompletionDate || '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="申请描述" span={2}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {application.description}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 附件信息 */}
          {application.attachments && application.attachments.length > 0 && (
            <Card title="相关附件" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                {application.attachments.map((attachment, index) => (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <Card
                      size="small"
                      hoverable
                      cover={
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                          <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                        </div>
                      }
                      actions={[
                        <EyeOutlined key="view" onClick={() => window.open(attachment)} />,
                        <DownloadOutlined key="download" onClick={() => window.open(attachment)} />
                      ]}
                    >
                      <Card.Meta
                        title={`附件 ${index + 1}`}
                        description="点击查看或下载"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </Col>

        {/* 状态和审核信息 */}
        <Col xs={24} lg={8}>
          <Card title="状态信息" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="当前状态">
                <Tag color={getStatusColor(application.status)}>
                  {getStatusText(application.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(application.createdTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(application.updatedTime).toLocaleString()}
              </Descriptions.Item>
              {application.reviewerId && (
                <Descriptions.Item label="审核人">
                  {application.reviewerName}
                </Descriptions.Item>
              )}
              {application.reviewTime && (
                <Descriptions.Item label="审核时间">
                  {new Date(application.reviewTime).toLocaleString()}
                </Descriptions.Item>
              )}
              {application.reviewComment && (
                <Descriptions.Item label="审核意见">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {application.reviewComment}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* 处理时间线 */}
          <Card title="处理进度">
            <Timeline
              items={[
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div>申请提交</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {new Date(application.createdTime).toLocaleString()}
                      </div>
                    </div>
                  ),
                },
                application.reviewTime && {
                  color: application.status === 'approved' ? 'green' : application.status === 'rejected' ? 'red' : 'blue',
                  children: (
                    <div>
                      <div>审核{application.status === 'approved' ? '通过' : application.status === 'rejected' ? '拒绝' : '中'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {new Date(application.reviewTime).toLocaleString()}
                      </div>
                      {application.reviewerName && (
                        <div style={{ fontSize: 12, color: '#666' }}>
                          审核人: {application.reviewerName}
                        </div>
                      )}
                    </div>
                  ),
                },
                application.status === 'completed' && {
                  color: 'green',
                  children: (
                    <div>
                      <div>申请完成</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {new Date(application.updatedTime).toLocaleString()}
                      </div>
                    </div>
                  ),
                },
              ].filter(Boolean)}
            />
          </Card>
        </Col>
      </Row>

      {/* 审核模态框 */}
      <Modal
        title="审核申请"
        open={reviewModalVisible}
        onOk={handleReview}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        width={600}
      >
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

      {/* 批准模态框 */}
      <Modal
        title="批准申请"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          approveForm.resetFields();
        }}
        width={600}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="approvedAmount"
            label="批准金额"
            rules={[{ required: true, message: '请填写批准金额' }]}
          >
            <Input
              type="number"
              placeholder="请输入批准金额"
              addonBefore="¥"
            />
          </Form.Item>
          <Form.Item
            name="expectedCompletionDate"
            label="预期完成时间"
          >
            <Input
              type="date"
              placeholder="请选择预期完成时间"
            />
          </Form.Item>
          <Form.Item
            name="comment"
            label="批准说明"
            rules={[{ required: true, message: '请填写批准说明' }]}
          >
            <TextArea rows={4} placeholder="请填写批准说明..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 