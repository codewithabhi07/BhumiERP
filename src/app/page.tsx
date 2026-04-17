'use client';

import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SecurityWrapper } from '../components/layout/SecurityWrapper';
import { cn } from '../utils/cn';
import { 
  Users, 
  AlertTriangle,
  Receipt,
  Wallet,
  QrCode,
  TrendingUp,
  ShoppingCart,
  MessageSquare
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

function formatDistanceToNow(date: Date) {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function DashboardPage() {
  const { products } = useProductStore();
  const { customers, invoices, settings, salesmen } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    invDate.setHours(0, 0, 0, 0);
    return invDate.getTime() === today.getTime();
  });

  const lowStockCount = products.filter(p => p.quantity <= (settings?.lowStockThreshold || 5)).length;
  const totalSalesToday = todayInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  const cashSalesToday = todayInvoices.filter(i => i.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiSalesToday = todayInvoices.filter(i => i.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const cardSalesToday = todayInvoices.filter(i => i.paymentMethod === 'Card').reduce((acc, inv) => acc + inv.totalAmount, 0);

  const sendDailyReportToBapu = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const BAPU_NUMBER = '9890001054';
    
    let reportMsg = `*Daily Sales Report - ERP System for Garments Retail*\n`;
    reportMsg += `*Date:* ${dateStr}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `💰 *Cash Collection:* ₹${cashSalesToday.toLocaleString()}\n`;
    reportMsg += `📱 *UPI / PhonePe:* ₹${upiSalesToday.toLocaleString()}\n`;
    reportMsg += `💳 *Card Payments:* ₹${cardSalesToday.toLocaleString()}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `🚀 *TOTAL REVENUE:* ₹${totalSalesToday.toLocaleString()}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `📦 *Current Total Stock:* ${products.reduce((acc, p) => acc + p.quantity, 0)} Pcs\n`;
    reportMsg += `👤 *New Customers Today:* ${todayInvoices.filter(inv => inv.customerName !== 'Cash Customer').length}\n`;
    reportMsg += `\n_Generated automatically by BhumiERP_`;

    window.open(`https://wa.me/91${BAPU_NUMBER}?text=${encodeURIComponent(reportMsg)}`, '_blank');
  };

  // Aggregate sales by day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === date.getTime();
    });
    return {
      name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      sales: dayInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
    };
  });

  const stats = [
    { 
      label: "Today's Cash", 
      value: `₹${cashSalesToday.toLocaleString()}`, 
      icon: Wallet, 
      gradient: 'from-emerald-400 to-teal-600',
      trend: 'In-Drawer',
      color: 'text-emerald-600'
    },
    { 
      label: "Today's UPI", 
      value: `₹${upiSalesToday.toLocaleString()}`, 
      icon: QrCode, 
      gradient: 'from-blue-400 to-indigo-600',
      trend: 'Bank Transfer',
      color: 'text-blue-600'
    },
    { 
      label: 'Active Customers', 
      value: customers.length.toString(), 
      icon: Users, 
      gradient: 'from-pink-400 to-rose-600',
      trend: '+3.2% growth',
      color: 'text-rose-600'
    },
    { 
      label: 'Low Stock Items', 
      value: lowStockCount.toString(), 
      icon: AlertTriangle, 
      gradient: 'from-orange-400 to-amber-600',
      trend: lowStockCount > 0 ? 'Action Needed' : 'Stock OK',
      color: 'text-amber-600'
    },
  ];

  return (
    <SecurityWrapper>
      <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Bhumika <span className="text-primary-600">Garments</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-[10px] border-2 border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 shadow-lg shadow-emerald-100/50 transition-all active:scale-95"
            onClick={sendDailyReportToBapu}
          >
            <MessageSquare className="h-4 w-4" /> Send Daily Report to Bapu Shet
          </Button>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-300 transform hover:-translate-y-1 border border-slate-50">
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity bg-gradient-to-br rounded-full", stat.gradient)} />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-2xl p-3 text-white shadow-lg", stat.gradient)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-slate-50", stat.color)}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mt-1">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-2xl shadow-slate-200/50 border-none rounded-[2.5rem]" title="Revenue Intelligence" description="Performance analytics for the current week.">
          <div className="h-[350px] w-full pt-6">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
              <TrendingUp className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Total Valuation</h3>
              <div>
                <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-widest font-black italic">{invoices.length > 0 ? "Live Revenue Active" : "Warehouse Audit"}</p>
                <h2 className="text-4xl font-black italic tracking-tighter">₹{(products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0)).toLocaleString()}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Stock</p>
                  <p className="text-lg font-black">{products.reduce((acc, p) => acc + p.quantity, 0)} Pcs</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Articles</p>
                  <p className="text-lg font-black">{products.length} Items</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Recent Activity" description="Latest transactions log." className="shadow-2xl border-none rounded-[2.5rem]">
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm group-hover:text-primary-600 transition-colors border border-slate-50">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{inv.customerName || 'Guest'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDistanceToNow(new Date(inv.date))} ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{inv.totalAmount.toFixed(0)}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                        inv.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      )}>
                        {inv.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3 opacity-40">
                  <ShoppingCart className="h-10 w-10 mx-auto text-slate-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Terminal Idle</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </SecurityWrapper>
  );
}
