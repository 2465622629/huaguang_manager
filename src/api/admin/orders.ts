import request from '../request';
import type {
  ApiResponse,
  PageResponse
} from '../types';
import type {
  OrderListQuery,
  ConsultationOrderResponse,
  UpdateOrderStatusRequest,
  ProcessRefundRequest,
  WithdrawalApplicationResponse,
  ProcessWithdrawalRequest,
  CommissionRecordResponse,
  AdjustCommissionRequest
} from '../types/orders';

/**
 * 订单与交易管理API
 */
export class OrdersApi {
  /**
   * 获取咨询订单列表
   */
  static async getConsultationOrders(params: OrderListQuery): Promise<ApiResponse<PageResponse<ConsultationOrderResponse>>> {
    return request.get('/admin/order-management/consultation/orders', { params });
  }

  /**
   * 获取咨询订单详情
   */
  static async getConsultationOrderDetail(orderId: number): Promise<ApiResponse<ConsultationOrderResponse>> {
    return request.get(`/admin/order-management/consultation/orders/${orderId}`);
  }

  /**
   * 更新订单状态
   */
  static async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/order-management/consultation/orders/${data.orderId}/status`, data);
  }

  /**
   * 处理订单退款
   */
  static async processRefund(data: ProcessRefundRequest): Promise<ApiResponse<void>> {
    return request.post(`/admin/order-management/consultation/orders/${data.orderId}/refund`, data);
  }

  /**
   * 获取提现申请列表
   */
  static async getWithdrawalApplications(params: {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
    userType?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse<PageResponse<WithdrawalApplicationResponse>>> {
    return request.get('/admin/order-management/withdrawal/applications', { params });
  }

  /**
   * 处理提现申请
   */
  static async processWithdrawal(data: ProcessWithdrawalRequest): Promise<ApiResponse<void>> {
    return request.put(`/admin/order-management/withdrawal/applications/${data.withdrawalId}/process`, data);
  }

  /**
   * 获取佣金记录列表
   */
  static async getCommissionRecords(params: {
    page?: number;
    size?: number;
    keyword?: string;
    type?: string;
    status?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse<PageResponse<CommissionRecordResponse>>> {
    return request.get('/admin/order-management/commission/records', { params });
  }

  /**
   * 调整用户佣金
   */
  static async adjustCommission(data: AdjustCommissionRequest): Promise<ApiResponse<void>> {
    return request.post('/admin/order-management/commission/adjust', data);
  }

  /**
   * 获取订单与交易管理统计数据
   */
  static async getOrderStatistics(): Promise<ApiResponse<{
    orders: {
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      refundedOrders: number;
      totalRevenue: number;
      todayRevenue: number;
    };
    withdrawals: {
      totalWithdrawals: number;
      pendingWithdrawals: number;
      processedWithdrawals: number;
      totalWithdrawalAmount: number;
    };
    commissions: {
      totalCommissions: number;
      pendingCommissions: number;
      withdrawnCommissions: number;
      totalCommissionAmount: number;
    };
    trends: {
      orderTrend: Array<{ date: string; count: number; amount: number }>;
      revenueTrend: Array<{ date: string; amount: number }>;
    };
  }>> {
    return request.get('/admin/order-management/statistics');
  }
}

// 为方便使用，也导出函数式API
export const {
  getConsultationOrders,
  getConsultationOrderDetail,
  updateOrderStatus,
  processRefund,
  getWithdrawalApplications,
  processWithdrawal,
  getCommissionRecords,
  adjustCommission,
  getOrderStatistics
} = OrdersApi; 