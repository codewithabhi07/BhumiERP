import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, Employee, Invoice, SalaryPayment, ShopSettings, Attendance, LeaveRequest } from '../types';
import { mockCustomers, mockEmployees, mockSettings } from '../data/mockData';

interface AppState {
  customers: Customer[];
  employees: Employee[];
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  salaryPayments: SalaryPayment[];
  invoices: Invoice[];
  settings: ShopSettings;
  isAuthenticated: boolean;
  
  // Auth
  login: () => void;
  logout: () => void;
  
  // Customers
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  // Employees
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Attendance & Leaves
  markAttendance: (attendance: Attendance) => void;
  addLeaveRequest: (leave: LeaveRequest) => void;
  updateLeaveRequest: (id: string, status: LeaveRequest['status']) => void;
  
  // Salary
  addSalaryPayment: (payment: SalaryPayment) => void;
  
  // Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<ShopSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      customers: mockCustomers,
      employees: mockEmployees.map(e => ({ ...e, status: 'Active' })),
      attendance: [],
      leaveRequests: [],
      salaryPayments: [],
      invoices: [],
      settings: mockSettings,
      isAuthenticated: true, 

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      addCustomer: (customer) => 
        set((state) => ({ customers: [customer, ...state.customers] })),
      updateCustomer: (id, updated) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        })),

      addEmployee: (employee) => 
        set((state) => ({ employees: [employee, ...state.employees] })),
      updateEmployee: (id, updated) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      markAttendance: (attendance) =>
        set((state) => {
          const existing = state.attendance.findIndex(a => a.employeeId === attendance.employeeId && a.date === attendance.date);
          if (existing !== -1) {
            const newAttendance = [...state.attendance];
            newAttendance[existing] = attendance;
            return { attendance: newAttendance };
          }
          return { attendance: [attendance, ...state.attendance] };
        }),
      
      addLeaveRequest: (leave) =>
        set((state) => ({ leaveRequests: [leave, ...state.leaveRequests] })),
      
      updateLeaveRequest: (id, status) =>
        set((state) => ({
          leaveRequests: state.leaveRequests.map(l => l.id === id ? { ...l, status } : l)
        })),

      addSalaryPayment: (payment) =>
        set((state) => ({ salaryPayments: [payment, ...state.salaryPayments] })),

      addInvoice: (invoice) =>
        set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoice: (id, invoice) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? invoice : inv)),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      updateSettings: (updated) =>
        set((state) => ({ settings: { ...state.settings, ...updated } })),
    }),
    {
      name: 'bhumika-garments-app-data',
    }
  )
);
