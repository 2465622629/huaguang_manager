'use client';

import React, { useRef, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExperimentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDigit } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag, Modal, Typography, Statistic, Row, Col, List, Card } from 'antd';
import { ContentApi } from '@/api/admin/content';
import type { PsychTestResponse } from '@/api/types/content';
import { ContentStatus } from '@/api/types/content';

const { Paragraph, Text } = Typography;

// 心理测试数据类型 (映射API数据)
interface PsychTestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  questionCount: number;
  duration: number; // 测试时长，分钟
  completionCount: number;
  averageScore: number;
  status: 'draft' | 'published' | 'archived';
  createTime: string;
  updateTime: string;
  author: string;
}

// API数据映射函数
const mapPsychTestResponseToItem = (test: PsychTestResponse): PsychTestItem => ({
  id: test.id.toString(),
  title: test.title,
  category: test.category,
  description: test.description,
  difficulty: 'intermediate', // API暂未提供，使用默认值
  questionCount: test.questionCount,
  duration: test.duration,
  completionCount: test.completionCount,
  averageScore: test.averageScore,
  status: test.status === ContentStatus.PUBLISHED ? 'published' : test.status === ContentStatus.DRAFT ? 'draft' : 'archived',
  createTime: test.createdAt,
  updateTime: test.updatedAt,
  author: '系统管理员', // API暂未提供作者信息
});

// 测试分类选项
const categoryOptions = [
  { label: '职业倦怠', value: 'career_burnout' },
  { label: '焦虑评估', value: 'anxiety_assessment' },
  { label: '抑郁筛查', value: 'depression_screening' },
  { label: '压力测试', value: 'stress_test' },
  { label: '人格测试', value: 'personality_test' },
  { label: '情绪管理', value: 'emotion_management' },
];

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'intermediate' },
  { label: '困难', value: 'hard' },
];

// 状态选项
const statusOptions = [
  { label: '草稿', value: ContentStatus.DRAFT },
  { label: '已发布', value: ContentStatus.PUBLISHED },
  { label: '已归档', value: ContentStatus.ARCHIVED },
];

// 测试题目类型
interface TestQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale'; // 单选、多选、量表
  options: { label: string; value: string; score: number }[];
  required: boolean;
}

// 模拟题目数据
const mockQuestions: TestQuestion[] = [
  {
    id: '1',
    question: '您是否经常感到工作压力很大？',
    type: 'scale',
    options: [
      { label: '从不', value: '1', score: 1 },
      { label: '很少', value: '2', score: 2 },
      { label: '有时', value: '3', score: 3 },
      { label: '经常', value: '4', score: 4 },
      { label: '总是', value: '5', score: 5 },
    ],
    required: true,
  },
  {
    id: '2',
    question: '以下哪些症状您最近有过？（可多选）',
    type: 'multiple',
    options: [
      { label: '失眠', value: 'insomnia', score: 2 },
      { label: '头痛', value: 'headache', score: 1 },
      { label: '食欲不振', value: 'appetite_loss', score: 2 },
      { label: '疲劳', value: 'fatigue', score: 1 },
    ],
    required: false,
  },
];

