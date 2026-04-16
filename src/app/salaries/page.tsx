'use client';

import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { SecurityWrapper } from '../../components/layout/SecurityWrapper';
import { 
  History, 
  Plus,
  Banknote,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import type { SalaryPayment } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

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
    <SecurityWrapper>
      <div className="space-y-8 animate-slide-up pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
              <span className="p-2 bg-violet-600 rounded-xl shadow-lg shadow-violet-200">
                <Wallet className="h-6 w-6 text-white" />
              </span>
              Payroll <span className="text-violet-600">Terminal</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Salary & Advance Ledger</p>
          </div>
          <Button className="gap-2 h-12 px-8 rounded-2xl font-black uppercase text-xs shadow-xl bg-violet-600 shadow-violet-100" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-2xl border-none rounded-[2.5rem] p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-white flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Transaction History</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-500">
                <History className="h-3 w-3" /> View All Logs
              </button>
            </div>

            <Table headers={['Payment Date', 'Staff Member', 'Category', 'Amount (₹)', 'Note']}>
              {salaryPayments.map((p) => {
                const emp = employees.find(e => e.id === p.employeeId);
                return (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell><span className="text-[10px] font-black uppercase text-slate-400">{format(new Date(p.date), 'dd MMM yy')}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-black text-[10px] uppercase">{emp?.name[0]}</div>
                        <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{emp?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        p.type === 'Salary' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        p.type === 'Advance' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                        {p.type}
                      </span>
                    </TableCell>
                    <TableCell><span className="font-black text-slate-900 italic">₹{p.amount.toLocaleString()}</span></TableCell>
                    <TableCell><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[100px] inline-block">{p.note || '-'}</span></TableCell>
                  </TableRow>
                );
              })}
              {salaryPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center opacity-30 italic font-black uppercase text-[10px] tracking-widest">
                    No payment records found
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-violet-600 via-indigo-600 to-primary-700 text-white border-none shadow-2xl rounded-[2.5rem] p-8 overflow-hidden relative group transition-all hover:scale-105">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Banknote className="h-32 w-32" /></div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-200">Payout Analytics</h3>
                <div>
                  <p className="text-xs text-violet-100 font-bold mb-1 uppercase tracking-widest italic">{formData.month} {formData.year}</p>
                  <h2 className="text-4xl font-black italic tracking-tighter drop-shadow-lg">₹{totalPaidThisMonth.toLocaleString()}</h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Across {new Set(salaryPayments.map(p => p.employeeId)).size} Staff members</span>
                </div>
              </div>
            </Card>

            <Card title="Shop Policy" className="rounded-[2.5rem] shadow-xl border-none">
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">1</div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-tight">Salary cycle: 1st to 5th of every month.</p>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">2</div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-tight">Advances capped at 40% of base pay.</p>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Payout Slip">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Member</label>
              <select className="h-12 w-full rounded-2xl bg-slate-50 border-none px-4 text-sm font-black uppercase focus:bg-white focus:ring-4 focus:ring-primary-500/10" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                <option value="">Select Employee...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} (₹{e.salary})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount (₹)" type="number" placeholder="0" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="bg-slate-50 border-none h-12 text-base font-black italic" />
              <div>
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select className="h-12 w-full rounded-2xl bg-slate-50 border-none px-4 text-sm font-black uppercase focus:bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="Salary">Full Salary</option><option value="Advance">Advance</option><option value="Bonus">Incentive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay Month</label>
                <select className="h-12 w-full rounded-2xl bg-slate-50 border-none px-4 text-sm font-black uppercase focus:bg-white" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Input label="Payment Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-slate-50 border-none h-12 font-bold" />
            </div>
            <Input label="Reference Note" placeholder="e.g. Paid via UPI / GPay" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="bg-slate-50 border-none h-12 text-sm font-bold" />
            <Button className="w-full h-16 rounded-[1.5rem] uppercase font-black tracking-widest text-[10px] bg-violet-600 shadow-2xl shadow-violet-100 mt-4" onClick={handleAddPayment}>Generate Payment Record</Button>
          </div>
        </Modal>
      </div>
    </SecurityWrapper>
  );
}
