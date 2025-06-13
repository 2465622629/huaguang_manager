import { BasePageQuery, OrderStatus, ConsultantType, ServiceType } from './common';

// 订单查询参数
export interface OrderListQuery extends BasePageQuery {
  status?: OrderStatus;
  consultantType?: ConsultantType;
  serviceType?: ServiceType;
  clientId?: number;
  consultantId?: number;
  minAmount?: number;
  maxAmount?: number;
}

// 咨询订单响应数据
export interface ConsultationOrderResponse {
  id: number;
  orderNo: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  consultantId: number;
  consultantName: string;
  consultantPhone: string;
  consultantType: string;
  consultantTypeDescription: string;
  serviceType: string;
  serviceTypeDescription: string;
  durationMinutes: number;
  durationFormatted: string;
  fee: number;
  status: string;
  statusDescription: string;
  question: string;
  paymentMethod: string;
  paidAt?: string;
  startedAt?: string;
  completedAt?: string;
  actualDurationSeconds: number;
  actualDurationFormatted: string;
  sessionStatus: string;
  createdAt: string;
  updatedAt: string;
}

// 更新订单状态请求
export interface UpdateOrderStatusRequest {
  orderId: number;
  status: OrderStatus;
  reason?: string;
}

// 处理退款请求
export interface ProcessRefundRequest {
  orderId: number;
  approved: boolean;
  reason?: string;
  refundAmount?: number;
}

// 提现申请响应数据
export interface WithdrawalApplicationResponse {
  id: number;
  applicationNumber: string;
  userId: number;
  userInfo: {
    username: string;
    realName: string;
    userType: string;
  };
  amount: number;
  accountInfo: {
    accountType: string;
    accountNumber: string;
    accountName: string;
    bankName?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  processedAt?: string;
  processedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// 处理提现申请请求
export interface ProcessWithdrawalRequest {
  withdrawalId: number;
  approved: boolean;
  reason?: string;
}

// 佣金记录响应数据
export interface CommissionRecordResponse {
  id: number;
  userId: number;
  userInfo: {
    username: string;
    realName: string;
  };
  orderId?: number;
  type: 'referral' | 'consultation' | 'adjustment';
  amount: number;
  description: string;
  status: 'pending' | 'confirmed' | 'withdrawn';
  createdAt: string;
}

// 调整用户佣金请求
export interface AdjustCommissionRequest {
  userId: number;
  type: 'increase' | 'decrease';
  amount: number;
  reason: string;
} 