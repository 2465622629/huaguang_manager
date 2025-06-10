'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDatePicker, ProFormDigit } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Modal, Typography, Descriptions } from 'antd';
import { OrdersApi } from '@/api/admin/orders';
import type { ConsultationOrderResponse, OrderListQuery, UpdateOrderStatusRequest, ProcessRefundRequest } from '@/api/types/orders';

const { Paragraph } = Typography;

// 订单数据类型 (映射API数据)
interface OrderItem {
  id: string;
  orderNumber: string;
  clientName: string;
  serviceName: string;
  providerName: string;
  providerType: '律师' | '心理师';
  orderType: '即时咨询' | '预约咨询';
  amount: number;
  status: '待确认' | '进行中' | '已完成' | '已取消' | '已退款';
  createTime: string;
  updateTime: string;
  payTime?: string;
  completeTime?: string;
}

// API数据映射函数
const mapOrderResponseToItem = (order: ConsultationOrderResponse): OrderItem => ({
  id: order.id.toString(),
  orderNumber: order.orderNumber,
  clientName: order.clientName,
  serviceName: order.serviceName,
  providerName: order.providerName,
  providerType: order.providerType === 'lawyer' ? '律师' : '心理师',
  orderType: order.orderType === 'instant' ? '即时咨询' : '预约咨询',
  amount: order.amount,
  status: order.status,
  createTime: order.createdAt,
  updateTime: order.updatedAt,
  payTime: order.payTime,
  completeTime: order.completeTime,
});

// 订单状态选项
const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
];

// 服务类型选项
const serviceTypeOptions = [
  { label: '律师咨询', value: 'lawyer' },
  { label: '心理咨询', value: 'psychologist' },
];

// 订单类型选项
const orderTypeOptions = [
  { label: '即时咨询', value: 'instant' },
  { label: '预约咨询', value: 'appointment' },
];

