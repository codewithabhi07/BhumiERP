import { useProductStore } from '../store/useProductStore';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShoppingCart,
  Banknote,
  Clock,
  Wallet,
  QrCode
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
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

export default function DashboardPage() {
  const { products } = useProductStore();
  const { customers, invoices } = useAppStore();

  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;
  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  const cashSales = invoices.filter(i => i.paymentMethod === 'Cash').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const upiSales = invoices.filter(i => i.paymentMethod === 'UPI').reduce((acc, inv) => acc + inv.totalAmount, 0);

  const stats = [
    { 
      label: 'Cash Collection', 
      value: `₹${cashSales.toLocaleString()}`, 
      icon: Wallet, 
      gradient: 'from-emerald-500 to-teal-600',
      trend: 'In-hand',
      up: true
    },
    { 
      label: 'UPI / Online', 
      value: `₹${upiSales.toLocaleString()}`, 
      icon: QrCode, 
      gradient: 'from-primary-500 to-indigo-600',
      trend: 'Bank',
      up: true
    },
    { 
      label: 'New Customers', 
      value: customers.length.toString(), 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      trend: '+3.2%',
      up: true
    },
    { 
      label: 'Low Stock', 
      value: lowStockCount.toString(), 
      icon: AlertTriangle, 
      gradient: 'from-red-500 to-rose-600',
      trend: lowStockCount > 0 ? 'Critical' : 'Good',
      up: false
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Bhumika <span className="text-primary-600">Garments</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 py-2 bg-primary-50 rounded-xl">
            <span className="text-xs font-black text-primary-600 uppercase tracking-widest">Store Dashboard</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-3xl bg-white p-1 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-100 transition-all duration-300 scale-100 hover:scale-[1.02]">
            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br transition-opacity group-hover:opacity-20", stat.gradient)} />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-2xl p-3 text-white shadow-lg", stat.gradient)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-tighter", stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 shadow-xl shadow-slate-200/50" title="Revenue Overview" description="Recent sales performance graph">
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={invoices.length > 0 ? invoices.slice(-10).reverse().map((inv, idx) => ({ name: `B-${idx+1}`, sales: inv.totalAmount })) : data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="space-y-6">
          <Card title="Payment Distribution" className="bg-slate-900 text-white border-none shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Cash Collection</span>
                <span className="text-lg font-black text-emerald-400">₹{cashSales.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${totalSales > 0 ? (cashSales / totalSales) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase">UPI / Online</span>
                <span className="text-lg font-black text-primary-400">₹{upiSales.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${totalSales > 0 ? (upiSales / totalSales) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>

          <Card title="Recent Activity" description="Latest store events.">
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm group-hover:text-primary-600">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{inv.customerName || 'Guest'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{formatDistanceToNow(new Date(inv.date))} ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{inv.totalAmount.toFixed(0)}</p>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${inv.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'}`}>
                        {inv.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2 opacity-20">
                  <Clock className="h-8 w-8 mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">No activity yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper for relative time
function formatDistanceToNow(date: Date) {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
