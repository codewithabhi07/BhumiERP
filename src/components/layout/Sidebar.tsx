import { NavLink } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-accent-blue' },
  { icon: Receipt, label: 'Billing', path: '/billing', color: 'text-accent-green' },
  { icon: Package, label: 'Products', path: '/products', color: 'text-accent-orange' },
  { icon: Users, label: 'Customers', path: '/customers', color: 'text-accent-pink' },
  { icon: UserRound, label: 'Employees', path: '/employees', color: 'text-accent-indigo' },
  { icon: Wallet, label: 'Salaries', path: '/salaries', color: 'text-primary-500' },
  { icon: BarChart3, label: 'Reports', path: '/reports', color: 'text-emerald-500' },
  { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-500' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on mobile when navigating
  const handleNavLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center">
            <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg shadow-primary-200">
              <Store className="h-6 w-6 text-white shrink-0" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col ml-3 overflow-hidden">
                <span className="text-lg font-black tracking-tighter text-primary-600 uppercase italic leading-none">
                  BHUMIKA
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  GARMENTS
                </span>
              </div>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavLinkClick}
              className={({ isActive }) => cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-100 scale-[1.02]' 
                  : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                !isCollapsed && 'mr-3',
                // isActive ? 'text-white' : item.color
              )} />
              {(!isCollapsed || window.innerWidth < 1024) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:absolute -right-3 top-20 lg:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-primary-600" /> : <ChevronLeft className="h-4 w-4 text-primary-600" />}
        </button>

        <div className="border-t border-slate-100 p-4">
          <div className={cn('flex items-center bg-slate-50 p-2 rounded-xl border border-slate-100', isCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-black shadow-md shrink-0">
              G
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Ganesh Mahajan</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Shop Owner</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
