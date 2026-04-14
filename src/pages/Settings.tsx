import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useProductStore } from '../store/useProductStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Store, 
  MapPin, 
  Phone, 
  FileText, 
  Save,
  Download,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, customers, employees, salaryPayments, invoices, attendance } = useAppStore();
  const { products } = useProductStore();
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings updated successfully!');
  };

  const handleExportData = () => {
    const fullData = {
      settings,
      customers,
      employees,
      salaryPayments,
      invoices,
      attendance,
      products
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BHUMIKA_GARMENTS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Shop <span className="text-primary-600">Settings</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Business Control Center</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl font-black uppercase text-xs border-2" onClick={handleExportData}>
          <Download className="h-4 w-4" /> Export All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          <Card title="Business Identity" description="Official shop details for printing invoices.">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Shop Name" 
                  value={formData.shopName}
                  onChange={e => setFormData({...formData, shopName: e.target.value})}
                />
                <Input 
                  label="Owner Name" 
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
              <Input 
                label="Full Address" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Contact Phone" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <Input 
                  label="GSTIN Number" 
                  value={formData.gstNumber}
                  onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                />
              </div>
            </div>
          </Card>

          <Card title="Data Security" description="Keep your business information safe.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-[1.5rem] bg-amber-50 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Offline Backup</span>
                </div>
                <p className="text-[10px] text-amber-600 font-bold leading-relaxed">Download a complete copy of your Sales, Stock, and Staff records to your computer.</p>
                <Button variant="outline" className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-amber-200 text-amber-700 bg-white hover:bg-amber-100" onClick={handleExportData}>
                  Download Now
                </Button>
              </div>
              <div className="p-5 rounded-[1.5rem] bg-primary-50 border border-primary-100 space-y-3">
                <div className="flex items-center gap-2 text-primary-700">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Cloud Sync</span>
                </div>
                <p className="text-[10px] text-primary-600 font-bold leading-relaxed">Coming Soon: Access your shop data from your mobile or home computer securely.</p>
                <Button variant="outline" disabled className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-primary-200 text-primary-400 bg-white">
                  Get Started
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button className="gap-2 px-10 h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary-200" onClick={handleSave}>
              <Save className="h-5 w-5" /> Save All Settings
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Bill Preview" className="bg-slate-50/50">
            <div className="flex flex-col items-center py-6">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-2xl mb-4 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <Store className="h-12 w-12" />
              </div>
              <h3 className="font-black text-slate-900 uppercase italic text-center leading-tight tracking-tighter text-xl">{formData.shopName}</h3>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-1">{formData.ownerName}</p>
            </div>
            <div className="border-t border-slate-200 mt-4 pt-6 space-y-4">
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">{formData.address}</span>
              </div>
              <div className="flex gap-3">
                <Phone className="h-4 w-4 text-primary-500 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">+91 {formData.phone}</span>
              </div>
              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-primary-500 shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed font-mono">GST: {formData.gstNumber}</span>
              </div>
            </div>
          </Card>

          <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-2xl shadow-slate-900/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] font-black uppercase text-emerald-400">Online</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed mb-4">
              Your software is up to date and all local data is encrypted for security.
            </p>
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Version</p>
                <p className="text-xs font-black italic">PRO-1.2.4</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">License</p>
                <p className="text-xs font-black italic text-primary-400">Lifetime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
