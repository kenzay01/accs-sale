export interface Order {
  id: number;
  user_id: number;
  product_name: string;
  price: number;
  status: OrderStatus;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderWithUser extends Order {
  user: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language: string;
  };
}

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};
