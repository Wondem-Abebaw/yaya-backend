export interface TransactionUser {
  name: string;
  account: string;
}

export interface Transaction {
  id: string;
  sender: TransactionUser;
  receiver: TransactionUser;
  amount_with_currency: string;
  amount: number;
  amount_in_base_currency: number;
  fee: number;
  currency: string;
  cause: string;
  sender_caption: string;
  receiver_caption: string;
  created_at_time: number;
  is_topup: boolean;
  is_outgoing_transfer: boolean;
  fee_vat: number;
  fee_before_vat: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  incomingSum?: number;
  outgoingSum?: number;
  lastPage?: number;
  perPage?: number;
}

export interface SearchTransactionDto {
  query: string;
  page?: number;
  limit?: number;
}