export default function ConsultationOrdersPage() {
  const actionRef = useRef<ActionType>();
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<OrderItem>();

  // 表格列定义
  const columns: ProColumns<OrderItem>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 160,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>{record.orderNumber}</span>
        </Space>
      ),
    },
    {
      title: '客户姓名',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 120,
    },
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '服务提供者',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 120,
    },
    {
      title: '服务类型',
      dataIndex: 'providerType',
      key: 'providerType',
      width: 100,
      valueEnum: {
        lawyer: { text: '律师咨询' },
        psychologist: { text: '心理咨询' },
      },
      render: (text) => <Tag color={text === '律师' ? 'blue' : 'green'}>{text}</Tag>,
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      valueEnum: {
        instant: { text: '即时咨询' },
        appointment: { text: '预约咨询' },
      },
      render: (text) => <Tag color={text === '即时咨询' ? 'orange' : 'purple'}>{text}</Tag>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      search: false,
      render: (text) => <span style={{ color: '#f50' }}>¥{text}</span>,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusMap = {
          '待确认': { color: 'default', text: '待确认' },
          '进行中': { color: 'processing', text: '进行中' },
          '已完成': { color: 'success', text: '已完成' },
          '已取消': { color: 'warning', text: '已取消' },
          '已退款': { color: 'error', text: '已退款' },
        };
        const status = statusMap[record.status];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      valueEnum: {
        pending: { text: '待确认', status: 'Default' },
        in_progress: { text: '进行中', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Warning' },
        refunded: { text: '已退款', status: 'Error' },
      },
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setPreviewModalOpen(true);
            }}
          >
            详情
          </Button>
          {(record.status === '待确认' || record.status === '进行中') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentRow(record);
                setUpdateStatusModalOpen(true);
              }}
            >
              状态
            </Button>
          )}
          {(record.status === '已完成' || record.status === '进行中') && (
            <Button
              type="link"
              danger
              onClick={() => {
                setCurrentRow(record);
                setRefundModalOpen(true);
              }}
            >
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // API调用
  const fetchOrders = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      const query: OrderListQuery = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status,
        serviceType: params.serviceType,
        orderType: params.orderType,
        startDate: params.startDate,
        endDate: params.endDate,
      };
      
      const response = await OrdersApi.getConsultationOrders(query);
      const data = response.data.content.map(mapOrderResponseToItem);
      
      return {
        data,
        success: true,
        total: response.data.totalElements,
      };
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 更新订单状态
  const handleUpdateStatus = async (values: any) => {
    try {
      console.log('更新订单状态:', values);
      
      if (!currentRow) {
        message.error('缺少订单信息');
        return false;
      }
      
      const updateData: UpdateOrderStatusRequest = {
        orderId: parseInt(currentRow.id),
        status: values.status,
        reason: values.reason,
      };
      
      await OrdersApi.updateOrderStatus(updateData);
      message.success('状态更新成功');
      setUpdateStatusModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
      return false;
    }
  };

  // 处理退款
  const handleRefund = async (values: any) => {
    try {
      console.log('处理退款:', values);
      
      if (!currentRow) {
        message.error('缺少订单信息');
        return false;
      }
      
      const refundData: ProcessRefundRequest = {
        orderId: parseInt(currentRow.id),
        refundAmount: values.refundAmount,
        reason: values.reason,
      };
      
      await OrdersApi.processRefund(refundData);
      message.success('退款处理成功');
      setRefundModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('处理退款失败:', error);
      message.error('处理退款失败');
      return false;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<OrderItem>
        headerTitle="咨询订单管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        request={fetchOrders}
        columns={columns}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 更新状态模态框 */}
      <ModalForm
        title="更新订单状态"
        open={updateStatusModalOpen}
        onOpenChange={setUpdateStatusModalOpen}
        onFinish={handleUpdateStatus}
        modalProps={{
          destroyOnClose: true,
          width: 500,
        }}
      >
        <ProFormSelect
          name="status"
          label="新状态"
          placeholder="请选择新状态"
          options={statusOptions}
          rules={[{ required: true, message: '请选择新状态' }]}
        />
        <ProFormTextArea
          name="reason"
          label="变更原因"
          placeholder="请输入状态变更原因"
          rules={[{ required: true, message: '请输入变更原因' }]}
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 退款处理模态框 */}
      <ModalForm
        title="处理退款"
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        onFinish={handleRefund}
        modalProps={{
          destroyOnClose: true,
          width: 500,
        }}
      >
        <ProFormDigit
          name="refundAmount"
          label="退款金额"
          placeholder="请输入退款金额"
          rules={[{ required: true, message: '请输入退款金额' }]}
          fieldProps={{
            precision: 2,
            min: 0,
            max: currentRow?.amount,
            formatter: (value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value!.replace(/¥\s?|(,*)/g, ''),
          }}
        />
        <ProFormTextArea
          name="reason"
          label="退款原因"
          placeholder="请输入退款原因"
          rules={[{ required: true, message: '请输入退款原因' }]}
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentRow && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单号" span={2}>
              {currentRow.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="客户姓名">
              {currentRow.clientName}
            </Descriptions.Item>
            <Descriptions.Item label="服务提供者">
              {currentRow.providerName}
            </Descriptions.Item>
            <Descriptions.Item label="服务名称" span={2}>
              {currentRow.serviceName}
            </Descriptions.Item>
            <Descriptions.Item label="服务类型">
              {currentRow.providerType}
            </Descriptions.Item>
            <Descriptions.Item label="订单类型">
              {currentRow.orderType}
            </Descriptions.Item>
            <Descriptions.Item label="订单金额">
              <span style={{ color: '#f50' }}>¥{currentRow.amount}</span>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={
                currentRow.status === '已完成' ? 'success' :
                currentRow.status === '进行中' ? 'processing' :
                currentRow.status === '已退款' ? 'error' :
                currentRow.status === '已取消' ? 'warning' : 'default'
              }>
                {currentRow.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {currentRow.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {currentRow.updateTime}
            </Descriptions.Item>
            {currentRow.payTime && (
              <Descriptions.Item label="支付时间">
                {currentRow.payTime}
              </Descriptions.Item>
            )}
            {currentRow.completeTime && (
              <Descriptions.Item label="完成时间">
                {currentRow.completeTime}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 