'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Avatar, Badge, Rate, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined, UserOutlined, CopyOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';
import { UserResponse } from '@/api/types/users';

// 心理师数据类型 - 基于UserResponse
interface PsychologistItem extends UserResponse {
  licenseNumber?: string;
  institution?: string;
  qualifications?: string[];
  specializations?: string[];
  experience?: number;
  rating?: number;
  consultationCount?: number;
  verified?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
}

const PsychologistManagePage: React.FC = () => {
  // 表格列配置
  const columns: ProColumns<PsychologistItem>[] = [
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
      title: '所属机构',
      dataIndex: 'institution',
      width: 180,
      ellipsis: true,
    },
    {
      title: '专业资质',
      dataIndex: 'qualifications',
      width: 200,
      search: false,
      render: (_, record) => (
        <>
          {record.qualifications?.map((qualification, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 4 }}>
              {qualification}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '专长领域',
      dataIndex: 'specializations',
      width: 200,
      search: false,
      render: (_, record) => (
        <>
          {record.specializations?.map((specialization, index) => (
            <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
              {specialization}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '从业年限',
      dataIndex: 'experience',
      width: 100,
      search: false,
      render: (experience) => experience ? `${experience}年` : '-',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 120,
      search: false,
      render: (rating) => rating ? (
        <Rate disabled defaultValue={Number(rating)} allowHalf />
      ) : '-',
    },
    {
      title: '咨询次数',
      dataIndex: 'consultationCount',
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
        <PermissionWrapper key="view" permissions={['user:psychologist:read']}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </PermissionWrapper>,
        <PermissionWrapper key="edit" permissions={['user:psychologist:write']}>
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
          <PermissionWrapper key="approve" permissions={['user:psychologist:verify']}>
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
          <PermissionWrapper key="reject" permissions={['user:psychologist:verify']}>
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

  // 获取心理师列表数据
  const fetchPsychologistList = async (params: any) => {
    try {
      const response = await UsersApi.getPsychologistList({
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
      console.error('获取心理师列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 操作处理函数
  const handleView = (record: PsychologistItem) => {
    console.log('查看心理师:', record);
    // TODO: 实现查看心理师详情逻辑
  };

  const handleEdit = (record: PsychologistItem) => {
    console.log('编辑心理师:', record);
    // TODO: 实现编辑心理师逻辑
  };

  const handleApprove = (record: PsychologistItem) => {
    console.log('通过心理师认证:', record);
    // TODO: 实现通过心理师认证逻辑
  };

  const handleReject = (record: PsychologistItem) => {
    console.log('拒绝心理师认证:', record);
    // TODO: 实现拒绝心理师认证逻辑
  };

  const handleExport = async () => {
    console.log('导出心理师数据');
    // TODO: 实现导出心理师数据逻辑
  };

  return (
    <PageContainer title="心理师管理" content="管理系统中的心理师认证和信息">
      <ListPageTemplate<PsychologistItem>
        columns={columns}
        request={fetchPsychologistList}
        rowKey="id"
        showCreateButton={false}
        showExportButton={true}
        onExport={handleExport}
        exportPermissions={['user:psychologist:export']}
        searchConfig={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        tableProps={{
          scroll: { x: 1700 },
        }}
      />
    </PageContainer>
  );
};

export default PsychologistManagePage; 