'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { AdministratorsApi } from '@/api/admin/administrators';
import type { AdminResponse, AdminListQuery, AdminCreateRequest, AdminUpdateRequest } from '@/api/types/administrators';
import { AdminRole, AdminStatus } from '@/api/types/common';

// 管理员数据类型
interface AdminItem {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive';
  lastLoginTime: string;
  createTime: string;
  remark?: string;
}

// API响应数据映射函数
const mapAdminResponseToItem = (admin: AdminResponse): AdminItem => ({
  id: admin.id.toString(),
  username: admin.username,
  realName: admin.realName,
  email: admin.email,
  phone: '', // API中没有phone字段，设为空字符串
  role: admin.role,
  status: admin.status === AdminStatus.ACTIVE ? 'active' : 'inactive',
  lastLoginTime: admin.lastLoginAt || '暂无',
  createTime: admin.createdAt,
  remark: '', // API中没有remark字段，设为空字符串
});



// 角色选项
const roleOptions = [
  { label: '超级管理员', value: AdminRole.SUPER_ADMIN },
  { label: '运营管理员', value: AdminRole.OPERATION_MANAGER },
  { label: '审核员', value: AdminRole.REVIEWER },
  { label: '客服人员', value: AdminRole.CUSTOMER_SERVICE },
];

// 状态选项
const statusOptions = [
  { label: '启用', value: AdminStatus.ACTIVE },
  { label: '禁用', value: AdminStatus.INACTIVE },
  { label: '锁定', value: AdminStatus.LOCKED },
];

export default function AdminListPage() {
  const actionRef = useRef<ActionType>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<AdminItem>();

  // 表格列定义
  const columns: ProColumns<AdminItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      fixed: 'left',
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      copyable: true,
    },

    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (_, record) => {
        const roleMap = {
          [AdminRole.SUPER_ADMIN]: { color: 'red', text: '超级管理员' },
          [AdminRole.OPERATION_MANAGER]: { color: 'blue', text: '运营管理员' },
          [AdminRole.REVIEWER]: { color: 'green', text: '审核员' },
          [AdminRole.CUSTOMER_SERVICE]: { color: 'orange', text: '客服人员' },
        };
        const role = roleMap[record.role as keyof typeof roleMap];
        return <Tag color={role?.color}>{role?.text}</Tag>;
      },
      valueEnum: {
        [AdminRole.SUPER_ADMIN]: { text: '超级管理员' },
        [AdminRole.OPERATION_MANAGER]: { text: '运营管理员' },
        [AdminRole.REVIEWER]: { text: '审核员' },
        [AdminRole.CUSTOMER_SERVICE]: { text: '客服人员' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'red'}>
          {record.status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '禁用', status: 'Error' },
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 150,
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setEditModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个管理员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // API调用
  const fetchAdmins = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      // 构建查询参数
      const query: AdminListQuery = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        role: params.role,
        status: params.status,
      };
      
      const response = await AdministratorsApi.getAdministratorList(query);
      
      // 映射数据格式
      const data = response.data.records.map(mapAdminResponseToItem);
      
      return {
        data,
        success: true,
        total: response.data.total,
      };
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      message.error('获取管理员列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建管理员
  const handleCreate = async (values: any) => {
    try {
      console.log('创建管理员:', values);
      
      const createData: AdminCreateRequest = {
        username: values.username,
        realName: values.realName,
        email: values.email,
        password: values.password || '123456', // 默认密码
        role: values.role,
        permissions: [], // 暂时设为空数组
      };
      
      await AdministratorsApi.createAdministrator(createData);
      message.success('创建成功');
      setCreateModalOpen(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('创建管理员失败:', error);
      message.error('创建管理员失败');
      return false;
    }
  };

  // 更新管理员
  const handleUpdate = async (values: any) => {
    try {
      console.log('更新管理员:', values);
      
      if (!currentRow) {
        message.error('缺少管理员信息');
        return false;
      }
      
      const updateData: AdminUpdateRequest = {
        realName: values.realName,
        email: values.email,
        role: values.role,
        permissions: [], // 暂时设为空数组
      };
      
      await AdministratorsApi.updateAdministrator(parseInt(currentRow.id), updateData);
      message.success('更新成功');
      setEditModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('更新管理员失败:', error);
      message.error('更新管理员失败');
      return false;
    }
  };

  // 删除管理员
  const handleDelete = async (id: string) => {
    try {
      console.log('删除管理员:', id);
      await AdministratorsApi.deleteAdministrator(parseInt(id));
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除管理员失败:', error);
      message.error('删除管理员失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<AdminItem>
        headerTitle="管理员列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建管理员
          </Button>,
        ]}
        request={fetchAdmins}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 创建管理员模态框 */}
      <ModalForm
        title="新建管理员"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
            width="md"
          />
          <ProFormText
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
            width="md"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
            width="md"
          />
          <ProFormText.Password
            name="password"
            label="密码"
            placeholder="请输入密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
            width="md"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            name="role"
            label="角色"
            placeholder="请选择角色"
            options={roleOptions}
            rules={[{ required: true, message: '请选择角色' }]}
            width="md"
          />
          <ProFormSelect
            name="status"
            label="状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择状态' }]}
            width="md"
            initialValue="active"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="请输入备注信息"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 编辑管理员模态框 */}
      <ModalForm
        title="编辑管理员"
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onFinish={handleUpdate}
        initialValues={currentRow}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
            width="md"
          />
          <ProFormText
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' },
          ]}
          width="md"
        />
        <ProForm.Group>
          <ProFormSelect
            name="role"
            label="角色"
            placeholder="请选择角色"
            options={roleOptions}
            rules={[{ required: true, message: '请选择角色' }]}
            width="md"
          />
          <ProFormSelect
            name="status"
            label="状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择状态' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="请输入备注信息"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>
    </div>
  );
}