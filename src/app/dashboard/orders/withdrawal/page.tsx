'use client';

import React, { useRef, useState } from 'react';
import { EditOutlined, EyeOutlined, BankOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormSelect, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Modal, Typography, Descriptions, Card, Row, Col } from 'antd';
import { OrdersApi } from '@/api/admin/orders';
import type { WithdrawalApplicationResponse, ProcessWithdrawalRequest } from '@/api/types/orders';

const { Paragraph } = Typography;

// 提现申请数据类型 (映射API数据)
interface WithdrawalItem {
  id: string;
  applicationNumber: string;
  applicantName: string;
  userType: '律师' | '心理师';
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: '待审核' | '审核通过' | '审核拒绝' | '已打款' | '打款失败';
  applicationTime: string;
  processTime?: string;
  reason?: string;
}

// API数据映射函数
const mapWithdrawalResponseToItem = (withdrawal: WithdrawalApplicationResponse): WithdrawalItem => ({
  id: withdrawal.id.toString(),
  applicationNumber: withdrawal.applicationNumber,
  applicantName: withdrawal.applicantName,
  userType: withdrawal.userType === 'lawyer' ? '律师' : '心理师',
  amount: withdrawal.amount,
  bankInfo: withdrawal.bankInfo,
  status: withdrawal.status,
  applicationTime: withdrawal.applicationTime,
  processTime: withdrawal.processTime,
  reason: withdrawal.reason,
});

// 状态选项
const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '审核通过', value: 'approved' },
  { label: '审核拒绝', value: 'rejected' },
  { label: '已打款', value: 'transferred' },
  { label: '打款失败', value: 'failed' },
];

// 用户类型选项
const userTypeOptions = [
  { label: '律师', value: 'lawyer' },
  { label: '心理师', value: 'psychologist' },
];

export default function WithdrawalPage() {
  const actionRef = useRef<ActionType>();
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<WithdrawalItem>();

  // 表格列定义
  const columns: ProColumns<WithdrawalItem>[] = [
    {
      title: '申请编号',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      width: 160,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <BankOutlined style={{ color: '#1890ff' }} />
          <span>{record.applicationNumber}</span>
        </Space>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 120,
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      key: 'userType',
      width: 100,
      valueEnum: {
        lawyer: { text: '律师' },
        psychologist: { text: '心理师' },
      },
      render: (text) => <Tag color={text === '律师' ? 'blue' : 'green'}>{text}</Tag>,
    },
    {
      title: '提现金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      search: false,
      render: (text) => <span style={{ color: '#f50', fontWeight: 'bold' }}>¥{text}</span>,
      sorter: true,
    },
    {
      title: '收款银行',
      dataIndex: ['bankInfo', 'bankName'],
      key: 'bankName',
      width: 120,
      search: false,
    },
    {
      title: '银行账号',
      dataIndex: ['bankInfo', 'accountNumber'],
      key: 'accountNumber',
      width: 150,
      search: false,
      render: (text) => `****${text?.slice(-4)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusMap = {
          '待审核': { color: 'default', text: '待审核' },
          '审核通过': { color: 'processing', text: '审核通过' },
          '审核拒绝': { color: 'error', text: '审核拒绝' },
          '已打款': { color: 'success', text: '已打款' },
          '打款失败': { color: 'warning', text: '打款失败' },
        };
        const status = statusMap[record.status];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      valueEnum: {
        pending: { text: '待审核', status: 'Default' },
        approved: { text: '审核通过', status: 'Processing' },
        rejected: { text: '审核拒绝', status: 'Error' },
        transferred: { text: '已打款', status: 'Success' },
        failed: { text: '打款失败', status: 'Warning' },
      },
    },
    {
      title: '申请时间',
      dataIndex: 'applicationTime',
      key: 'applicationTime',
      width: 150,
      search: false,
      sorter: true,
    },
    {
      title: '处理时间',
      dataIndex: 'processTime',
      key: 'processTime',
      width: 150,
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
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
          {record.status === '待审核' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentRow(record);
                setProcessModalOpen(true);
              }}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // API调用
  const fetchWithdrawals = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      const query = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status,
        userType: params.userType,
        startDate: params.startDate,
        endDate: params.endDate,
      };
      
      const response = await OrdersApi.getWithdrawalApplications(query);
      const data = response.data.content.map(mapWithdrawalResponseToItem);
      
      return {
        data,
        success: true,
        total: response.data.totalElements,
      };
    } catch (error) {
      console.error('获取提现申请列表失败:', error);
      message.error('获取提现申请列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理提现申请
  const handleProcess = async (values: any) => {
    try {
      console.log('处理提现申请:', values);
      
      if (!currentRow) {
        message.error('缺少提现申请信息');
        return false;
      }
      
      const processData: ProcessWithdrawalRequest = {
        withdrawalId: parseInt(currentRow.id),
        status: values.status,
        reason: values.reason,
      };
      
      await OrdersApi.processWithdrawal(processData);
      message.success('处理成功');
      setProcessModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('处理提现申请失败:', error);
      message.error('处理提现申请失败');
      return false;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<WithdrawalItem>
        headerTitle="提现申请管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        request={fetchWithdrawals}
        columns={columns}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 处理申请模态框 */}
      <ModalForm
        title="处理提现申请"
        open={processModalOpen}
        onOpenChange={setProcessModalOpen}
        onFinish={handleProcess}
        modalProps={{
          destroyOnClose: true,
          width: 500,
        }}
      >
        <ProFormSelect
          name="status"
          label="处理结果"
          placeholder="请选择处理结果"
          options={[
            { label: '审核通过', value: 'approved' },
            { label: '审核拒绝', value: 'rejected' },
          ]}
          rules={[{ required: true, message: '请选择处理结果' }]}
        />
        <ProFormTextArea
          name="reason"
          label="处理说明"
          placeholder="请输入处理说明(拒绝时必填)"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 申请详情模态框 */}
      <Modal
        title="提现申请详情"
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
          <div>
            <Card title="申请信息" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="申请编号" span={2}>
                  {currentRow.applicationNumber}
                </Descriptions.Item>
                <Descriptions.Item label="申请人">
                  {currentRow.applicantName}
                </Descriptions.Item>
                <Descriptions.Item label="用户类型">
                  <Tag color={currentRow.userType === '律师' ? 'blue' : 'green'}>
                    {currentRow.userType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="提现金额">
                  <span style={{ color: '#f50', fontWeight: 'bold', fontSize: 16 }}>
                    ¥{currentRow.amount}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="申请状态">
                  <Tag color={
                    currentRow.status === '已打款' ? 'success' :
                    currentRow.status === '审核通过' ? 'processing' :
                    currentRow.status === '审核拒绝' ? 'error' :
                    currentRow.status === '打款失败' ? 'warning' : 'default'
                  }>
                    {currentRow.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {currentRow.applicationTime}
                </Descriptions.Item>
                {currentRow.processTime && (
                  <Descriptions.Item label="处理时间">
                    {currentRow.processTime}
                  </Descriptions.Item>
                )}
                {currentRow.reason && (
                  <Descriptions.Item label="处理说明" span={2}>
                    {currentRow.reason}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="收款信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="开户银行">
                  {currentRow.bankInfo.bankName}
                </Descriptions.Item>
                <Descriptions.Item label="账户名称">
                  {currentRow.bankInfo.accountName}
                </Descriptions.Item>
                <Descriptions.Item label="银行账号" span={2}>
                  {currentRow.bankInfo.accountNumber}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
} 