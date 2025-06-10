'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Badge, Image } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';

// 企业用户数据类型
interface EnterpriseItem {
  id: number;
  username: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  businessLicense: string;
  logo?: string;
  address: string;
  industry: string;
  scale: 'small' | 'medium' | 'large';
  description?: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  jobCount: number;
  createdAt: string;
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
      title: '企业LOGO',
      dataIndex: 'logo',
      width: 100,
      search: false,
      render: (_, record) => (
        <div style={{ width: 60, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          {record.logo ? (
            <Image 
              src={record.logo} 
              width={60}
              height={40}
              style={{ objectFit: 'contain' }}
              preview={false}
            />
          ) : (
            <span style={{ fontSize: 12, color: '#999' }}>无LOGO</span>
          )}
        </div>
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
      title: '联系人',
      dataIndex: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 130,
      copyable: true,
    },
    {
      title: '邮箱',
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
      title: '注册时间',
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
        record.status === 'pending' && (
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
        record.status === 'pending' && (
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
        page: params.current - 1,
        size: params.pageSize,
        keyword: params.keyword,
        status: params.status,
        industry: params.industry,
        scale: params.scale,
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
          scroll: { x: 1600 },
        }}
      />
    </PageContainer>
  );
};

export default EnterpriseManagePage; 