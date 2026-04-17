'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProductStore } from '../../store/useProductStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SecurityWrapper } from '../../components/layout/SecurityWrapper';
import { 
  Store, 
  MapPin, 
  Phone, 
  FileText, 
  Save,
  Download,
  Upload,
  ShieldCheck,
  Zap,
  Globe,
  Settings as SettingsIcon,
  Lock,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { cn } from '../../utils/cn';

import { SalesmenManagement } from './SalesmenManagement';

export default function SettingsPage() {
  const { settings, updateSettings, customers, employees, salaryPayments, invoices, attendance, leaveRequests, importData } = useAppStore();
  const { products, importProducts } = useProductStore();
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      leaveRequests,
      products 
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BHUMIKA_ERP_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('This will replace ALL current data with the backup file. Are you sure?')) {
          importData(data);
          if (data.products) {
            importProducts(data.products);
          }
          alert('Data restored successfully!');
        }
      } catch (err) {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <SecurityWrapper>
      <div className="space-y-8 max-w-5xl mx-auto animate-slide-up pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
              <span className="p-2 bg-slate-600 rounded-xl shadow-lg shadow-slate-200">
                <SettingsIcon className="h-6 w-6 text-white" />
              </span>
              System <span className="text-slate-600">Configuration</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Master Control Terminal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-[10px] border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-lg" onClick={handleExportData}>
              <Download className="h-4 w-4 text-primary-600" /> Backup
            </Button>
            <Button variant="outline" className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-[10px] border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-lg" onClick={handleImportClick}>
              <Upload className="h-4 w-4 text-emerald-600" /> Restore
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card title="Business Identity" description="Official shop details for all invoices" className="shadow-2xl border-none rounded-[2.5rem]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Shop Name" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="h-12 bg-slate-50 border-none uppercase" />
                  <Input label="Proprietor Name" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="h-12 bg-slate-50 border-none uppercase font-bold" />
                </div>
                <Input label="Complete Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 bg-slate-50 border-none italic" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Business Contact" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 bg-slate-50 border-none font-bold" />
                  <Input label="GSTIN Identification" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="h-12 bg-slate-50 border-none font-mono" />
                </div>
              </div>
            </Card>

            <Card title="Security & Hardware" description="System access and printer hardware settings" className="shadow-2xl border-none rounded-[2.5rem]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security PIN (4-Digits)</span>
                  </div>
                  <Input 
                    type="password" maxLength={4} 
                    placeholder="Set 4-digit PIN"
                    value={formData.pin || ''} 
                    onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
                    className="h-14 text-center text-2xl font-black tracking-[1em] bg-slate-50 border-none" 
                  />
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">This PIN will be required to access Reports, Salaries, and Settings.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Printer className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Invoice Print Format</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setFormData({...formData, invoiceType: 'A4 Half'})}
                      className={cn(
                        "h-14 rounded-2xl font-black text-xs uppercase transition-all border-2",
                        formData.invoiceType === 'A4 Half' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-50 text-slate-400 border-transparent"
                      )}
                    >
                      Standard A4 Half Page
                    </button>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-center">Select your connected printer type.</p>
                </div>
              </div>
            </Card>

            <Card title="Inventory Management" description="Stock alert thresholds" className="shadow-2xl border-none rounded-[2.5rem]">
              <div className="space-y-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Low Stock Alert Level</span>
                </div>
                <Input 
                  type="number" 
                  value={formData.lowStockThreshold || ''} 
                  onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} 
                  className="h-14 text-center text-2xl font-black bg-slate-50 border-none" 
                />
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">System will show red alert for items with quantity below this value.</p>
              </div>
            </Card>

            <SalesmenManagement />

            <Card title="Data Management" description="Local backup and sync settings" className="shadow-2xl border-none rounded-[2.5rem]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-100 space-y-4 group hover:bg-amber-100 transition-colors">
                  <div className="flex items-center gap-3 text-amber-700">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck className="h-5 w-5" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Local Backup</span>
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold leading-relaxed uppercase opacity-70 tracking-tighter">Download entire shop database to your hard drive every day for safety.</p>
                  <Button className="w-full h-11 text-[10px] font-black uppercase tracking-widest bg-amber-600 shadow-xl shadow-amber-200" onClick={handleExportData}>Download Data File</Button>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 space-y-4 group hover:bg-emerald-100 transition-colors">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Upload className="h-5 w-5" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Restore Data</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold leading-relaxed uppercase opacity-70 tracking-tighter">Upload a previous backup file to restore your entire shop database.</p>
                  <Button className="w-full h-11 text-[10px] font-black uppercase tracking-widest bg-emerald-600 shadow-xl shadow-emerald-200" onClick={handleImportClick}>Select Backup File</Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button className="gap-3 px-12 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl bg-primary-600 shadow-primary-200 hover:scale-105 transition-all" onClick={handleSave}>
                <Save className="h-6 w-6" /> Commit All Settings
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <Card title="Live Brand Preview" className="bg-slate-50/50 border-none shadow-xl rounded-[2.5rem]">
              <div className="flex flex-col items-center py-8">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-primary-200 mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                  <Store className="h-12 w-12" />
                </div>
                <h3 className="font-black text-slate-900 uppercase italic text-center leading-tight tracking-tighter text-2xl">{formData.shopName || "BHUMIKA"}</h3>
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mt-2 italic">{formData.ownerName || "OWNER"}</p>
              </div>
              <div className="border-t border-slate-200 mt-4 pt-8 space-y-5">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                  <span className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-tight">{formData.address || "Shop Address"}</span>
                </div>
                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-black text-slate-500 uppercase leading-relaxed">+91 {formData.phone || "0000000000"}</span>
                </div>
                <div className="flex gap-4">
                  <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="text-[10px] font-black text-slate-500 uppercase leading-relaxed font-mono">GST: {formData.gstNumber || "NOT-SET"}</span>
                </div>
              </div>
            </Card>

            <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 p-10 opacity-5 group-hover:scale-110 transition-transform"><Zap className="h-32 w-32" /></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                    <span className="text-[10px] font-black uppercase text-emerald-400">PRO Mode</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-6 italic">
                  BhumiERP is running in secure offline mode. All your data is saved only on this machine.
                </p>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mb-1">Current Build</p>
                    <p className="text-xs font-black italic text-primary-400 uppercase">v1.3.6-PRO</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mb-1">System Architecture</p>
                    <p className="text-xs font-black italic text-indigo-400 uppercase">64-Bit Local</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecurityWrapper>
  );
}
