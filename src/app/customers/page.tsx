'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  Search, 
  Phone, 
  Mail, 
  UserPlus,
  Users,
  Heart,
  TrendingUp,
  Edit2,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Customer } from '../../types';
import { cn } from '../../utils/cn';

function CustomersContent() {
  const { customers, addCustomer } = useAppStore();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('ERP system  Update: New stock has arrived! Visit us today for exclusive designs and exciting offers. See you soon!');
  const [sentStatus, setSentStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (searchParams.get('broadcast') === 'true') {
      setIsBroadcastOpen(true);
    }
  }, [searchParams]);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '', phone: '', email: '', address: '', totalSpent: 0, lastVisit: new Date().toISOString()
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return alert('Name & Phone required');
    addCustomer({ ...newCustomer, id: `cust-${Date.now()}`, totalSpent: 0, lastVisit: new Date().toISOString() } as Customer);
    setIsModalOpen(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
  };

  const handleSingleWhatsApp = (phone: string, name: string, id: string) => {
    const text = encodeURIComponent(`Hello ${name}, ${broadcastMessage}`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
    setSentStatus(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
            <span className="p-2 bg-pink-500 rounded-xl shadow-lg shadow-pink-200">
              <Users className="h-6 w-6 text-white" />
            </span>
            Premium <span className="text-pink-500">Clients</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Customer Relationship Terminal</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-xs border-2 border-primary-100 text-primary-600 bg-primary-50 hover:bg-primary-100 shadow-lg shadow-primary-50/50" onClick={() => setIsBroadcastOpen(true)}>
            <MessageSquare className="h-4 w-4" /> Marketing Broadcast
          </Button>
          <Button className="gap-2 h-12 px-8 rounded-2xl font-black uppercase text-xs shadow-xl bg-pink-500 shadow-pink-100" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="h-4 w-4" /> New Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-pink-500 flex items-center gap-4 group transition-all hover:scale-105">
          <div className="p-3 rounded-2xl bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform"><Heart className="h-6 w-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyal Base</p>
            <h3 className="text-2xl font-black text-slate-900">{customers.length} Members</h3>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-emerald-500 flex items-center gap-4 group transition-all hover:scale-105">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Lifetime Value</p>
            <h3 className="text-2xl font-black text-slate-900">₹{(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.length || 1)).toFixed(0)}</h3>
          </div>
        </div>
      </div>

      <Card className="shadow-2xl border-none rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
            <Input placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-11 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white" />
          </div>
        </div>

        <Table headers={['Client Profile', 'Contact Information', 'Last Visit', 'Total Business', '']}>
          {filteredCustomers.map((c) => (
            <TableRow key={c.id} className="hover:bg-slate-50/50 group transition-all">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-black shadow-lg shadow-pink-100 uppercase">{c.name[0]}</div>
                  <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{c.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase"><Phone className="h-3 w-3 text-pink-400" /> {c.phone}</div>
                  {c.email && <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400"><Mail className="h-3 w-3 text-pink-300" /> {c.email}</div>}
                </div>
              </TableCell>
              <TableCell><span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter italic">{new Date(c.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span></TableCell>
              <TableCell className="font-black text-slate-900 text-sm italic">₹{c.totalSpent.toLocaleString()}</TableCell>
              <TableCell>
                <button className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-pink-600 hover:bg-pink-50"><Edit2 className="h-4 w-4" /></button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} title="Marketing Broadcast Control" size="lg">
        <div className="space-y-6">
          <div className="p-6 bg-primary-50 rounded-[2rem] border-2 border-primary-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
              <MessageSquare className="h-24 w-24 text-primary-600" />
            </div>
            <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-3 ml-1">Broadcast Message Template</label>
            <textarea 
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full h-32 p-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-400 shadow-inner resize-none uppercase"
              placeholder="Enter your announcement..."
            />
            <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-primary-400 uppercase italic">
              <AlertCircle className="h-3 w-3" /> Note: This will include the customer's name automatically at the start.
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience ({customers.length} Recipients)</p>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {customers.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase border border-slate-100 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">{c.name[0]}</div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1">{c.name}</p>
                      <p className="text-[9px] font-bold text-slate-400">{c.phone}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 transition-all",
                      sentStatus[c.id] ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-primary-600 text-white shadow-lg shadow-primary-100 hover:bg-primary-700"
                    )}
                    onClick={() => handleSingleWhatsApp(c.phone, c.name, c.id)}
                  >
                    {sentStatus[c.id] ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    {sentStatus[c.id] ? 'Sent' : 'Send Now'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button 
              className="w-full h-14 rounded-2xl bg-slate-900 text-white uppercase font-black tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-2xl"
              onClick={() => setIsBroadcastOpen(false)}
            >
              Close Broadcast Control
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-black uppercase tracking-widest text-slate-400">Loading Client Database...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
