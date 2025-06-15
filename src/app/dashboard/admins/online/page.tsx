'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Avatar, Space, Button, message, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  ClockCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AdministratorsApi } from '@/api';
import type { OnlineAdminInfo } from '@/api/types/content-review';

export default function OnlineAdministratorsPage() {
  const [loading, setLoading] = useState(false);
  const [onlineAdmins, setOnlineAdmins] = useState<OnlineAdminInfo[]>([]);

  // 获取在线管理员列表
  const fetchOnlineAdmins = async () => {
    try {
      setLoading(true);
      const response = await AdministratorsApi.getOnlineAdministrators();
      if (response.success) {
        setOnlineAdmins(response.data || []);
      } else {
        message.error('获取在线管理员列表失败');
      }
    } catch (error) {
      message.error('获取在线管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineAdmins();
    // 设置定时刷新，每30秒刷新一次
    const interval = setInterval(fetchOnlineAdmins, 30000);
    return () => clearInterval(interval);
  }, []);

  // 格式化在线时长
  const formatOnlineDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}小时${remainingMinutes > 0 ? remainingMinutes + '分钟' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days}天${remainingHours > 0 ? remainingHours + '小时' : ''}`;
    }
  };

  // 获取角色颜色
  const getRoleColor = (roleName: string) => {
    const colorMap: Record<string, string> = {
      '超级管理员': 'red',
      '系统管理员': 'orange',
      '内容审核员': 'blue',
      '客服管理员': 'green',
      '数据分析员': 'purple',
    };
    return colorMap[roleName] || 'default';
  };

  const columns = [
    {
      title: '管理员',
      dataIndex: 'realName',
      key: 'realName',
      render: (realName: string, record: OnlineAdminInfo) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{realName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName: string) => (
        <Tag color={getRoleColor(roleName)}>
          {roleName}
        </Tag>
      ),
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveTime',
      key: 'lastActiveTime',
      render: (time: string) => {
        const now = new Date();
        const lastActive = new Date(time);
        const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
        
        if (diffMinutes < 1) {
          return <Tag color="green">刚刚</Tag>;
        } else if (diffMinutes < 5) {
          return <Tag color="blue">{diffMinutes}分钟前</Tag>;
        } else if (diffMinutes < 30) {
          return <Tag color="orange">{diffMinutes}分钟前</Tag>;
        } else {
          return <Tag color="red">{diffMinutes}分钟前</Tag>;
        }
      },
    },
    {
      title: '在线时长',
      dataIndex: 'onlineDuration',
      key: 'onlineDuration',
      render: (duration: number) => formatOnlineDuration(duration),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string, record: OnlineAdminInfo) => (
        <div>
          <div>{ip}</div>
          {record.location && (
            <div style={{ fontSize: 12, color: '#666' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              {record.location}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '设备信息',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      render: (deviceInfo: string) => (
        <div style={{ fontSize: 12, color: '#666', maxWidth: 200 }}>
          {deviceInfo || '-'}
        </div>
      ),
    },
  ];

  // 统计数据
  const totalOnline = onlineAdmins.length;
  const roleStats = onlineAdmins.reduce((acc, admin) => {
    acc[admin.roleName] = (acc[admin.roleName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgOnlineTime = totalOnline > 0 
    ? Math.round(onlineAdmins.reduce((sum, admin) => sum + admin.onlineDuration, 0) / totalOnline)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          在线管理员
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          查看当前在线的管理员状态和活动信息
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线管理员"
              value={totalOnline}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均在线时长"
              value={formatOnlineDuration(avgOnlineTime)}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="角色分布"
              value={Object.keys(roleStats).length}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix="种角色"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={fetchOnlineAdmins}
                loading={loading}
              >
                刷新数据
              </Button>
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                自动刷新: 30秒
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 角色分布 */}
      {Object.keys(roleStats).length > 0 && (
        <Card title="角色分布" style={{ marginBottom: 24 }}>
          <Space wrap>
            {Object.entries(roleStats).map(([role, count]) => (
              <Tag key={role} color={getRoleColor(role)} style={{ margin: '4px' }}>
                {role}: {count}人
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* 在线管理员列表 */}
      <Card 
        title="在线管理员列表"
        extra={
          <Space>
            <span style={{ fontSize: 12, color: '#666' }}>
              最后更新: {new Date().toLocaleTimeString()}
            </span>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchOnlineAdmins}
              loading={loading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={onlineAdmins}
          rowKey="adminId"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 位在线管理员`,
          }}
          locale={{ emptyText: '暂无在线管理员' }}
        />
      </Card>
    </div>
  );
} 