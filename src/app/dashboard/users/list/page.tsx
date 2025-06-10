'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Avatar, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';

// 用户数据类型
interface UserItem {
  id: number;
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  userType: 'user' | 'lawyer' | 'psychologist' | 'enterprise';
  createdAt: string;
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
      dataIndex: 'avatar',
      width: 80,
      search: false,
      render: (_, record) => (
        <Avatar 
          src={record.avatar} 
          icon={<UserOutlined />}
          size="small"
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
      title: '操作',
      valueType: 'option',
      width: 150,
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
        page: params.current - 1,
        size: params.pageSize,
        keyword: params.keyword,
        status: params.status,
        userType: params.userType,
      });

      if (response.success) {
        return {
          data: response.data.content,
          success: true,
          total: response.data.totalElements,
        };
      } else {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
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
          scroll: { x: 1200 },
        }}
      />
    </PageContainer>
  );
};

export default UserListPage; 