'use client';

import React, { useRef, useState } from 'react';
import { MoneyCollectOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Space, Tag, Modal, Typography, Descriptions } from 'antd';
import { OrdersApi } from '@/api/admin/orders';
import type { CommissionRecordResponse } from '@/api/types/orders';

const { Paragraph } = Typography;

// 佣金记录数据类型 (映射API数据)
interface CommissionItem {
  id: string;
  userId: number;
  username: string;
  realName: string;
  orderId?: number;
  type: string;
  typeDescription: string;
  amount: number;
  description: string;
  status: string;
  statusDescription: string;
  createTime: string;
}

// API数据映射函数
const mapCommissionResponseToItem = (commission: CommissionRecordResponse): CommissionItem => {
  const typeMap: Record<string, string> = {
    referral: '推荐佣金',
    consultation: '咨询佣金',
    adjustment: '手动调整',
  };

  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    withdrawn: '已提现',
  };

  return {
    id: commission.id.toString(),
    userId: commission.userId,
    username: commission.userInfo?.username || '未知用户',
    realName: commission.userInfo?.realName || '未知姓名',
    orderId: commission.orderId,
    type: commission.type,
    typeDescription: typeMap[commission.type] || commission.type,
    amount: commission.amount,
    description: commission.description,
    status: commission.status,
    statusDescription: statusMap[commission.status] || commission.status,
    createTime: commission.createdAt,
  };
};

// 佣金类型选项
const typeOptions = [
  { label: '推荐佣金', value: 'referral' },
  { label: '咨询佣金', value: 'consultation' },
  { label: '手动调整', value: 'adjustment' },
];

// 状态选项
const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已提现', value: 'withdrawn' },
];

export default function CommissionRecordsPage() {
  const actionRef = useRef<ActionType>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<CommissionItem>();

  // 表格列定义
  const columns: ProColumns<CommissionItem>[] = [
    {
      title: '记录ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <MoneyCollectOutlined style={{ color: '#1890ff' }} />
          <span>{record.id}</span>
        </Space>
      ),
    },
    {
      title: '用户信息',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.realName}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>@{record.username}</span>
        </Space>
      ),
    },
    {
      title: '佣金类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      valueEnum: {
        referral: { text: '推荐佣金' },
        consultation: { text: '咨询佣金' },
        adjustment: { text: '手动调整' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          referral: 'blue',
          consultation: 'green',
          adjustment: 'orange',
        };
        return <Tag color={colorMap[record.type]}>{record.typeDescription}</Tag>;
      },
    },
    {
      title: '佣金金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      search: false,
      render: (text, record) => {
        const amount = Number(text) || 0;
        return (
          <span style={{ color: amount >= 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
            {amount >= 0 ? '+' : ''}¥{amount}
          </span>
        );
      },
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待确认' },
          confirmed: { color: 'success', text: '已确认' },
          withdrawn: { color: 'processing', text: '已提现' },
        };
        const status = statusMap[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      valueEnum: {
        pending: { text: '待确认', status: 'Default' },
        confirmed: { text: '已确认', status: 'Success' },
        withdrawn: { text: '已提现', status: 'Processing' },
      },
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      search: false,
      render: (text) => text ? `#${text}` : '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRow(record);
              setPreviewModalOpen(true);
            }}
          >
            <EyeOutlined /> 详情
          </a>
        </Space>
      ),
    },
  ];

  // 获取佣金记录数据
  const fetchCommissionRecords = async (params: any) => {
    try {
      const queryParams = {
        page: params.current,
        size: params.pageSize,
        keyword: params.username,
        type: params.type,
        status: params.status,
        userId: params.userId,
        startDate: params.startDate,
        endDate: params.endDate,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
      };

      const response = await OrdersApi.getCommissionRecords(queryParams);
      if (response.code === 200) {
        const mappedData = response.data.records.map(mapCommissionResponseToItem);
        return {
          data: mappedData,
          success: true,
          total: response.data.total,
        };
      } else {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error('获取佣金记录失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <div>
      <ProTable<CommissionItem>
        headerTitle="佣金记录管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          collapsed: false,
          collapseRender: (collapsed) => (collapsed ? '展开' : '收起'),
        }}
        toolBarRender={() => []}
        request={fetchCommissionRecords}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        }}
      />

      {/* 详情预览弹窗 */}
      <Modal
        title="佣金记录详情"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={600}
      >
        {currentRow && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="记录ID" span={1}>
              {currentRow.id}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID" span={1}>
              {currentRow.userId}
            </Descriptions.Item>
            <Descriptions.Item label="用户名" span={1}>
              {currentRow.username}
            </Descriptions.Item>
            <Descriptions.Item label="真实姓名" span={1}>
              {currentRow.realName}
            </Descriptions.Item>
            <Descriptions.Item label="佣金类型" span={1}>
              <Tag color={
                currentRow.type === 'referral' ? 'blue' :
                currentRow.type === 'consultation' ? 'green' : 'orange'
              }>
                {currentRow.typeDescription}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="佣金金额" span={1}>
              <span style={{ 
                color: currentRow.amount >= 0 ? '#52c41a' : '#f5222d', 
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {currentRow.amount >= 0 ? '+' : ''}¥{currentRow.amount}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={1}>
              <Tag color={
                currentRow.status === 'pending' ? 'default' :
                currentRow.status === 'confirmed' ? 'success' : 'processing'
              }>
                {currentRow.statusDescription}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联订单" span={1}>
              {currentRow.orderId ? `#${currentRow.orderId}` : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {currentRow.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                {currentRow.description}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 