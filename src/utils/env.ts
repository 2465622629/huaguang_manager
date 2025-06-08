/**
 * 环境配置管理工具
 * 提供类型安全的环境变量访问和环境检测功能
 */

// 环境类型定义
export type Environment = 'development' | 'staging' | 'production';

// 配置接口定义
export interface AppConfig {
  // 应用基础信息
  appName: string;
  version: string;
  environment: Environment;
  
  // API配置
  apiUrl: string;
  
  // 服务端配置（仅服务端可访问）
  database?: {
    url: string;
  };
  auth?: {
    jwtSecret: string;
  };
  redis?: {
    url: string;
  };
}

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): Environment {
  // 优先使用 NEXT_PUBLIC_APP_ENV
  if (process.env.NEXT_PUBLIC_APP_ENV) {
    return process.env.NEXT_PUBLIC_APP_ENV as Environment;
  }
  
  // 其次检查 VERCEL_ENV
  if (process.env.VERCEL_ENV) {
    switch (process.env.VERCEL_ENV) {
      case 'production':
        return 'production';
      case 'preview':
        return 'staging';
      case 'development':
        return 'development';
    }
  }
  
  // 最后根据 NODE_ENV 判断
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'production';
    case 'development':
    case 'test':
    default:
      return 'development';
  }
}

/**
 * 验证必需的环境变量是否存在
 */
function validateClientConfig(): void {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_VERSION'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missingVars.join(', '));
    console.error('请检查 .env 文件配置');
  }
}

/**
 * 验证服务端环境变量（仅在服务端运行）
 */
function validateServerConfig(): void {
  if (typeof window !== 'undefined') {
    return; // 客户端跳过服务端配置验证
  }
  
  const environment = detectEnvironment();
  
  if (environment === 'production') {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️ 生产环境缺少服务端环境变量:', missingVars.join(', '));
    }
  }
}

/**
 * 获取应用配置
 */
export function getAppConfig(): AppConfig {
  // 验证环境变量
  validateClientConfig();
  validateServerConfig();
  
  const environment = detectEnvironment();
  
  const config: AppConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME || '华光管理系统',
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
    environment,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  };
  
  // 服务端配置（仅在服务端添加）
  if (typeof window === 'undefined') {
    if (process.env.DATABASE_URL) {
      config.database = {
        url: process.env.DATABASE_URL
      };
    }
    
    if (process.env.JWT_SECRET) {
      config.auth = {
        jwtSecret: process.env.JWT_SECRET
      };
    }
    
    if (process.env.REDIS_URL) {
      config.redis = {
        url: process.env.REDIS_URL
      };
    }
  }
  
  return config;
}

/**
 * 获取API基础URL
 */
export function getApiUrl(): string {
  const config = getAppConfig();
  return config.apiUrl;
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return detectEnvironment() === 'development';
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return detectEnvironment() === 'production';
}

/**
 * 检查是否为预发布环境
 */
export function isStaging(): boolean {
  return detectEnvironment() === 'staging';
}

/**
 * 打印当前环境配置信息（仅开发环境）
 */
export function printEnvInfo(): void {
  if (!isDevelopment()) {
    return;
  }
  
  const config = getAppConfig();
  
  console.log('🌍 环境配置信息:');
  console.log(`📱 应用名称: ${config.appName}`);
  console.log(`🏷️ 版本: ${config.version}`);
  console.log(`🔧 环境: ${config.environment}`);
  console.log(`🌐 API地址: ${config.apiUrl}`);
  
  if (typeof window === 'undefined') {
    console.log('🔒 服务端配置:');
    console.log(`💾 数据库: ${config.database ? '已配置' : '未配置'}`);
    console.log(`🔑 认证: ${config.auth ? '已配置' : '未配置'}`);
    console.log(`📦 Redis: ${config.redis ? '已配置' : '未配置'}`);
  }
} 