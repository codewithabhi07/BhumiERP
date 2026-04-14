export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';

export const APP_VERSION = '1.0.0';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: Size;
  color: string;
  season?: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minQuantity: number;
  imageUrl?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  lastVisit: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'Full Day' | 'Half Day' | 'Absent' | 'Leave';
  note?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: number;
  type: 'Salary' | 'Advance' | 'Bonus';
  date: string;
  month: string;
  year: number;
  note?: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  color: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subTotal: number;
  tax: number;
  discount: number;
  rounding: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  salesmanId?: string;
  salesmanName?: string;
  date: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  address: string;
  phone: string;
  gstNumber: string;
  logo?: string;
  themeColor: string;
  currency: string;
}
