'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Image, Modal } from 'antd';
import { ContentApi } from '@/api/admin/content';
import type { CourseResponse, CourseListQuery, CourseCreateRequest } from '@/api/types/content';
import { ContentStatus } from '@/api/types/content';

// 课程数据类型 (映射API数据)
interface CourseItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  category: string;
  difficulty: string;
  duration: number;
  instructor: string;
  studentCount: number;
  rating: number;
  status: 'draft' | 'published' | 'offline';
  createTime: string;
  updateTime: string;
  price?: number;
  originalPrice?: number;
}

// API数据映射函数
const mapCourseResponseToItem = (course: CourseResponse): CourseItem => ({
  id: course.id.toString(),
  title: course.title,
  description: course.description,
  coverUrl: course.coverImage || 'https://via.placeholder.com/300x200',
  category: course.category,
  difficulty: course.difficulty,
  duration: course.duration,
  instructor: course.instructorInfo?.name || '未知讲师',
  studentCount: course.viewCount, // 使用观看次数作为学员数
  rating: course.rating,
  status: course.status === ContentStatus.PUBLISHED ? 'published' : course.status === ContentStatus.DRAFT ? 'draft' : 'offline',
  createTime: course.createdAt,
  updateTime: course.updatedAt,
});

// 课程分类选项
const categoryOptions = [
  { label: '法律基础', value: 'legal_basic' },
  { label: '心理健康', value: 'psychology' },
  { label: '创业指导', value: 'entrepreneurship' },
  { label: '职业发展', value: 'career_development' },
  { label: '技能培训', value: 'skill_training' },
];

