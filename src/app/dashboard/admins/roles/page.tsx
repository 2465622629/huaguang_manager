'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Tree, Card, Row, Col } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { RolesApi } from '@/api/admin/roles';
import type { RoleItem, RoleListQuery } from '@/api/types/roles';

// 权限树数据
const permissionTreeData: DataNode[] = [
  {
    title: '用户管理',
    key: 'user_management',
    children: [
      { title: '用户列表查看', key: 'user:list' },
      { title: '用户信息编辑', key: 'user:edit' },
      { title: '用户状态管理', key: 'user:status' },
      { title: '律师审核', key: 'lawyer:review' },
      { title: '心理师审核', key: 'psychologist:review' },
    ],
  },
  {
    title: '管理员管理',
    key: 'admin_management',
    children: [
      { title: '管理员列表', key: 'admin:list' },
      { title: '管理员创建', key: 'admin:create' },
      { title: '管理员编辑', key: 'admin:edit' },
      { title: '管理员删除', key: 'admin:delete' },
      { title: '角色权限管理', key: 'role:manage' },
    ],
  },
  {
    title: '内容管理',
    key: 'content_management',
    children: [
      { title: '课程管理', key: 'course:manage' },
      { title: '法律模板管理', key: 'legal_template:manage' },
      { title: '心理测试管理', key: 'psych_test:manage' },
      { title: '内容审核', key: 'content:review' },
    ],
  },
  {
    title: '订单管理',
    key: 'order_management',
    children: [
      { title: '咨询订单查看', key: 'order:consultation:view' },
      { title: '订单状态管理', key: 'order:status' },
      { title: '提现审核', key: 'withdrawal:review' },
      { title: '财务报表', key: 'finance:report' },
    ],
  },
  {
    title: '系统设置',
    key: 'system_settings',
    children: [
      { title: '基础设置', key: 'system:basic' },
      { title: '系统监控', key: 'system:monitor' },
      { title: '日志查看', key: 'system:logs' },
    ],
  },
];



export default function AdminRolesPage() {
  const actionRef = useRef<ActionType>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<RoleItem>();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 表格列定义
  const columns: ProColumns<RoleItem>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '关联用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      search: false,
      render: (text) => <Tag color="blue">{text}</Tag>,
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      search: false,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
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
            icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setSelectedPermissions(record.permissions);
              setPermissionModalOpen(true);
            }}
          >
            权限设置
          </Button>
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
          {record.code !== 'super_admin' && (
            <Popconfirm
              title="确认删除"
              description="确定要删除这个角色吗？删除后相关用户将失去权限。"
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 获取角色列表 - 使用真实API
  const fetchRoles = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      // 构建查询参数
      const query: RoleListQuery = {
        page: params.current || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword,
        status: params.status
      };

      // 调用真实API
      const response = await RolesApi.getRoleList(query);
      
      if (response.success && response.data) {
        return {
          data: response.data.list,
          success: true,
          total: response.data.total,
        };
      } else {
        message.error('获取角色列表失败');
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error('获取角色列表错误:', error);
      message.error(error instanceof Error ? error.message : '获取角色列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建角色
  const handleCreate = async (values: any) => {
    try {
      console.log('创建角色:', values);
      
      const response = await RolesApi.createRole(values);
      
      if (response.success) {
        message.success(response.message || '创建成功');
        setCreateModalOpen(false);
        actionRef.current?.reload();
        return true;
      } else {
        message.error(response.message || '创建失败');
        return false;
      }
    } catch (error) {
      console.error('创建角色错误:', error);
      message.error(error instanceof Error ? error.message : '创建角色失败');
      return false;
    }
  };

  // 更新角色
  const handleUpdate = async (values: any) => {
    try {
      if (!currentRow?.id) {
        message.error('角色信息不完整');
        return false;
      }
      
      console.log('更新角色:', values);
      
      const response = await RolesApi.updateRole(currentRow.id, values);
      
      if (response.success) {
        message.success(response.message || '更新成功');
        setEditModalOpen(false);
        setCurrentRow(undefined);
        actionRef.current?.reload();
        return true;
      } else {
        message.error(response.message || '更新失败');
        return false;
      }
    } catch (error) {
      console.error('更新角色错误:', error);
      message.error(error instanceof Error ? error.message : '更新角色失败');
      return false;
    }
  };

  // 删除角色
  const handleDelete = async (id: string) => {
    try {
      console.log('删除角色:', id);
      
      const response = await RolesApi.deleteRole(id);
      
      if (response.success) {
        message.success(response.message || '删除成功');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除角色错误:', error);
      message.error(error instanceof Error ? error.message : '删除角色失败');
    }
  };

  // 保存权限设置
  const handleSavePermissions = async () => {
    try {
      if (!currentRow?.id) {
        message.error('角色信息不完整');
        return false;
      }

      console.log('保存权限设置:', {
        roleId: currentRow.id,
        permissions: selectedPermissions,
      });

      const response = await RolesApi.updateRolePermissions({
        roleId: currentRow.id,
        permissions: selectedPermissions,
      });

      if (response.success) {
        message.success(response.message || '权限设置保存成功');
        setPermissionModalOpen(false);
        setCurrentRow(undefined);
        actionRef.current?.reload();
        return true;
      } else {
        message.error(response.message || '权限设置保存失败');
        return false;
      }
    } catch (error) {
      console.error('保存权限设置错误:', error);
      message.error(error instanceof Error ? error.message : '保存权限设置失败');
      return false;
    }
  };

  // 权限树选择处理
  const onPermissionCheck = (checkedKeys: any) => {
    setSelectedPermissions(checkedKeys);
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24}>
        <Col span={24}>
          <ProTable<RoleItem>
            headerTitle="角色管理"
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
                新建角色
              </Button>,
            ]}
            request={fetchRoles}
            columns={columns}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        </Col>
      </Row>

      {/* 创建角色模态框 */}
      <ModalForm
        title="新建角色"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色代码"
          placeholder="请输入角色代码"
          rules={[
            { required: true, message: '请输入角色代码' },
            { pattern: /^[a-z_]+$/, message: '角色代码只能包含小写字母和下划线' },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          placeholder="请输入角色描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 编辑角色模态框 */}
      <ModalForm
        title="编辑角色"
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onFinish={handleUpdate}
        initialValues={currentRow}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色代码"
          placeholder="请输入角色代码"
          disabled={currentRow?.code === 'super_admin'}
          rules={[
            { required: true, message: '请输入角色代码' },
            { pattern: /^[a-z_]+$/, message: '角色代码只能包含小写字母和下划线' },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          placeholder="请输入角色描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 权限设置模态框 */}
      <ModalForm
        title={`设置权限 - ${currentRow?.name}`}
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        onFinish={handleSavePermissions}
        submitter={{
          searchConfig: {
            submitText: '保存权限',
          },
        }}
        modalProps={{
          destroyOnClose: true,
          width: 600,
        }}
      >
        <Card title="权限列表" size="small">
          <div style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#f6f8fa', borderRadius: 4, fontSize: 12, color: '#666' }}>
            <strong>注意：</strong>权限树配置当前为前端预设，权限管理接口开发中。当前显示的权限仅用于展示，实际权限控制以后端配置为准。
          </div>
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={selectedPermissions}
            onCheck={onPermissionCheck}
            treeData={permissionTreeData}
            style={{ maxHeight: 400, overflow: 'auto' }}
          />
        </Card>
        <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
          提示：选中父级权限将自动包含所有子级权限
        </div>
      </ModalForm>
    </div>
  );
}