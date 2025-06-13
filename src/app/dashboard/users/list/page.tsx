'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Space, Avatar, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined, CopyOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';
import { UserType, UserStatus, Gender } from '@/api/types/common';

// 用户数据类型 - 匹配后端AdminUserResponse
interface UserItem {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  status: UserStatus;
  userType: UserType;
  avatarUrl?: string;
  nickname?: string;
  gender?: Gender;
  birthDate?: string;
  bio?: string;
  address?: string;
  wechat?: string;
  qq?: string;
  educationLevel?: string;
  workExperience?: string;
  skills?: string;
  parentContact?: string;
  memberId?: string;
  inviteCode?: string;
  invitedBy?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

const UserListPage: React.FC = () => {
  // 表格列配置
  const columns: ProColumns<UserItem>[] = [
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
      title: '用户名',
      dataIndex: 'username',
      width: 120,
      copyable: true,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      width: 100,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 100,
      search: false,
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
      title: '微信号',
      dataIndex: 'wechat',
      width: 120,
      search: false,
      copyable: true,
      render: (text) => text || '-',
    },
    {
      title: 'QQ号',
      dataIndex: 'qq',
      width: 120,
      search: false,
      copyable: true,
      render: (text) => text || '-',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      search: false,
      valueEnum: {
        male: { text: '男', status: 'Default' },
        female: { text: '女', status: 'Success' },
        other: { text: '其他', status: 'Processing' },
      },
    },
    {
      title: '生日',
      dataIndex: 'birthDate',
      width: 120,
      search: false,
      valueType: 'date',
      render: (text) => text || '-',
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      width: 100,
      valueEnum: {
        user: { text: '普通用户', status: 'Default' },
        lawyer: { text: '律师', status: 'Processing' },
        psychologist: { text: '心理师', status: 'Success' },
        enterprise: { text: '企业', status: 'Warning' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '未激活', status: 'Default' },
        banned: { text: '已封禁', status: 'Error' },
      },
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
      title: '会员ID',
      dataIndex: 'memberId',
      width: 120,
      search: false,
      render: (text) => text || '-',
    },
    {
      title: '邀请人ID',
      dataIndex: 'invitedBy',
      width: 100,
      search: false,
      render: (text) => text || '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 150,
      search: false,
      ellipsis: true,
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
      width: 180,
      fixed: 'right',
      render: (_, record) => [
        <PermissionWrapper key="view" permissions={['user:read']}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </PermissionWrapper>,
        <PermissionWrapper key="edit" permissions={['user:write']}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </PermissionWrapper>,
        <PermissionWrapper key="delete" permissions={['user:delete']}>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </PermissionWrapper>,
      ],
    },
  ];

  // 获取用户列表数据
  const fetchUserList = async (params: any) => {
    try {
      const response = await UsersApi.getUserList({
        page: params.current ? params.current - 1 : 0,
        size: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status,
        userType: params.userType,
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
      console.error('获取用户列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 操作处理函数
  const handleView = (record: UserItem) => {
    console.log('查看用户:', record);
    // TODO: 实现查看用户详情逻辑
  };

  const handleEdit = (record: UserItem) => {
    console.log('编辑用户:', record);
    // TODO: 实现编辑用户逻辑
  };

  const handleDelete = (record: UserItem) => {
    console.log('删除用户:', record);
    // TODO: 实现删除用户逻辑
  };

  const handleCreate = () => {
    console.log('创建用户');
    // TODO: 实现创建用户逻辑
  };

  const handleBatchDelete = async (selectedKeys: React.Key[]) => {
    console.log('批量删除用户:', selectedKeys);
    // TODO: 实现批量删除用户逻辑
  };

  const handleExport = async () => {
    console.log('导出用户数据');
    // TODO: 实现导出用户数据逻辑
  };

  return (
    <PageContainer title="用户列表" content="管理系统中的所有用户信息">
      <ListPageTemplate<UserItem>
        columns={columns}
        request={fetchUserList}
        rowKey="id"
        showCreateButton={true}
        createButtonText="新建用户"
        onCreateClick={handleCreate}
        createPermissions={['user:create']}
        showBatchDelete={true}
        onBatchDelete={handleBatchDelete}
        batchDeletePermissions={['user:delete']}
        showExportButton={true}
        onExport={handleExport}
        exportPermissions={['user:export']}
        searchConfig={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        tableProps={{
          scroll: { x: 2000 },
        }}
      />
    </PageContainer>
  );
};

export default UserListPage; 