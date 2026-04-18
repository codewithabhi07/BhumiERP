import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, User, Menu, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Modern Navbar */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <div className="flex flex-col">
               <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                 Bhumi<span className="text-primary-600">ERP</span>
               </h2>
               <div className="flex items-center gap-1.5 mt-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise Active</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/50 group focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input 
                placeholder="Search analytics..." 
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:outline-none w-48"
              />
            </div>

            <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight italic">{settings?.shopName || 'Bhumika Garments'}</span>
                <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">{settings?.ownerName || 'Proprietor'}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-200 hover:scale-105 transition-transform cursor-pointer border-2 border-white">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth pb-24 lg:pb-10">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