// 难度选项
const difficultyOptions = [
  { label: '初级', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
];

// 状态选项
const statusOptions = [
  { label: '草稿', value: ContentStatus.DRAFT },
  { label: '已发布', value: ContentStatus.PUBLISHED },
  { label: '已归档', value: ContentStatus.ARCHIVED },
];

export default function CoursesPage() {
  const actionRef = useRef<ActionType>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<CourseItem>();

  // 表格列定义
  const columns: ProColumns<CourseItem>[] = [
    {
      title: '课程封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 100,
      search: false,
      render: (_, record) => (
        <Image
          width={60}
          height={40}
          src={record.coverUrl}
          alt={record.title}
          style={{ borderRadius: 4 }}
        />
      ),
    },
    {
      title: '课程标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      valueEnum: {
        legal_basic: { text: '法律基础' },
        psychology: { text: '心理健康' },
        entrepreneurship: { text: '创业指导' },
        career_development: { text: '职业发展' },
        skill_training: { text: '技能培训' },
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (_, record) => {
        const difficultyMap: Record<string, { color: string; text: string }> = {
          beginner: { color: 'green', text: '初级' },
          intermediate: { color: 'blue', text: '中级' },
          advanced: { color: 'red', text: '高级' },
        };
        const difficulty = difficultyMap[record.difficulty] || { color: 'default', text: record.difficulty };
        return <Tag color={difficulty.color}>{difficulty.text}</Tag>;
      },
      valueEnum: {
        beginner: { text: '初级' },
        intermediate: { text: '中级' },
        advanced: { text: '高级' },
      },
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      search: false,
      render: (text) => `${text}分钟`,
    },
    {
      title: '观看数',
      dataIndex: 'studentCount',
      key: 'viewCount',
      width: 80,
      search: false,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor',
      width: 100,
    },

    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      search: false,
      render: (text) => <span style={{ color: '#faad14' }}>★ {text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'green', text: '已发布' },
          offline: { color: 'red', text: '已下线' },
        };
        const status = statusMap[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
        offline: { text: '已下线', status: 'Error' },
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
            description="确定要删除这个课程吗？"
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
  const fetchCourses = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      const query: CourseListQuery = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        category: params.category,
        status: params.status,
      };
      console.log('查询参数',query);
      const response = await ContentApi.getCourseList(query);
      console.log('响应',response);
      const data = response.data.records.map(mapCourseResponseToItem);
      console.log('数据',response.data);
      return {
        data,
        success: true,
        total: response.data.total,
      };
    } catch (error) {
      console.error('获取课程列表失败:', error);
      message.error('获取课程列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建课程
  const handleCreate = async (values: any) => {
    try {
      console.log('创建课程:', values);
      
      const createData: CourseCreateRequest = {
        title: values.title,
        description: values.description,
        content: values.content || values.description,
        category: values.category,
        difficulty: values.difficulty,
        duration: values.duration,
        coverImage: values.coverImage,
        instructorId: 1, // 暂时使用固定值
        tags: [],
      };
      
      await ContentApi.createCourse(createData);
      message.success('创建成功');
      setCreateModalOpen(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('创建课程失败:', error);
      message.error('创建课程失败');
      return false;
    }
  };

  // 更新课程
  const handleUpdate = async (values: any) => {
    try {
      console.log('更新课程:', values);
      
      if (!currentRow) {
        message.error('缺少课程信息');
        return false;
      }
      
      const updateData = {
        title: values.title,
        description: values.description,
        content: values.content || values.description,
        category: values.category,
        difficulty: values.difficulty,
        duration: values.duration,
        coverImage: values.coverImage,
        tags: [],
      };
      
      await ContentApi.updateCourse(parseInt(currentRow.id), updateData);
      message.success('更新成功');
      setEditModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('更新课程失败:', error);
      message.error('更新课程失败');
      return false;
    }
  };

  // 删除课程
  const handleDelete = async (id: string) => {
    try {
      console.log('删除课程:', id);
      await ContentApi.deleteCourse(parseInt(id));
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除课程失败:', error);
      message.error('删除课程失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<CourseItem>
        headerTitle="课程管理"
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
            新建课程
          </Button>,
        ]}
        request={fetchCourses}
        columns={columns}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 创建课程模态框 */}
      <ModalForm
        title="新建课程"
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
            label="课程标题"
            placeholder="请输入课程标题"
            rules={[{ required: true, message: '请输入课程标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="课程分类"
            placeholder="请选择课程分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择课程分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="课程描述"
          placeholder="请输入课程描述"
          rules={[{ required: true, message: '请输入课程描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProForm.Group>
          <ProFormSelect
            name="difficulty"
            label="难度等级"
            placeholder="请选择难度等级"
            options={difficultyOptions}
            rules={[{ required: true, message: '请选择难度等级' }]}
            width="sm"
          />
          <ProFormText
            name="duration"
            label="课程时长"
            placeholder="分钟"
            rules={[{ required: true, message: '请输入课程时长' }]}
            width="sm"
          />
          <ProFormText
            name="instructor"
            label="讲师姓名"
            placeholder="请输入讲师姓名"
            rules={[{ required: true, message: '请输入讲师姓名' }]}
            width="sm"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="price"
            label="现价"
            placeholder="元"
            rules={[{ required: true, message: '请输入课程价格' }]}
            width="sm"
          />
          <ProFormText
            name="originalPrice"
            label="原价"
            placeholder="元"
            width="sm"
          />
          <ProFormSelect
            name="status"
            label="发布状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择发布状态' }]}
            width="sm"
            initialValue="draft"
          />
        </ProForm.Group>
        <ProFormText
          name="coverImage"
          label="课程封面URL"
          placeholder="请输入课程封面图片链接"
          extra="支持jpg、png格式，建议尺寸300x200"
        />
      </ModalForm>

      {/* 编辑课程模态框 */}
      <ModalForm
        title="编辑课程"
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
            label="课程标题"
            placeholder="请输入课程标题"
            rules={[{ required: true, message: '请输入课程标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="课程分类"
            placeholder="请选择课程分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择课程分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="课程描述"
          placeholder="请输入课程描述"
          rules={[{ required: true, message: '请输入课程描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProForm.Group>
          <ProFormSelect
            name="difficulty"
            label="难度等级"
            placeholder="请选择难度等级"
            options={difficultyOptions}
            rules={[{ required: true, message: '请选择难度等级' }]}
            width="sm"
          />
          <ProFormText
            name="duration"
            label="课程时长"
            placeholder="分钟"
            rules={[{ required: true, message: '请输入课程时长' }]}
            width="sm"
          />
          <ProFormText
            name="instructor"
            label="讲师姓名"
            placeholder="请输入讲师姓名"
            rules={[{ required: true, message: '请输入讲师姓名' }]}
            width="sm"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="price"
            label="现价"
            placeholder="元"
            rules={[{ required: true, message: '请输入课程价格' }]}
            width="sm"
          />
          <ProFormText
            name="originalPrice"
            label="原价"
            placeholder="元"
            width="sm"
          />
          <ProFormSelect
            name="status"
            label="发布状态"
            placeholder="请选择状态"
            options={statusOptions}
            rules={[{ required: true, message: '请选择发布状态' }]}
            width="sm"
          />
        </ProForm.Group>
        <ProFormText
          name="coverImage"
          label="课程封面URL"
          placeholder="请输入课程封面图片链接"
          extra="支持jpg、png格式，建议尺寸300x200"
        />
      </ModalForm>

      {/* 课程预览模态框 */}
      <Modal
        title="课程预览"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={600}
      >
        {currentRow && (
          <div>
            <Image
              width="100%"
              height={200}
              src={currentRow.coverUrl}
              alt={currentRow.title}
              style={{ marginBottom: 16 }}
            />
            <h3>{currentRow.title}</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>{currentRow.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>分类：{categoryOptions.find(c => c.value === currentRow.category)?.label}</span>
              <span>难度：{difficultyOptions.find(d => d.value === currentRow.difficulty)?.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>讲师：{currentRow.instructor}</span>
              <span>时长：{currentRow.duration}分钟</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>价格：¥{currentRow.price || '免费'}</span>
              <span>学员数：{currentRow.studentCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>评分：★ {currentRow.rating}</span>
              <span>状态：{statusOptions.find(s => s.value === currentRow.status)?.label}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 