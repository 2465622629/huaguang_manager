'use client';

import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { message, theme } from 'antd';
import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { AdminAuthApi, AuthUtils } from '@/api/admin/auth';
import type { AdminLoginRequest } from '@/api/types/auth';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { token } = theme.useToken();
  const router = useRouter();

  // 检查是否自动登录
  useEffect(() => {
    const checkAutoLogin = async () => {
      // 使用新的AuthUtils检查登录状态
      if (AuthUtils.isLoggedIn()) {
        const autoLogin = localStorage.getItem('autoLogin') === 'true';
        
        if (autoLogin) {
          // token 有效，直接跳转到首页
          router.push('/dashboard');
        }
      }
    };

    checkAutoLogin();
  }, [router]);

  const handleSubmit = async (values: any) => {
    try {
      // 构造登录请求参数
      const loginRequest: AdminLoginRequest = {
        username: values.username,
        password: values.password,
        rememberMe: values.autoLogin || false
      };

      // 使用新的AdminAuthApi进行登录
      const response = await AdminAuthApi.login(loginRequest);
      console.log(response);
      if (response.code === 200) {
        message.success('登录成功');
        
        // 使用AuthUtils保存登录信息
        AuthUtils.saveLoginInfo(response.data);
        
        // 如果选择了自动登录，保存设置
        if (values.autoLogin) {
          localStorage.setItem('autoLogin', 'true');
        } else {
          localStorage.removeItem('autoLogin');
        }
        
        // 跳转到首页
        router.push('/dashboard');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
      console.error('登录错误:', error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        logo="https://github.githubassets.com/favicons/favicon.png"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="华光管理系统"
        containerStyle={{
          backgroundColor: 'rgba(0, 0, 0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle="企业级管理系统"
        onFinish={handleSubmit}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: (
              <UserOutlined
                style={{
                  color: token.colorText,
                }}
                className={'prefixIcon'}
              />
            ),
          }}
          placeholder={'用户名/手机号/邮箱'}
          rules={[
            {
              required: true,
              message: '请输入用户名/手机号/邮箱!',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: (
              <LockOutlined
                style={{
                  color: token.colorText,
                }}
                className={'prefixIcon'}
              />
            ),
          }}
          placeholder={'密码'}
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        />
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};
