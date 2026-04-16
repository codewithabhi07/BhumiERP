import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export function SecurityWrapper({ children }: SecurityWrapperProps) {
  const { settings, verifyPin } = useAppStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // If no PIN is set, bypass security
  useEffect(() => {
    if (!settings.pin) {
      setIsUnlocked(true);
    }
  }, [settings.pin]);

  const handleUnlock = () => {
    if (verifyPin(pin)) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Card className="w-full max-w-md p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] rounded-[3rem]">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-10 text-center relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock className="h-24 w-24 text-white" />
          </div>
          <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Restricted Area</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Identity verification required to access manager reports and system settings.</p>
        </div>
        
        <div className="p-10 space-y-8 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security PIN</span>
              <KeyRound className="h-4 w-4 text-primary-500" />
            </div>
            <Input 
              type="password" 
              maxLength={4} 
              autoFocus
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value.replace(/\D/g, ''));
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="h-16 text-center text-3xl font-black tracking-[1em] bg-slate-50 border-none rounded-[1.25rem] focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
            {error && (
              <p className="text-[10px] font-black text-rose-500 uppercase text-center animate-bounce">Access Denied: Invalid PIN</p>
            )}
          </div>

          <Button 
            className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest bg-primary-600 shadow-2xl shadow-primary-200 hover:scale-[1.02] active:scale-95 transition-all text-xs"
            onClick={handleUnlock}
          >
            Unlock Terminal
          </Button>
          
          <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tighter">
            Default PIN for first-time use is <span className="text-slate-900 font-black">1234</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
