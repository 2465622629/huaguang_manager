'use client';

import React, { useRef, useState } from 'react';
import { Button, Tag, Modal, Descriptions } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { 
  EyeOutlined, 
  HistoryOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { ContentReviewApi } from '@/api';
import type { 
  AdminLegalDocumentResponse, 
  BaseReviewQuery
} from '@/api/types/content-review';

export default function LegalDocumentHistoryPage() {
  const actionRef = useRef<ActionType>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AdminLegalDocumentResponse | null>(null);

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

  const handleViewDetail = (record: AdminLegalDocumentResponse) => {
    setCurrentRecord(record);
    setDetailModalVisible(true);
  };

  // 安全的日期格式化函数
  const formatDate = (dateString: string | undefined | null | any): string => {
    if (!dateString) return '-';
    
    try {
      // 添加详细的调试信息
      console.log('formatDate input:', typeof dateString, dateString);
      
      let date: Date;
      
      // 处理不同类型的输入
      if (typeof dateString === 'string') {
        // 处理时间戳（数字字符串）
        if (/^\d+$/.test(dateString)) {
          date = new Date(parseInt(dateString));
        }
        // 处理 "YYYY-MM-DD HH:mm:ss" 格式
        else if (dateString.includes(' ') && dateString.includes(':')) {
          const normalizedDate = dateString.replace(' ', 'T');
          date = new Date(normalizedDate);
        }
        // 处理 ISO 格式或其他标准格式
        else {
          date = new Date(dateString);
        }
      } else if (typeof dateString === 'number') {
        // 处理时间戳数字
        date = new Date(dateString);
      } else {
        // 尝试直接转换
        date = new Date(dateString);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString, typeof dateString);
        return '-';
      }
      
      const result = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      console.log('formatDate result:', result);
      return result;
    } catch (error) {
      console.error('Date formatting error:', error, dateString, typeof dateString);
      return '-';
    }
  };

  const columns: ProColumns<AdminLegalDocumentResponse>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 80,
      search: false,
    },
    {
      title: '文书标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
      ellipsis: true,
    },
    {
      title: '申请人',
      dataIndex: 'realName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '文书类型',
      dataIndex: 'documentType',
      width: 140,
      search: false,
      ellipsis: true,
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
          {record.statusDescription || getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: '审核人ID',
      dataIndex: 'reviewerId',
      width: 100,
      search: false,
      render: (id) => id || '-',
    },
    {
      title: '审核人',
      dataIndex: 'reviewerName',
      width: 120,
      search: false,
      ellipsis: true,
      render: (name) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.createdAt),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 160,
      search: false,
      render: (_, record) => formatDate(record.updatedAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>,
      ],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <HistoryOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          法律文书审核历史
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          查看已审核的法律文书记录和处理历史
        </p>
      </div>

      <ProTable<AdminLegalDocumentResponse>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          try {
            const response = await ContentReviewApi.getLegalDocumentHistory({
              page: params.current || 1,
              size: params.pageSize || 20,
              status: params.status,
              keyword: params.title || params.username || params.realName,
              startDate: params.createdAt?.[0],
              endDate: params.createdAt?.[1],
            });
            
            if (response.code === 200) {
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
        scroll={{ x: 1300 }}
        dateFormatter="string"
        headerTitle="法律文书审核历史"
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
        title={`法律文书详情 - ${currentRecord?.title}`}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setCurrentRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {currentRecord && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="文书标题" span={2}>
                {currentRecord.title}
              </Descriptions.Item>
              <Descriptions.Item label="用户ID">
                {currentRecord.userId}
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                {currentRecord.username}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {currentRecord.realName}
              </Descriptions.Item>
              <Descriptions.Item label="文书类型">
                {currentRecord.documentType}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentRecord.userPhone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态" span={2}>
                <Tag color={getStatusColor(currentRecord.status)}>
                  {currentRecord.statusDescription || getStatusText(currentRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核人ID">
                {currentRecord.reviewerId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核人" span={2}>
                {currentRecord.reviewerName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="文书内容" span={2}>
                <div 
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    maxHeight: '200px', 
                    overflow: 'auto',
                    border: '1px solid #d9d9d9',
                    padding: '8px',
                    borderRadius: '4px',
                    background: '#fafafa'
                  }}
                >
                  {currentRecord.content}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDate(currentRecord.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {formatDate(currentRecord.updatedAt)}
              </Descriptions.Item>
              {currentRecord.reviewComment && (
                <Descriptions.Item label="审核意见" span={2}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {currentRecord.reviewComment}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 相关附件 */}
            {currentRecord.attachments && currentRecord.attachments.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>相关附件</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentRecord.attachments.map((attachment, index) => (
                    <Button
                      key={index}
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(attachment)}
                    >
                      附件 {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 审核历史时间线 */}
            <div style={{ marginTop: 16 }}>
              <h4>处理历史</h4>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>创建时间：</strong>
                  {formatDate(currentRecord.createdAt)}
                </div>
                <div>
                  <strong>最后更新：</strong>
                  {formatDate(currentRecord.updatedAt)}
                </div>
                {currentRecord.reviewerName && (
                  <div style={{ marginTop: 8 }}>
                    <strong>审核信息：</strong>
                    <span style={{ marginLeft: 8, color: '#666' }}>
                      审核人: {currentRecord.reviewerName}
                      {currentRecord.reviewerId && ` (ID: ${currentRecord.reviewerId})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 