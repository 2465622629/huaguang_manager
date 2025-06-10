'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Modal, Typography } from 'antd';
import { ContentApi } from '@/api/admin/content';
import type { LegalTemplateResponse } from '@/api/types/content';
import { ContentStatus } from '@/api/types/content';

const { Paragraph } = Typography;

// 法律模板数据类型 (映射API数据)
interface LegalTemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  usageCount: number;
  downloadCount: number;
  status: 'draft' | 'published' | 'archived';
  createTime: string;
  updateTime: string;
  author: string;
}

// API数据映射函数
const mapTemplateResponseToItem = (template: LegalTemplateResponse): LegalTemplateItem => ({
  id: template.id.toString(),
  title: template.title,
  category: template.category,
  description: template.description,
  content: template.content,
  usageCount: 0, // API暂未提供，使用默认值
  downloadCount: template.downloadCount,
  status: template.status === ContentStatus.PUBLISHED ? 'published' : template.status === ContentStatus.DRAFT ? 'draft' : 'archived',
  createTime: template.createdAt,
  updateTime: template.updatedAt,
  author: '系统管理员', // API暂未提供作者信息
});



// 模板分类选项
const categoryOptions = [
  { label: '劳动合同', value: 'labor_contract' },
  { label: '租赁合同', value: 'rental_contract' },
  { label: '借款协议', value: 'loan_agreement' },
  { label: '买卖合同', value: 'sales_contract' },
  { label: '服务协议', value: 'service_agreement' },
];

// 状态选项
const statusOptions = [
  { label: '草稿', value: ContentStatus.DRAFT },
  { label: '已发布', value: ContentStatus.PUBLISHED },
  { label: '已归档', value: ContentStatus.ARCHIVED },
];

