'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Badge, Avatar, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined, UserOutlined, CopyOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';
import { UserResponse } from '@/api/types/users';

// 企业用户数据类型 - 基于UserResponse
interface EnterpriseItem extends UserResponse {
  companyName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessLicense?: string;
  industry?: string;
  scale?: 'small' | 'medium' | 'large';
  description?: string;
  verified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  jobCount?: number;
  verifiedAt?: string;
}

const EnterpriseManagePage: React.FC = () => {
  // 表格列配置
  const columns: ProColumns<EnterpriseItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      width: 80,
      search: false,
      render: (_, record) => (
        <Avatar 
          size={40}
          src={record.avatarUrl} 
          icon={<UserOutlined />}
        />
      ),
    },
    {
      title: '企业名称',
      dataIndex: 'companyName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      width: 100,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      copyable: true,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 130,
      copyable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      width: 180,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '营业执照号',
      dataIndex: 'businessLicense',
      width: 180,
      copyable: true,
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '所属行业',
      dataIndex: 'industry',
      width: 120,
      valueEnum: {
        'technology': { text: '科技互联网', status: 'Processing' },
        'finance': { text: '金融', status: 'Success' },
        'education': { text: '教育', status: 'Default' },
        'healthcare': { text: '医疗健康', status: 'Warning' },
        'manufacturing': { text: '制造业', status: 'Error' },
        'retail': { text: '零售', status: 'Processing' },
        'others': { text: '其他', status: 'Default' },
      },
    },
    {
      title: '企业规模',
      dataIndex: 'scale',
      width: 100,
      valueEnum: {
        small: { text: '小型', status: 'Default' },
        medium: { text: '中型', status: 'Processing' },
        large: { text: '大型', status: 'Success' },
      },
    },
    {
      title: '发布职位',
      dataIndex: 'jobCount',
      width: 100,
      search: false,
    },
    {
      title: '认证状态',
      dataIndex: 'verificationStatus',
      width: 120,
      valueEnum: {
        pending: { text: '待审核', status: 'Processing' },
        approved: { text: '已通过', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Error' },
      },
    },
    {
      title: '账户状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '未激活', status: 'Default' },
        banned: { text: '已封禁', status: 'Error' },
      },
    },
    {
      title: '实名认证',
      dataIndex: 'verified',
      width: 100,
      search: false,
      render: (verified) => (
        <Badge 
          status={verified ? 'success' : 'error'} 
          text={verified ? '已认证' : '未认证'} 
        />
      ),
    },
    {
      title: '邀请码',
      dataIndex: 'inviteCode',
      width: 120,
      search: false,
      render: (text) => text ? (
        <Space>
          <span>{text}</span>
          <Tooltip title="复制邀请码">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard.writeText(String(text))}
            />
          </Tooltip>
        </Space>
      ) : '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value: any) => ({
          startDate: value?.[0],
          endDate: value?.[1],
        }),
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      fixed: 'right',
      render: (_, record) => [
        <PermissionWrapper key="view" permissions={['user:enterprise:read']}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </PermissionWrapper>,
        <PermissionWrapper key="edit" permissions={['user:enterprise:write']}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </PermissionWrapper>,
        record.verificationStatus === 'pending' && (
          <PermissionWrapper key="approve" permissions={['user:enterprise:verify']}>
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record)}
            >
              通过
            </Button>
          </PermissionWrapper>
        ),
        record.verificationStatus === 'pending' && (
          <PermissionWrapper key="reject" permissions={['user:enterprise:verify']}>
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            >
              拒绝
            </Button>
          </PermissionWrapper>
        ),
      ].filter(Boolean),
    },
  ];

  // 获取企业用户列表数据
  const fetchEnterpriseList = async (params: any) => {
    try {
      const response = await UsersApi.getEnterpriseList({
        page: params.current ? params.current - 1 : 0,
        size: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status,
        industry: params.industry,
        scale: params.scale,
        startDate: params.startDate,
        endDate: params.endDate,
      });

      if (response && response.data) {
        return {
          data: response.data.records || [],
          success: true,
          total: response.data.total || 0,
        };
      } else {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error('获取企业列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 操作处理函数
  const handleView = (record: EnterpriseItem) => {
    console.log('查看企业:', record);
    // TODO: 实现查看企业详情逻辑
  };

  const handleEdit = (record: EnterpriseItem) => {
    console.log('编辑企业:', record);
    // TODO: 实现编辑企业逻辑
  };

  const handleApprove = (record: EnterpriseItem) => {
    console.log('通过企业认证:', record);
    // TODO: 实现通过企业认证逻辑
  };

  const handleReject = (record: EnterpriseItem) => {
    console.log('拒绝企业认证:', record);
    // TODO: 实现拒绝企业认证逻辑
  };

  const handleExport = async () => {
    console.log('导出企业数据');
    // TODO: 实现导出企业数据逻辑
  };

  return (
    <PageContainer title="企业用户管理" content="管理系统中的企业用户认证和信息">
      <ListPageTemplate<EnterpriseItem>
        columns={columns}
        request={fetchEnterpriseList}
        rowKey="id"
        showCreateButton={false}
        showExportButton={true}
        onExport={handleExport}
        exportPermissions={['user:enterprise:export']}
        searchConfig={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        tableProps={{
          scroll: { x: 1800 },
        }}
      />
    </PageContainer>
  );
};

export default EnterpriseManagePage; 