'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Badge } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import PermissionWrapper from '@/components/PermissionWrapper';
import { UsersApi } from '@/api/admin/users';
import { UserResponse } from '@/api/types/users';

// 心理师数据类型 - 精确匹配后端响应数据结构
interface PsychologistItem {
  id: number;
  userId: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  status: string;
  licenseNumber: string;
  specialties: string[];
  experienceYears: number;
  consultationCount: number;
  textFee: number;
  voiceFee: number;
  videoFee: number;
  isOnline: boolean;
  acceptConsultation: boolean;
  introduction: string;
  certificates: string[];
  slogan: string;
  createdAt: string;
  updatedAt: string;
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
      title: '用户ID',
      dataIndex: 'userId',
      width: 80,
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '姓名',
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
      title: '执业证号',
      dataIndex: 'licenseNumber',
      width: 150,
      copyable: true,
    },
    {
      title: '专业领域',
      dataIndex: 'specialties',
      width: 200,
      search: false,
      render: (_, record) => (
        <>
          {record.specialties?.map((specialty, index) => (
            <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
              {specialty}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '从业年限',
      dataIndex: 'experienceYears',
      width: 100,
      search: false,
      render: (experienceYears) => experienceYears ? `${experienceYears}年` : '-',
    },
    {
      title: '咨询次数',
      dataIndex: 'consultationCount',
      width: 100,
      search: false,
    },
    {
      title: '文字咨询费',
      dataIndex: 'textFee',
      width: 120,
      search: false,
      render: (textFee) => textFee ? `￥${textFee}/次` : '-',
    },
    {
      title: '语音咨询费',
      dataIndex: 'voiceFee',
      width: 120,
      search: false,
      render: (voiceFee) => voiceFee ? `￥${voiceFee}/次` : '-',
    },
    {
      title: '视频咨询费',
      dataIndex: 'videoFee',
      width: 120,
      search: false,
      render: (videoFee) => videoFee ? `￥${videoFee}/次` : '-',
    },
    {
      title: '在线状态',
      dataIndex: 'isOnline',
      width: 100,
      search: false,
      render: (isOnline) => (
        <Badge 
          status={isOnline ? 'success' : 'default'} 
          text={isOnline ? '在线' : '离线'} 
        />
      ),
    },
    {
      title: '接受咨询',
      dataIndex: 'acceptConsultation',
      width: 120,
      search: false,
      render: (acceptConsultation) => (
        <Badge 
          status={acceptConsultation ? 'processing' : 'error'} 
          text={acceptConsultation ? '接受中' : '已暂停'} 
        />
      ),
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
      title: '个人介绍',
      dataIndex: 'introduction',
      width: 200,
      search: false,
      ellipsis: true,
    },
    {
      title: '证书',
      dataIndex: 'certificates',
      width: 150,
      search: false,
      render: (_, record) => (
        <>
          {record.certificates?.map((certificate, index) => (
            <Tag key={index} color="green" style={{ marginBottom: 4 }}>
              {certificate}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '口号',
      dataIndex: 'slogan',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
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

      ].filter(Boolean),
    },
  ];

  // 获取心理师列表数据
  const fetchPsychologistList = async (params: any): Promise<{ data: PsychologistItem[]; success: boolean; total: number; }> => {
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
          data: response.data.records as unknown as PsychologistItem[] || [],
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
          scroll: { x: 2400 },
        }}
      />
    </PageContainer>
  );
};

export default PsychologistManagePage; 