export default function PsychTestsPage() {
  const actionRef = useRef<ActionType>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<PsychTestItem>();

  // 表格列定义
  const columns: ProColumns<PsychTestItem>[] = [
    {
      title: '测试标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <ExperimentOutlined style={{ color: '#722ed1' }} />
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
        work_burnout: { text: '职业倦怠' },
        anxiety: { text: '焦虑评估' },
        depression: { text: '抑郁筛查' },
        stress: { text: '压力测试' },
        personality: { text: '性格分析' },
        emotion: { text: '情绪管理' },
      },
    },
    {
      title: '题目数',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 80,
      search: false,
      render: (text) => <Tag color="blue">{text}题</Tag>,
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
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (_, record) => {
        const difficultyMap: Record<string, { color: string; text: string }> = {
          easy: { color: 'green', text: '简单' },
          intermediate: { color: 'orange', text: '中等' },
          hard: { color: 'red', text: '困难' },
        };
        const difficulty = difficultyMap[record.difficulty] || { color: 'default', text: '未知' };
        return <Tag color={difficulty.color}>{difficulty.text}</Tag>;
      },
      valueEnum: {
        easy: { text: '简单' },
        intermediate: { text: '中等' },
        hard: { text: '困难' },
      },
    },
    {
      title: '完成人数',
      dataIndex: 'completionCount',
      key: 'completionCount',
      width: 100,
      search: false,
      render: (text) => <Tag color="green">{text}</Tag>,
      sorter: true,
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      width: 90,
      search: false,
      render: (text) => <span style={{ color: '#fa8c16' }}>{typeof text === 'number' ? text.toFixed(1) : '0.0'}</span>,
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
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'green', text: '已发布' },
          archived: { color: 'red', text: '已归档' },
        };
        const status = statusMap[record.status] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
              valueEnum: {
          draft: { text: '草稿', status: 'Default' },
          published: { text: '已发布', status: 'Success' },
          archived: { text: '已归档', status: 'Error' },
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<QuestionCircleOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setQuestionsModalOpen(true);
            }}
          >
            题目
          </Button>
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
            description="确定要删除这个心理测试吗？"
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
  const fetchTests = async (params: any) => {
    try {
      console.log('查询参数:', params);
      
      const query = {
        page: params.current || 1,
        size: params.pageSize || 10,
        keyword: params.keyword,
        category: params.category,
        status: params.status,
      };
      
      const response = await ContentApi.getPsychTestList(query);
      const data = response.data.content.map(mapPsychTestResponseToItem);
      
      return {
        data,
        success: true,
        total: response.data.totalElements,
      };
    } catch (error) {
      console.error('获取心理测试列表失败:', error);
      message.error('获取心理测试列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建测试
  const handleCreate = async (values: any) => {
    try {
      console.log('创建测试:', values);
      
      const createData = {
        title: values.title,
        description: values.description,
        category: values.category,
        duration: values.duration,
        questions: [], // 题目初始为空，后续通过题目管理添加
        tags: [],
      };
      
      await ContentApi.createPsychTest(createData);
      message.success('创建成功');
      setCreateModalOpen(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('创建心理测试失败:', error);
      message.error('创建心理测试失败');
      return false;
    }
  };

  // 更新测试
  const handleUpdate = async (values: any) => {
    try {
      console.log('更新测试:', values);
      
      if (!currentRow) {
        message.error('缺少测试信息');
        return false;
      }
      
      const updateData = {
        title: values.title,
        description: values.description,
        category: values.category,
        duration: values.duration,
        tags: [],
      };
      
      await ContentApi.updatePsychTest(parseInt(currentRow.id), updateData);
      message.success('更新成功');
      setEditModalOpen(false);
      setCurrentRow(undefined);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('更新心理测试失败:', error);
      message.error('更新心理测试失败');
      return false;
    }
  };

  // 删除测试
  const handleDelete = async (id: string) => {
    try {
      console.log('删除测试:', id);
      await ContentApi.deletePsychTest(parseInt(id));
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除心理测试失败:', error);
      message.error('删除心理测试失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<PsychTestItem>
        headerTitle="心理测试管理"
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
            新建测试
          </Button>,
        ]}
        request={fetchTests}
        columns={columns}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />

      {/* 创建测试模态框 */}
      <ModalForm
        title="新建心理测试"
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
            label="测试标题"
            placeholder="请输入测试标题"
            rules={[{ required: true, message: '请输入测试标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="测试分类"
            placeholder="请选择测试分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择测试分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="测试描述"
          placeholder="请输入测试描述"
          rules={[{ required: true, message: '请输入测试描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProForm.Group>
          <ProFormDigit
            name="questionCount"
            label="题目数量"
            placeholder="题目数量"
            rules={[{ required: true, message: '请输入题目数量' }]}
            width="sm"
            min={1}
          />
          <ProFormDigit
            name="duration"
            label="测试时长"
            placeholder="分钟"
            rules={[{ required: true, message: '请输入测试时长' }]}
            width="sm"
            min={1}
          />
          <ProFormSelect
            name="difficulty"
            label="难度等级"
            placeholder="请选择难度"
            options={difficultyOptions}
            rules={[{ required: true, message: '请选择难度等级' }]}
            width="sm"
          />
        </ProForm.Group>
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

      {/* 编辑测试模态框 */}
      <ModalForm
        title="编辑心理测试"
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
            label="测试标题"
            placeholder="请输入测试标题"
            rules={[{ required: true, message: '请输入测试标题' }]}
            width="md"
          />
          <ProFormSelect
            name="category"
            label="测试分类"
            placeholder="请选择测试分类"
            options={categoryOptions}
            rules={[{ required: true, message: '请选择测试分类' }]}
            width="md"
          />
        </ProForm.Group>
        <ProFormTextArea
          name="description"
          label="测试描述"
          placeholder="请输入测试描述"
          rules={[{ required: true, message: '请输入测试描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProForm.Group>
          <ProFormDigit
            name="questionCount"
            label="题目数量"
            placeholder="题目数量"
            rules={[{ required: true, message: '请输入题目数量' }]}
            width="sm"
            min={1}
          />
          <ProFormDigit
            name="duration"
            label="测试时长"
            placeholder="分钟"
            rules={[{ required: true, message: '请输入测试时长' }]}
            width="sm"
            min={1}
          />
          <ProFormSelect
            name="difficulty"
            label="难度等级"
            placeholder="请选择难度"
            options={difficultyOptions}
            rules={[{ required: true, message: '请选择难度等级' }]}
            width="sm"
          />
        </ProForm.Group>
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

      {/* 测试预览模态框 */}
      <Modal
        title="心理测试预览"
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={600}
      >
        {currentRow && (
          <div>
            <Card title={currentRow.title} size="small">
              <p style={{ color: '#666', marginBottom: 16 }}>{currentRow.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>分类：{categoryOptions.find(c => c.value === currentRow.category)?.label}</span>
                <span>难度：{difficultyOptions.find(d => d.value === currentRow.difficulty)?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>题目数：{currentRow.questionCount}</span>
                <span>时长：{currentRow.duration}分钟</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>完成人数：{currentRow.completionCount}</span>
                <span>平均分：{currentRow.averageScore}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>作者：{currentRow.author}</span>
                <span>状态：{statusOptions.find(s => s.value === currentRow.status)?.label}</span>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* 题目管理模态框 */}
      <Modal
        title={`题目管理 - ${currentRow?.title}`}
        open={questionsModalOpen}
        onCancel={() => setQuestionsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setQuestionsModalOpen(false)}>
            关闭
          </Button>,
          <Button 
            key="add" 
            type="primary" 
            onClick={() => {
              message.success('添加题目功能待实现');
            }}
          >
            添加题目
          </Button>,
        ]}
        width={800}
      >
        <List
          dataSource={mockQuestions}
          renderItem={(item: TestQuestion, index: number) => (
            <List.Item
              actions={[
                <Button key="edit" type="link">编辑</Button>,
                <Button key="delete" type="link" danger>删除</Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text>第{index + 1}题</Text>
                    <Tag color={item.type === 'single' ? 'blue' : item.type === 'multiple' ? 'green' : 'orange'}>
                      {item.type === 'single' ? '单选' : item.type === 'multiple' ? '多选' : '量表'}
                    </Tag>
                    {item.required && <Tag color="red">必答</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <p style={{ marginBottom: 8 }}>{item.question}</p>
                    <div>
                      {item.options.map((option: { label: string; value: string; score: number }, idx: number) => (
                        <Tag key={idx} style={{ marginBottom: 4 }}>
                          {option.label} (分值: {option.score})
                        </Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}