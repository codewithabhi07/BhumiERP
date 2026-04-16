'use strict';
'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { MainLayout } from '../components/layout/MainLayout';
import { Store, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const Login = () => {
  const { verifyPin, login, settings } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (settings?.pin) {
      if (verifyPin(pin)) {
        login();
      } else {
        setError(true);
        setPin('');
        setTimeout(() => setError(false), 2000);
      }
    } else {
      // If no PIN is set, just allow entry
      login();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />

      <div className={cn(
        "w-full max-w-md p-10 bg-white rounded-[3rem] shadow-2xl border border-white relative z-10 animate-slide-up transition-all duration-300",
        error ? "ring-4 ring-rose-100 translate-x-1" : ""
      )}>
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary-600 p-4 rounded-[2rem] shadow-2xl shadow-primary-200 mb-6 group hover:scale-110 transition-transform duration-500">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-center tracking-tighter text-slate-900 uppercase italic leading-none">
            Bhumika
          </h2>
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mt-2">Garments Retail ERP</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <ShieldCheck className={cn("h-5 w-5", error ? "text-rose-500" : "text-emerald-500")} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {error ? "Incorrect Access Code" : "Secure Admin Access"}
              </span>
            </div>
            
            {settings?.pin ? (
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-300",
                      pin.length > i ? "bg-primary-600 border-primary-600 scale-125" : "border-slate-200 bg-white"
                    )} />
                  ))}
                </div>
                <input 
                  autoFocus
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    if (val.length === 4 && settings.pin === val) {
                      login();
                    } else if (val.length === 4) {
                      setError(true);
                      setPin('');
                      setTimeout(() => setError(false), 2000);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-default"
                />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Enter 4-Digit Security PIN</p>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-600 leading-relaxed">
                Welcome back, <span className="text-slate-900 font-black italic">Ganesh Mahajan</span>. Ready to manage your shop?
              </div>
            )}
          </div>

          <button 
            onClick={handleLogin} 
            className="group w-full bg-primary-600 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {settings?.pin ? "Unlock Dashboard" : "Enter Dashboard"}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-10 opacity-50">
          Version 1.4.2 • Secure JSON Mode
        </p>
      </div>
    </div>
  );
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchInitialData, isLoading: appLoading } = useAppStore();
  const { fetchProducts, isLoading: productsLoading } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchInitialData();
    fetchProducts();
  }, [fetchInitialData, fetchProducts]);

  if (!mounted) {
    return null;
  }

  if (appLoading || productsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
