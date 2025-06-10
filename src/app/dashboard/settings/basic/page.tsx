'use client';

import React, { useState, useEffect } from 'react';
import { SaveOutlined, SettingOutlined, BellOutlined, SecurityScanOutlined, GlobalOutlined } from '@ant-design/icons';
import { ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSwitch, ProFormSelect, ProCard } from '@ant-design/pro-components';
import { Button, message, Space, Divider, Card, Row, Col } from 'antd';

// 系统设置数据类型
interface SystemSettings {
  // 基本信息
  systemName: string;
  systemVersion: string;
  systemDescription: string;
  systemLogo?: string;
  
  // 通知设置
  emailNotification: boolean;
  smsNotification: boolean;
  systemNotification: boolean;
  
  // 安全设置
  passwordComplexity: 'low' | 'medium' | 'high';
  sessionTimeout: number; // 分钟
  maxLoginAttempts: number;
  
  // 业务设置
  consultationDuration: number; // 分钟
  withdrawalMinAmount: number;
  withdrawalMaxAmount: number;
  commissionRate: number; // 百分比
  
  // 其他设置
  maintenanceMode: boolean;
  debugMode: boolean;
  dataRetentionDays: number;
}

// 模拟当前系统设置
const mockSettings: SystemSettings = {
  systemName: '华光后端管理系统',
  systemVersion: '1.0.0',
  systemDescription: '为刑满释放人员提供法律咨询和心理援助的综合管理平台',
  
  emailNotification: true,
  smsNotification: true,
  systemNotification: true,
  
  passwordComplexity: 'medium',
  sessionTimeout: 120,
  maxLoginAttempts: 5,
  
  consultationDuration: 60,
  withdrawalMinAmount: 10,
  withdrawalMaxAmount: 50000,
  commissionRate: 15,
  
  maintenanceMode: false,
  debugMode: false,
  dataRetentionDays: 365,
};

