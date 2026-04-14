import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, User, Menu, Settings } from 'lucide-react';
import { Input } from '../ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings } = useAppStore();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex w-64 lg:w-96 items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search inventory..." 
                className="pl-10 h-10 bg-slate-50 border-slate-100 shadow-none focus-visible:ring-primary-500 focus-visible:bg-white rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-100 animate-pulse" />
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
            
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight italic">{settings.shopName}</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{settings.ownerName}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shadow-sm shadow-primary-50">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-20 lg:pb-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
