import { create } from 'zustand';
import type { Customer, Employee, Invoice, SalaryPayment, ShopSettings, Attendance, LeaveRequest, Salesman } from '../types';

interface AppState {
  customers: Customer[];
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  salaryPayments: SalaryPayment[];
  salesmen: Salesman[];
  invoices: Invoice[];
  settings: ShopSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Initial Fetch
  fetchInitialData: () => Promise<void>;
  
  // Auth
  login: () => void;
  logout: () => void;
  
  // Customers
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  
  // Employees
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Salesmen
  addSalesman: (salesman: Salesman) => Promise<void>;
  updateSalesman: (id: string, salesman: Partial<Salesman>) => Promise<void>;
  deleteSalesman: (id: string) => Promise<void>;
  
  // Attendance & Leaves
  markAttendance: (attendance: Attendance) => Promise<void>;
  addLeaveRequest: (leave: LeaveRequest) => Promise<void>;
  updateLeaveRequest: (id: string, status: LeaveRequest['status']) => Promise<void>;
  
  // Salary
  addSalaryPayment: (payment: SalaryPayment) => Promise<void>;
  
  // Invoices
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // Settings
  updateSettings: (settings: Partial<ShopSettings>) => Promise<void>;

  // Master Data Import & Reset
  importData: (data: any) => Promise<void>;
  resetAllData: () => Promise<void>;
  verifyPin: (pin: string) => boolean;
}

export const useAppStore = create<AppState>()((set, get) => ({
  customers: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  salaryPayments: [],
  salesmen: [],
  invoices: [],
  settings: null,
  isAuthenticated: false, 
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const endpoints = ['customers', 'employees', 'attendance', 'leaves', 'salaries', 'invoices', 'settings', 'salesmen'];
      const results = await Promise.all(
        endpoints.map(async (ep) => {
          const res = await fetch(`/api/${ep}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch /api/${ep}: ${res.statusText}`);
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error(`Endpoint /api/${ep} returned non-JSON response:`, text.substring(0, 200));
            throw new Error(`Endpoint /api/${ep} returned non-JSON response (HTML error page?)`);
          }
          return res.json();
        })
      );

      const [customers, employees, attendance, leaveRequests, salaryPayments, invoices, settings, salesmen] = results;
      set({ 
        customers, 
        employees, 
        attendance, 
        leaveRequests, 
        salaryPayments, 
        invoices, 
        settings, 
        salesmen: salesmen || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      set({ isLoading: false });
    }
  },

  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),

  addSalesman: async (salesman) => {
    await fetch('/api/salesmen', {
      method: 'POST',
      body: JSON.stringify(salesman),
    });
    set((state) => ({ salesmen: [...state.salesmen, salesman] }));
  },
  updateSalesman: async (id, updated) => {
    await fetch('/api/salesmen', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updated }),
    });
    set((state) => ({
      salesmen: state.salesmen.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    }));
  },
  deleteSalesman: async (id) => {
    await fetch(`/api/salesmen?id=${id}`, { method: 'DELETE' });
    set((state) => ({
      salesmen: state.salesmen.filter((s) => s.id !== id),
    }));
  },

  addCustomer: async (customer) => {
    await fetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
    set((state) => ({ customers: [customer, ...state.customers] }));
  },
  updateCustomer: async (id, updated) => {
    await fetch('/api/customers', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updated }),
    });
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  },

  addEmployee: async (employee) => {
    await fetch('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
    set((state) => ({ employees: [employee, ...state.employees] }));
  },
  updateEmployee: async (id, updated) => {
    await fetch('/api/employees', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updated }),
    });
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    }));
  },
  deleteEmployee: async (id) => {
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
  },

  markAttendance: async (attendance) => {
    await fetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
    set((state) => {
      const existing = state.attendance.findIndex(a => a.employeeId === attendance.employeeId && a.date === attendance.date);
      if (existing !== -1) {
        const newAttendance = [...state.attendance];
        newAttendance[existing] = attendance;
        return { attendance: newAttendance };
      }
      return { attendance: [attendance, ...state.attendance] };
    });
  },
  
  addLeaveRequest: async (leave) => {
    await fetch('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(leave),
    });
    set((state) => ({ leaveRequests: [leave, ...state.leaveRequests] }));
  },
  
  updateLeaveRequest: async (id, status) => {
    await fetch('/api/leaves', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    set((state) => ({
      leaveRequests: state.leaveRequests.map(l => l.id === id ? { ...l, status } : l)
    }));
  },

  addSalaryPayment: async (payment) => {
    await fetch('/api/salaries', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
    set((state) => ({ salaryPayments: [payment, ...state.salaryPayments] }));
  },

  addInvoice: async (invoice) => {
    await fetch('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
    set((state) => ({ invoices: [invoice, ...state.invoices] }));
  },
  updateInvoice: async (id, invoice) => {
    await fetch('/api/invoices', {
      method: 'PUT',
      body: JSON.stringify({ id, ...invoice }),
    });
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
    }));
  },
  deleteInvoice: async (id) => {
    await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    }));
  },

  updateSettings: async (updated) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    const newSettings = await res.json();
    set({ settings: newSettings });
  },

  importData: async (data) => {
    if (!data) return;
    // For now, let's assume we want to push this to the DB.
    // This would require a special API endpoint to overwrite the DB or we can do it piece by piece.
    // For simplicity, let's just update local state and maybe we can add an API later if needed.
    set((state) => ({
      customers: data.customers || state.customers,
      employees: data.employees || state.employees,
      attendance: data.attendance || state.attendance,
      leaveRequests: data.leaveRequests || state.leaveRequests,
      salaryPayments: data.salaryPayments || state.salaryPayments,
      invoices: data.invoices || state.invoices,
      settings: data.settings || state.settings,
    }));
  },
  
  verifyPin: (inputPin) => {
    const { settings } = get();
    return settings?.pin === inputPin;
  },

  resetAllData: async () => {
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset' }),
    });
    set({
      customers: [],
      employees: [],
      attendance: [],
      leaveRequests: [],
      salaryPayments: [],
      salesmen: [],
      invoices: [],
      // Keep settings
    });
  },
}));
