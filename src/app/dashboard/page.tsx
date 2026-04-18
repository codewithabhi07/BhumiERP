'use client';

import { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SecurityWrapper } from '@/components/layout/SecurityWrapper';
import { cn } from '@/utils/cn';
import { 
  Users, 
  AlertTriangle,
  Receipt,
  Wallet,
  QrCode,
  TrendingUp,
  ShoppingCart,
  MessageSquare,
  ArrowUpRight,
  Package,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { products } = useProductStore();
  const { customers, invoices, settings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 500);
    return () => clearTimeout(timer);
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

  const sendDailyReportToBapu = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const BAPU_NUMBER = '9890001054';
    
    let reportMsg = `*Daily Sales Report - Bhumika Garments*\n`;
    reportMsg += `*Date:* ${dateStr}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `💰 *Cash:* ₹${cashSalesToday.toLocaleString()}\n`;
    reportMsg += `📱 *UPI:* ₹${upiSalesToday.toLocaleString()}\n`;
    reportMsg += `💳 *Card:* ₹${cardSalesToday.toLocaleString()}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `🚀 *TOTAL REVENUE:* ₹${totalSalesToday.toLocaleString()}\n`;
    reportMsg += `----------------------------\n`;
    reportMsg += `📦 *Total Stock:* ${products.reduce((acc, p) => acc + p.quantity, 0)} Pcs\n`;
    reportMsg += `👤 *New Cust:* ${todayInvoices.filter(inv => inv.customerName !== 'Cash Customer').length}\n`;
    reportMsg += `\n_Generated automatically by BhumiERP_`;

    window.open(`https://wa.me/91${BAPU_NUMBER}?text=${encodeURIComponent(reportMsg)}`, '_blank');
  };

  const stats = [
    { 
      label: "Today's Cash", 
      value: `₹${cashSalesToday.toLocaleString()}`, 
      icon: Wallet, 
      color: 'emerald',
      trend: 'Safe Balance'
    },
    { 
      label: "Today's UPI", 
      value: `₹${upiSalesToday.toLocaleString()}`, 
      icon: QrCode, 
      color: 'indigo',
      trend: 'Digital Verified'
    },
    { 
      label: 'Inventory Health', 
      value: `${products.length} Items`, 
      icon: Package, 
      color: 'orange',
      trend: lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Stock Stable'
    },
    { 
      label: 'Client Base', 
      value: customers.length.toString(), 
      icon: Users, 
      color: 'pink',
      trend: '+12% this month'
    },
  ];

  return (
    <SecurityWrapper>
      <div className="space-y-10 animate-slide-up">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Executive <span className="text-primary-600">Overview</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
              Welcome back, {settings?.ownerName || 'Proprietor'}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                onClick={sendDailyReportToBapu}
                className="gap-3 h-14 px-8 rounded-2xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover:scale-105"
             >
               <MessageSquare className="h-4 w-4" /> Send Daily Summary
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="premium-card p-6 relative group overflow-hidden border-none shadow-xl bg-white">
               <div className={cn(
                 "absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500",
                 stat.color === 'emerald' ? 'bg-emerald-500' : 
                 stat.color === 'indigo' ? 'bg-indigo-500' : 
                 stat.color === 'orange' ? 'bg-orange-500' : 'bg-pink-500'
               )} />
               
               <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between">
                   <div className={cn(
                     "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110",
                     stat.color === 'emerald' ? 'bg-emerald-500 text-white' : 
                     stat.color === 'indigo' ? 'bg-indigo-500 text-white' : 
                     stat.color === 'orange' ? 'bg-orange-500 text-white' : 'bg-pink-500 text-white'
                   )}>
                     <stat.icon className="h-6 w-6" />
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                     stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                     stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                     stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-pink-50 text-pink-600'
                   )}>
                     {stat.trend}
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Chart & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 premium-card bg-white p-8 border-none ring-1 ring-slate-100">
             <div className="flex items-center justify-between mb-10">
               <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Revenue Intelligence</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growth performance metrics</p>
               </div>
               <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                 <TrendingUp className="h-4 w-4 text-primary-500" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Feed</span>
               </div>
             </div>
             
             <div className="h-[400px] w-full pt-4">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}}
                        dx={-10}
                      />
                      <Tooltip 
                        cursor={{ stroke: '#c4b5fd', strokeWidth: 2 }}
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                          padding: '16px',
                          fontWeight: '900',
                          textTransform: 'uppercase'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#7c3aed" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSales)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
             </div>
           </div>

           <div className="space-y-6">
              <div className="premium-card bg-slate-900 p-8 border-none shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                   <TrendingUp className="h-32 w-32 text-white" />
                 </div>
                 <div className="relative z-10 space-y-8">
                   <div>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Total Warehouse Valuation</p>
                     <h2 className="text-4xl font-black text-white italic tracking-tighter">
                       ₹{(products.reduce((acc, p) => acc + (p.quantity * p.purchasePrice), 0)).toLocaleString()}
                     </h2>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-white/40">Units</p>
                       <p className="text-lg font-black text-white">{products.reduce((acc, p) => acc + p.quantity, 0)}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-white/40">Articles</p>
                       <p className="text-lg font-black text-white">{products.length}</p>
                     </div>
                   </div>

                   <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                     Run Audit
                   </Button>
                 </div>
              </div>

              <div className="premium-card bg-white p-6 border-none ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Live Sales Feed</h3>
                   <span className="text-[8px] font-black bg-primary-50 text-primary-600 px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">Realtime</span>
                </div>
                
                <div className="space-y-4">
                  {invoices.length > 0 ? (
                    invoices.slice(-4).reverse().map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-white transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary-600 shadow-sm border border-slate-50 transition-colors">
                            <Receipt className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1">{inv.customerName || 'Walk-in'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDistanceToNow(new Date(inv.date))} ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 tracking-tighter italic">₹{inv.totalAmount.toFixed(0)}</p>
                          <p className={cn(
                            "text-[8px] font-black uppercase mt-0.5 tracking-widest",
                            inv.paymentMethod === 'Cash' ? 'text-emerald-500' : 'text-indigo-500'
                          )}>{inv.paymentMethod}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center opacity-30">
                       <ShoppingCart className="h-10 w-10 mx-auto text-slate-300" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">Idle Terminal</p>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </SecurityWrapper>
  );
}
