'use client';

import React, { useState } from 'react';
import { ProTable, type ProColumns, type ActionType } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import PermissionWrapper from '@/components/PermissionWrapper';

interface ListPageTemplateProps<T> {
  /** 页面标题 */
  title?: string;
  /** 表格列配置 */
  columns: ProColumns<T>[];
  /** 数据请求函数 */
  request: (params: any) => Promise<{
    data: T[];
    success: boolean;
    total?: number;
  }>;
  /** 行数据的key字段 */
  rowKey: string | ((record: T) => string);
  /** 是否显示创建按钮 */
  showCreateButton?: boolean;
  /** 创建按钮文本 */
  createButtonText?: string;
  /** 创建按钮点击事件 */
  onCreateClick?: () => void;
  /** 创建按钮所需权限 */
  createPermissions?: string[];
  /** 是否支持批量删除 */
  showBatchDelete?: boolean;
  /** 批量删除函数 */
  onBatchDelete?: (selectedKeys: React.Key[]) => Promise<void>;
  /** 批量删除所需权限 */
  batchDeletePermissions?: string[];
  /** 是否显示导出按钮 */
  showExportButton?: boolean;
  /** 导出函数 */
  onExport?: () => Promise<void>;
  /** 导出按钮所需权限 */
  exportPermissions?: string[];
  /** 额外的工具栏按钮 */
  extraActions?: React.ReactNode[];
  /** 表格自定义配置 */
  tableProps?: Record<string, any>;
  /** 搜索表单配置 */
  searchConfig?: {
    labelWidth?: number | 'auto';
    span?: number;
    collapsed?: boolean;
  };
}

/**
 * 通用列表页面模板
 * 提供标准的CRUD列表页面功能
 */
function ListPageTemplate<T extends Record<string, any>>({
  title,
  columns,
  request,
  rowKey,
  showCreateButton = true,
  createButtonText = '新建',
  onCreateClick,
  createPermissions,
  showBatchDelete = false,
  onBatchDelete,
  batchDeletePermissions,
  showExportButton = false,
  onExport,
  exportPermissions,
  extraActions = [],
  tableProps = {},
  searchConfig = {},
}: ListPageTemplateProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [actionRef, setActionRef] = useState<ActionType>();

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据');
      return;
    }
    
    try {
      await onBatchDelete?.(selectedRowKeys);
      message.success('删除成功');
      setSelectedRowKeys([]);
      actionRef?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理导出
  const handleExport = async () => {
    try {
      await onExport?.();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 构建工具栏按钮
  const toolBarRender = () => {
    const actions: React.ReactNode[] = [];

    // 创建按钮
    if (showCreateButton) {
      actions.push(
        <PermissionWrapper
          key="create"
          permissions={createPermissions}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
          >
            {createButtonText}
          </Button>
        </PermissionWrapper>
      );
    }

    // 批量删除按钮
    if (showBatchDelete && onBatchDelete) {
      actions.push(
        <PermissionWrapper
          key="batchDelete"
          permissions={batchDeletePermissions}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
        </PermissionWrapper>
      );
    }

    // 导出按钮
    if (showExportButton && onExport) {
      actions.push(
        <PermissionWrapper
          key="export"
          permissions={exportPermissions}
        >
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>
        </PermissionWrapper>
      );
    }

    // 额外的按钮
    actions.push(...extraActions);

    return actions;
  };

  // 行选择配置
  const rowSelection = showBatchDelete ? {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    preserveSelectedRowKeys: true,
  } : undefined;

  return (
    <ProTable<T>
      headerTitle={title}
      actionRef={setActionRef}
      columns={columns}
      request={request}
      rowKey={rowKey}
      rowSelection={rowSelection}
      search={{
        labelWidth: 'auto',
        collapsed: false,
        ...searchConfig,
      }}
      toolBarRender={toolBarRender}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
      }}
      scroll={{ x: 'max-content' }}
      dateFormatter="string"
      {...tableProps}
    />
  );
}

export default ListPageTemplate; 