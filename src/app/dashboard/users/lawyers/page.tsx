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

// 律师数据类型 - 基于UserResponse
interface LawyerItem extends UserResponse {
  licenseNumber?: string;
  lawFirm?: string;
  specialties?: string[];
  experience?: number;
  verified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
}

const LawyerManagePage: React.FC = () => {
  // 表格列配置
  const columns: ProColumns<LawyerItem>[] = [
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
      title: '姓名',
      dataIndex: 'realName',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      copyable: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      copyable: true,
    },
    {
      title: '执业证号',
      dataIndex: 'licenseNumber',
      width: 150,
      copyable: true,
    },
    {
      title: '所属律所',
      dataIndex: 'lawFirm',
      width: 180,
      ellipsis: true,
    },
    {
      title: '专业领域',
      dataIndex: 'specialties',
      width: 200,
      search: false,
      render: (_, record) => (
        <>
          {record.specialties?.map((specialty, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {specialty}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '执业年限',
      dataIndex: 'experience',
      width: 100,
      search: false,
      render: (experience) => experience ? `${experience}年` : '-',
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
      title: '申请时间',
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
        <PermissionWrapper key="view" permissions={['user:lawyer:read']}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </PermissionWrapper>,
        <PermissionWrapper key="edit" permissions={['user:lawyer:write']}>
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
          <PermissionWrapper key="approve" permissions={['user:lawyer:verify']}>
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
          <PermissionWrapper key="reject" permissions={['user:lawyer:verify']}>
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

  // 获取律师列表数据
  const fetchLawyerList = async (params: any) => {
    try {
      const response = await UsersApi.getLawyerList({
        page: params.current ? params.current - 1 : 0,
        size: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status,
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
      console.error('获取律师列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 操作处理函数
  const handleView = (record: LawyerItem) => {
    console.log('查看律师:', record);
    // TODO: 实现查看律师详情逻辑
  };

  const handleEdit = (record: LawyerItem) => {
    console.log('编辑律师:', record);
    // TODO: 实现编辑律师逻辑
  };

  const handleApprove = (record: LawyerItem) => {
    console.log('通过律师认证:', record);
    // TODO: 实现通过律师认证逻辑
  };

  const handleReject = (record: LawyerItem) => {
    console.log('拒绝律师认证:', record);
    // TODO: 实现拒绝律师认证逻辑
  };

  const handleExport = async () => {
    console.log('导出律师数据');
    // TODO: 实现导出律师数据逻辑
  };

  return (
    <PageContainer title="律师管理" content="管理系统中的律师认证和信息">
      <ListPageTemplate<LawyerItem>
        columns={columns}
        request={fetchLawyerList}
        rowKey="id"
        showCreateButton={false}
        showExportButton={true}
        onExport={handleExport}
        exportPermissions={['user:lawyer:export']}
        searchConfig={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        tableProps={{
          scroll: { x: 1600 },
        }}
      />
    </PageContainer>
  );
};

export default LawyerManagePage; 