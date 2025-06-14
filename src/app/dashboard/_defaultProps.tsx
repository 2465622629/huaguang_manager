import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ShoppingOutlined,
  AuditOutlined,
  AppstoreOutlined,
  SettingOutlined,
  BarChartOutlined,
  CrownFilled,
  TabletFilled,
} from '@ant-design/icons';

export default {
  route: {
    path: '/',
    routes: [
      // 保留原有菜单项以保证兼容性
      // {
      //   path: '/dashboard/career-aid',
      //   name: '就业援助',
      //   icon: <CrownFilled />,
      //   component: './dashboard/career-aid',
      // },
      // {
      //   path: '/dashboard/help-fund',
      //   name: '帮扶资金',
      //   icon: <TabletFilled />,
      //   component: './dashboard/help-fund',
      // },
      {
        path: '/dashboard/users',
        name: '用户管理',
        icon: <UserOutlined />,
        routes: [
          {
            path: '/dashboard/users/list',
            name: '用户列表',
            component: './dashboard/users/list',
          },
          {
            path: '/dashboard/users/lawyers',
            name: '律师管理',
            component: './dashboard/users/lawyers',
          },
          {
            path: '/dashboard/users/psychologists',
            name: '心理师管理',
            component: './dashboard/users/psychologists',
          },
          {
            path: '/dashboard/users/enterprises',
            name: '企业用户',
            component: './dashboard/users/enterprises',
          },
        ],
      },
      {
        path: '/dashboard/admins',
        name: '管理员管理',
        icon: <TeamOutlined />,
        routes: [
          {
            path: '/dashboard/admins/list',
            name: '管理员列表',
            component: './dashboard/admins/list',
          },
          {
            path: '/dashboard/admins/roles',
            name: '角色权限',
            component: './dashboard/admins/roles',
          },
          {
            path: '/dashboard/admins/online',
            name: '在线管理员',
            component: './dashboard/admins/online',
          },
        ],
      },
      {
        path: '/dashboard/content-review',
        name: '内容审核',
        icon: <AuditOutlined />,
        routes: [
          {
            path: '/dashboard/content-review',
            name: '审核概览',
            component: './dashboard/content-review',
          },
          {
            path: '/dashboard/content-review/assistance',
            name: '帮扶申请审核',
            component: './dashboard/content-review/assistance',
          },
          {
            path: '/dashboard/content-review/credit-repair',
            name: '信用修复审核',
            component: './dashboard/content-review/credit-repair',
          },
          {
            path: '/dashboard/content-review/legal-documents',
            name: '法律文书历史',
            component: './dashboard/content-review/legal-documents',
          },
        ],
      },
      // {
      //   path: '/dashboard/content',
      //   name: '内容管理',
      //   icon: <BookOutlined />,
      //   routes: [
      //     {
      //       path: '/dashboard/content/courses',
      //       name: '课程管理',
      //       component: './dashboard/content/courses',
      //     },
      //     {
      //       path: '/dashboard/content/legal-templates',
      //       name: '法律模板',
      //       component: './dashboard/content/legal-templates',
      //     },
      //     {
      //       path: '/dashboard/content/psych-tests',
      //       name: '心理测试',
      //       component: './dashboard/content/psych-tests',
      //     },
      //   ],
      // },
      {
        path: '/dashboard/orders',
        name: '订单管理',
        icon: <ShoppingOutlined />,
        routes: [
          {
            path: '/dashboard/orders/consultation',
            name: '咨询订单',
            component: './dashboard/orders/consultation',
          },
          {
            path: '/dashboard/orders/withdrawal',
            name: '提现申请',
            component: './dashboard/orders/withdrawal',
          },
          {
            path: '/dashboard/orders/commission',
            name: '佣金记录',
            component: './dashboard/orders/commission',
          },
        ],
      },
      {
        path: '/dashboard/settings',
        name: '系统设置',
        icon: <SettingOutlined />,
        routes: [
          {
            path: '/dashboard/settings/basic',
            name: '基础设置',
            component: './dashboard/settings/basic',
          },
        ],
      },
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [],
};