'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Avatar, Badge } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';

// 律师数据类型
interface LawyerItem {
  id: number;
  username: string;
  realName: string;
  email?: string;
  phone: string;
  avatar?: string;
  licenseNumber: string;
  lawFirm: string;
  specialties: string[];
  experience: number;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
      dataIndex: 'avatar',
      width: 80,
      search: false,
      render: (_, record) => (
        <Avatar src={record.avatar} size="small">
          {record.realName?.charAt(0)}
        </Avatar>
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
      render: (experience) => `${experience}年`,
    },
    {
      title: '认证状态',
      dataIndex: 'status',
      width: 120,
      valueEnum: {
        pending: { text: '待审核', status: 'Processing' },
        approved: { text: '已通过', status: 'Success' },
        rejected: { text: '已拒绝', status: 'Error' },
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
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
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
        record.status === 'pending' && (
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
        record.status === 'pending' && (
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
        page: params.current - 1,
        size: params.pageSize,
        keyword: params.keyword,
        status: params.status,
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
          scroll: { x: 1400 },
        }}
      />
    </PageContainer>
  );
};

export default LawyerManagePage; 