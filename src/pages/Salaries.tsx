import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Plus,
  Banknote,
  Receipt
} from 'lucide-react';
import type { SalaryPayment } from '../types';
import { format } from 'date-fns';

export default function SalariesPage() {
  const { employees, salaryPayments, addSalaryPayment } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SalaryPayment>>({
    employeeId: '',
    amount: 0,
    type: 'Salary',
    month: format(new Date(), 'MMMM'),
    year: new Date().getFullYear(),
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const totalPaidThisMonth = salaryPayments
    .filter(p => p.month === formData.month && p.year === formData.year)
    .reduce((acc, p) => acc + p.amount, 0);

  const handleAddPayment = () => {
    if (!formData.employeeId || !formData.amount) return;
    addSalaryPayment({
      ...formData,
      id: `sal-${Date.now()}`
    } as SalaryPayment);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salaries & Payments</h1>
          <p className="text-sm text-slate-500">Track employee salaries, advances, and bonuses.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Recent Payments</h3>
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" /> History
            </Button>
          </div>

          <Table headers={['Date', 'Employee', 'Type', 'Amount', 'Note']}>
            {salaryPayments.map((p) => {
              const emp = employees.find(e => e.id === p.employeeId);
              return (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{emp?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold 
                      ${p.type === 'Salary' ? 'bg-blue-50 text-blue-700' : 
                        p.type === 'Advance' ? 'bg-orange-50 text-orange-700' : 
                        'bg-green-50 text-green-700'}`}>
                      {p.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-slate-500 text-xs truncate max-w-[100px]">{p.note || '-'}</TableCell>
                </TableRow>
              );
            })}
            {salaryPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                  No payment records found.
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary-600 text-white border-none shadow-primary-200">
            <div className="space-y-4 p-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Banknote className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">THIS MONTH</span>
              </div>
              <div>
                <p className="text-sm text-primary-100">Total Payout</p>
                <h2 className="text-3xl font-black italic tracking-tighter">₹{totalPaidThisMonth.toLocaleString()}</h2>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary-100">
                <ArrowUpRight className="h-3 w-3" />
                <span>Across {new Set(salaryPayments.map(p => p.employeeId)).size} employees</span>
              </div>
            </div>
          </Card>

          <Card title="Payment Policy">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <span>Salaries are typically paid between 1st and 5th of every month.</span>
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <span>Advances are limited to 40% of the monthly salary.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Record Salary Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Select Employee</label>
            <select 
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={formData.employeeId}
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
            >
              <option value="">Choose Employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} (Base: ₹{e.salary})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Amount (₹)" 
              type="number" 
              placeholder="0" 
              value={formData.amount || ''}
              onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Type</label>
              <select 
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="Salary">Full Salary</option>
                <option value="Advance">Advance</option>
                <option value="Bonus">Bonus</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Month</label>
              <select 
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <Input 
              label="Date" 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <Input 
            label="Note (Optional)" 
            placeholder="e.g. Paid via UPI" 
            value={formData.note}
            onChange={e => setFormData({...formData, note: e.target.value})}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddPayment}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