export default function LegalTemplatesPage() {
  const actionRef = useRef<ActionType>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<LegalTemplateItem>();

  // 表格列定义
  const columns: ProColumns<LegalTemplateItem>[] = [
    {
      title: '模板标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>{record.title}</span>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      valueEnum: {
        labor_contract: { text: '劳动合同' },
        rental_contract: { text: '租赁合同' },
        loan_agreement: { text: '借款协议' },
        sales_contract: { text: '买卖合同' },
        service_agreement: { text: '服务协议' },
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      search: false,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      search: false,
      render: (text) => <Tag color="blue">{text}</Tag>,
      sorter: true,
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      search: false,
      render: (text) => <Tag color="green">{text}</Tag>,
      sorter: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusMap = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'green', text: '已发布' },
          archived: { color: 'orange', text: '已归档' },
        };
        const status = statusMap[record.status];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
        archived: { text: '已归档', status: 'Warning' },
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
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setPreviewModalOpen(true);
            }}
          >
            预览
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
          <Popconfirm
            title="确认删除"
            description="确定要删除这个法律模板吗？"
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
  const fetchTemplates = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      const query = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        category: params.category,
        status: params.status,
      };
      
      const response = await ContentApi.getLegalTemplateList(query);
      const data = response.data.content.map(mapTemplateResponseToItem);
      
      return {
        data,
        success: true,
        total: response.data.totalElements,
      };
    } catch (error) {
      console.error('获取法律模板列表失败:', error);
      message.error('获取法律模板列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建模板
  const handleCreate = async (values: any) => {
    try {
      console.log('创建模板:', values);
      
      const createData = {
        title: values.title,
        description: values.description,
        content: values.content,
        category: values.category,
        tags: [],
      };
      
      await ContentApi.createLegalTemplate(createData);
      message.success('创建成功');
      setCreateModalOpen(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('创建法律模板失败:', error);
      message.error('创建法律模板失败');
      return false;
    }
  };

  // 更新模板
  const handleUpdate = async (values: any) => {
    try {
      console.log('更新模板:', values);
      
      if (!currentRow) {
        message.error('缺少模板信息');
        return false;
      }
      
      const updateData = {
        title: values.title,
        description: values.description,
        content: values.content,
        category: values.category,
        tags: [],
      };
      
      await ContentApi.updateLegalTemplate(parseInt(currentRow.id), updateData);
      message.success('更新成功');
      setEditModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('更新法律模板失败:', error);
      message.error('更新法律模板失败');
      return false;
    }
  };

  // 删除模板
  const handleDelete = async (id: string) => {
    try {
      console.log('删除模板:', id);
      await ContentApi.deleteLegalTemplate(parseInt(id));
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除法律模板失败:', error);
      message.error('删除法律模板失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<LegalTemplateItem>
        headerTitle="法律模板管理"
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
            新建模板
          </Button>,
        ]}
        request={fetchTemplates}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 创建模板模态框 */}
      <ModalForm
        title="新建法律模板"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
          width: 800,
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="title"
            label="模板标题"
            placeholder="请输入模板标题"
            rules={[{ required: true, message: '请输入模板标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="模板分类"
            placeholder="请选择模板分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择模板分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="模板描述"
          placeholder="请输入模板描述"
          rules={[{ required: true, message: '请输入模板描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProFormTextArea
          name="content"
          label="模板内容"
          placeholder="请输入法律模板的详细内容"
          rules={[{ required: true, message: '请输入模板内容' }]}
          fieldProps={{ rows: 10 }}
        />
        <ProForm.Group>
          <ProFormText
            name="author"
            label="作者"
            placeholder="请输入作者姓名"
            rules={[{ required: true, message: '请输入作者姓名' }]}
            width="md"
          />
          <ProFormSelect
            name="status"
            label="发布状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择发布状态' }]}
            width="md"
            initialValue="draft"
          />
        </ProForm.Group>
      </ModalForm>

      {/* 编辑模板模态框 */}
      <ModalForm
        title="编辑法律模板"
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onFinish={handleUpdate}
        initialValues={currentRow}
        modalProps={{
          destroyOnClose: true,
          width: 800,
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="title"
            label="模板标题"
            placeholder="请输入模板标题"
            rules={[{ required: true, message: '请输入模板标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="模板分类"
            placeholder="请选择模板分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择模板分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="模板描述"
          placeholder="请输入模板描述"
          rules={[{ required: true, message: '请输入模板描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProFormTextArea
          name="content"
          label="模板内容"
          placeholder="请输入法律模板的详细内容"
          rules={[{ required: true, message: '请输入模板内容' }]}
          fieldProps={{ rows: 10 }}
        />
        <ProForm.Group>
          <ProFormText
            name="author"
            label="作者"
            placeholder="请输入作者姓名"
            rules={[{ required: true, message: '请输入作者姓名' }]}
            width="md"
          />
          <ProFormSelect
            name="status"
            label="发布状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择发布状态' }]}
            width="md"
          />
        </ProForm.Group>
      </ModalForm>

      {/* 模板预览模态框 */}
      <Modal
        title="法律模板预览"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            onClick={() => {
              message.success('下载功能待实现');
            }}
          >
            下载模板
          </Button>,
        ]}
        width={800}
      >
        {currentRow && (
          <div>
            <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{currentRow.title}</h3>
              <div style={{ fontSize: 14, color: '#666' }}>
                <span>分类：{categoryOptions.find(c => c.value === currentRow.category)?.label}</span>
                <span style={{ marginLeft: 24 }}>作者：{currentRow.author}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#666' }}>{currentRow.description}</p>
            </div>
            <div style={{ 
              maxHeight: 500, 
              overflow: 'auto', 
              border: '1px solid #d9d9d9', 
              borderRadius: 6,
              padding: 16,
              backgroundColor: '#fff'
            }}>
              <Paragraph>
                <pre style={{ 
                  fontFamily: 'inherit', 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word',
                  lineHeight: '1.6'
                }}>
                  {currentRow.content}
                </pre>
              </Paragraph>
            </div>
            <div style={{ marginTop: 16, textAlign: 'center', color: '#999', fontSize: 12 }}>
              使用次数：{currentRow.usageCount} | 下载次数：{currentRow.downloadCount}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 