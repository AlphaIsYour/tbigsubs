export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  picName: string | null;
  isPermanent: boolean;
  notes: string | null;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  picName?: string;
  isPermanent: boolean;
  notes?: string;
}

export interface SubscriptionDTO {
  id: string;
  customerId: string;
  siteId: string | null;
  contractorId: string | null;
  planId: string;
  type: "PERMANENT" | "MONTHLY";
  startDate: Date;
  dueDate: Date | null;
  status: "ACTIVE" | "DUE_SOON" | "OVERDUE" | "SUSPENDED" | "CANCELLED";
  autoRenew: boolean;
  notes: string | null;
}

export interface CreateSubscriptionInput {
  customerId: string;
  siteId: string;
  contractorId?: string;
  planId: string;
  type: "PERMANENT" | "MONTHLY";
  startDate: string;
  dueDate?: string;
  autoRenew?: boolean;
  notes?: string;
}