export default function BasicSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);

  // 保存设置
  const handleSave = async (values: SystemSettings) => {
    try {
      setLoading(true);
      console.log('保存系统设置:', values);
      
      // 这里应该调用API保存设置
      // await SettingsApi.updateSystemSettings(values);
      
      setSettings(values);
      message.success('设置保存成功');
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProForm<SystemSettings>
        onFinish={handleSave}
        initialValues={settings}
        submitter={{
          render: (props, doms) => (
            <Row>
              <Col span={14} offset={5}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => props.form?.submit?.()}
                  size="large"
                >
                  保存设置
                </Button>
              </Col>
            </Row>
          ),
        }}
      >
        {/* 基本信息设置 */}
        <ProCard
          title={
            <Space>
              <SettingOutlined />
              基本信息设置
            </Space>
          }
          bordered
          style={{ marginBottom: 24 }}
        >
          <ProForm.Group>
            <ProFormText
              name="systemName"
              label="系统名称"
              placeholder="请输入系统名称"
              rules={[{ required: true, message: '请输入系统名称' }]}
              width="md"
            />
            <ProFormText
              name="systemVersion"
              label="系统版本"
              placeholder="请输入系统版本"
              rules={[{ required: true, message: '请输入系统版本' }]}
              width="md"
            />
          </ProForm.Group>
          <ProFormTextArea
            name="systemDescription"
            label="系统描述"
            placeholder="请输入系统描述"
            fieldProps={{ rows: 3 }}
          />
        </ProCard>

        {/* 通知设置 */}
        <ProCard
          title={
            <Space>
              <BellOutlined />
              通知设置
            </Space>
          }
          bordered
          style={{ marginBottom: 24 }}
        >
          <ProForm.Group>
            <ProFormSwitch
              name="emailNotification"
              label="邮件通知"
              tooltip="开启后将发送邮件通知"
            />
            <ProFormSwitch
              name="smsNotification"
              label="短信通知"
              tooltip="开启后将发送短信通知"
            />
            <ProFormSwitch
              name="systemNotification"
              label="系统通知"
              tooltip="开启后将显示系统内通知"
            />
          </ProForm.Group>
        </ProCard>

        {/* 安全设置 */}
        <ProCard
          title={
            <Space>
              <SecurityScanOutlined />
              安全设置
            </Space>
          }
          bordered
          style={{ marginBottom: 24 }}
        >
          <ProForm.Group>
            <ProFormSelect
              name="passwordComplexity"
              label="密码复杂度"
              placeholder="请选择密码复杂度"
              options={[
                { label: '低 (6位以上)', value: 'low' },
                { label: '中 (8位以上，包含字母和数字)', value: 'medium' },
                { label: '高 (8位以上，包含大小写字母、数字和特殊字符)', value: 'high' },
              ]}
              rules={[{ required: true, message: '请选择密码复杂度' }]}
              width="md"
            />
            <ProFormDigit
              name="sessionTimeout"
              label="会话超时"
              placeholder="分钟"
              rules={[{ required: true, message: '请输入会话超时时间' }]}
              fieldProps={{ min: 5, max: 480 }}
              width="sm"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDigit
              name="maxLoginAttempts"
              label="最大登录尝试次数"
              placeholder="次数"
              rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
              fieldProps={{ min: 3, max: 10 }}
              width="sm"
            />
          </ProForm.Group>
        </ProCard>

        {/* 业务设置 */}
        <ProCard
          title={
            <Space>
              <GlobalOutlined />
              业务设置
            </Space>
          }
          bordered
          style={{ marginBottom: 24 }}
        >
          <ProForm.Group>
            <ProFormDigit
              name="consultationDuration"
              label="咨询时长"
              placeholder="分钟"
              rules={[{ required: true, message: '请输入默认咨询时长' }]}
              fieldProps={{ min: 15, max: 180 }}
              width="sm"
            />
            <ProFormDigit
              name="commissionRate"
              label="平台佣金比例"
              placeholder="百分比"
              rules={[{ required: true, message: '请输入平台佣金比例' }]}
              fieldProps={{ min: 0, max: 50, precision: 1 }}
              width="sm"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDigit
              name="withdrawalMinAmount"
              label="最小提现金额"
              placeholder="元"
              rules={[{ required: true, message: '请输入最小提现金额' }]}
              fieldProps={{ min: 1, max: 1000, precision: 2 }}
              width="sm"
            />
            <ProFormDigit
              name="withdrawalMaxAmount"
              label="最大提现金额"
              placeholder="元"
              rules={[{ required: true, message: '请输入最大提现金额' }]}
              fieldProps={{ min: 100, max: 100000, precision: 2 }}
              width="sm"
            />
          </ProForm.Group>
        </ProCard>

        {/* 系统维护设置 */}
        <ProCard
          title={
            <Space>
              <SettingOutlined />
              系统维护
            </Space>
          }
          bordered
          style={{ marginBottom: 24 }}
        >
          <ProForm.Group>
            <ProFormSwitch
              name="maintenanceMode"
              label="维护模式"
              tooltip="开启后前端用户将无法访问系统"
            />
            <ProFormSwitch
              name="debugMode"
              label="调试模式"
              tooltip="开启后将显示详细的调试信息"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormDigit
              name="dataRetentionDays"
              label="数据保留天数"
              placeholder="天"
              rules={[{ required: true, message: '请输入数据保留天数' }]}
              fieldProps={{ min: 30, max: 3650 }}
              width="sm"
              tooltip="系统日志和操作记录的保留时间"
            />
          </ProForm.Group>
        </ProCard>
      </ProForm>

      {/* 系统信息显示 */}
      <Card
        title="系统信息"
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {settings.systemVersion}
                </div>
                <div style={{ color: '#666' }}>当前版本</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  运行中
                </div>
                <div style={{ color: '#666' }}>系统状态</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {settings.dataRetentionDays}天
                </div>
                <div style={{ color: '#666' }}>数据保留</div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
} 