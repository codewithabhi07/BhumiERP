import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  UserRound,
  Wallet,
  BarChart3,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const menuItems = [
  { icon: Receipt, label: 'POS Billing', path: '/billing', color: 'text-emerald-500', bg: 'hover:bg-emerald-50' },
  { icon: Package, label: 'Inventory', path: '/products', color: 'text-orange-500', bg: 'hover:bg-orange-50' },
  { icon: Users, label: 'Customers', path: '/customers', color: 'text-pink-500', bg: 'hover:bg-pink-50' },
  { icon: Megaphone, label: 'Marketing', path: '/customers?broadcast=true', color: 'text-primary-500', bg: 'hover:bg-primary-50' },
  { icon: UserRound, label: 'Staff Mgt', path: '/employees', color: 'text-indigo-500', bg: 'hover:bg-indigo-50' },
  { icon: Wallet, label: 'Salaries', path: '/salaries', color: 'text-violet-500', bg: 'hover:bg-violet-50' },
  { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-cyan-500', bg: 'hover:bg-cyan-50' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-blue-500', bg: 'hover:bg-blue-50' },
  { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-500', bg: 'hover:bg-slate-50' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleNavLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 bg-white border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-2xl shadow-lg shadow-primary-200 flex-shrink-0">
              <Store className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                  BHUMIKA
                </span>
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">GARMENTS</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleNavLinkClick}
                className={cn(
                  'group flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-200'
                    : cn('text-slate-500 hover:text-slate-900', item.bg)
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  !isCollapsed && 'mr-3',
                )} />
                {(!isCollapsed || window.innerWidth < 1024) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:absolute -right-3 top-24 lg:flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-100 shadow-md hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-primary-600" /> : <ChevronLeft className="h-4 w-4 text-primary-600" />}
        </button>

        {/* User Footer */}
        <div className="p-4 mt-auto">
          <div className={cn(
            'flex items-center gap-3 bg-slate-50 p-3 rounded-[1.5rem] border border-slate-100',
            isCollapsed ? 'justify-center' : ''
          )}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-primary-100 flex-shrink-0">
              G
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Ganesh Mahajan</span>
                <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Shop Owner</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
