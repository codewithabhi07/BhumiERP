import { Button } from '../components/ui/Button';
import { Printer, X, Heart, Star, Sparkles } from 'lucide-react';
import type { Invoice, ShopSettings } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: ShopSettings;
  onClose: () => void;
}

export function InvoicePreview({ invoice, settings, onClose }: InvoicePreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const InvoiceContent = () => (
    <div className="flex-1 p-10 print:p-8 bg-white relative overflow-hidden h-full min-h-[280mm] border-[3px] border-slate-900 m-1 rounded-2xl print:m-0 print:border-black print:rounded-none" style={{ fontSize: '14px' }}>
      {/* Decorative Cute Element - Right Side */}
      <div className="absolute top-10 right-[-20px] rotate-12 opacity-[0.03] pointer-events-none print:opacity-[0.08]">
        <Sparkles className="w-64 h-64 text-primary-600" />
      </div>
      <div className="absolute bottom-20 right-[-10px] -rotate-12 opacity-[0.02] pointer-events-none print:opacity-[0.05]">
        <Heart className="w-48 h-48 text-rose-500" />
      </div>

      <div className="flex flex-col gap-8 relative z-10">
        {/* Shop Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black tracking-tighter text-primary-600 uppercase italic leading-none">
                {settings.shopName}
              </h1>
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 print:text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                Proprietor: {settings.ownerName}
              </p>
              <p className="text-sm font-medium text-slate-500 max-w-[350px] leading-relaxed italic">{settings.address}</p>
              <div className="flex gap-6 mt-2 pt-1">
                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">📞 {settings.phone}</p>
                {settings.gstNumber && <p className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">GST: {settings.gstNumber}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-primary-600 text-white px-6 py-2.5 text-xl font-black rounded-2xl mb-4 tracking-widest shadow-lg shadow-primary-100">TAX INVOICE</div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bill No.</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">#{invoice.invoiceNumber}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Date</p>
              <p className="text-lg font-black text-slate-900">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-2 gap-8 py-6 px-8 bg-gradient-to-r from-slate-50 to-white rounded-[2rem] border border-slate-100 relative">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Billed To</p>
            <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{invoice.customerName || 'Cash Customer'}</p>
            {invoice.customerPhone && <p className="text-sm font-bold text-primary-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              +91 {invoice.customerPhone}
            </p>}
          </div>
          <div className="text-right space-y-1.5">
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Payment Info</p>
            <div className="flex items-center justify-end gap-2">
              <div className="px-3 py-1 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-xl font-black text-green-700 uppercase tracking-tighter">{invoice.paymentMethod}</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic">Official Receipt • Status: Paid</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1">
          <table className="w-full text-left border-collapse overflow-hidden rounded-3xl">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-5 px-6 font-black uppercase tracking-widest text-[11px] rounded-tl-2xl">Item Name</th>
                <th className="py-5 px-4 text-center font-black uppercase tracking-widest text-[11px]">Qty</th>
                <th className="py-5 px-4 text-center font-black uppercase tracking-widest text-[11px]">Staff</th>
                <th className="py-5 px-4 text-right font-black uppercase tracking-widest text-[11px]">Rate (₹)</th>
                <th className="py-5 px-6 text-right font-black uppercase tracking-widest text-[11px] rounded-tr-2xl">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50 border-x border-b border-slate-100 rounded-b-2xl">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900 uppercase text-lg leading-none">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Fashion Article</p>
                  </td>
                  <td className="py-5 px-4 text-center font-black text-lg text-slate-900">{item.quantity}</td>
                  <td className="py-5 px-4 text-center font-bold text-slate-400">{item.salesmanId || '-'}</td>
                  <td className="py-5 px-4 text-right font-bold text-lg text-slate-600">₹{item.price.toFixed(0)}</td>
                  <td className="py-5 px-6 text-right font-black text-primary-600 text-lg">₹{item.total.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Footer */}
        <div className="mt-auto pt-8 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="max-w-[380px] space-y-6">
            <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-3 relative">
              <div className="absolute -top-3 -left-3 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              </div>
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Store Policies</p>
              <ul className="text-[10px] text-slate-500 font-bold space-y-1.5 leading-relaxed">
                <li className="flex gap-2">✨ No refunds once items are sold.</li>
                <li className="flex gap-2">✨ Exchange within 7 days with this receipt.</li>
                <li className="flex gap-2">✨ Fixed price policy. Quality guaranteed.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black italic text-primary-600 uppercase tracking-tighter flex items-center gap-2">
                Thank You For Shopping! <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visit us again at BHUMIKA GARMENTS</p>
            </div>
          </div>

          <div className="w-full max-w-[340px] space-y-4">
            <div className="space-y-2.5 px-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-slate-900 font-black">₹{invoice.subTotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-400 uppercase tracking-widest">
                  <span>Discount Applied</span>
                  <span className="text-rose-600 font-black">-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-xs font-bold text-primary-400 uppercase tracking-widest">
                  <span>GST Total (12%)</span>
                  <span className="text-primary-600 font-black">₹{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              {invoice.rounding !== 0 && (
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-2">
                  <span>Rounding Adj.</span>
                  <span className={invoice.rounding > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                    {invoice.rounding > 0 ? '+' : ''}₹{invoice.rounding.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-primary-600 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary-200 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Final Total</p>
                <span className="text-5xl font-black italic tracking-tighter drop-shadow-lg">₹{invoice.totalAmount.toFixed(0)}</span>
              </div>
              <div className="relative z-10 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Pay Mode</p>
                <p className="text-lg font-black uppercase tracking-tighter">{invoice.paymentMethod}</p>
              </div>
            </div>

            <div className="pt-16 text-center space-y-2">
              <div className="h-0.5 w-48 bg-slate-900 mx-auto rounded-full" />
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] pl-1">Authorized Sign</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white overflow-y-auto">
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: white !important; }
            .print-hidden { display: none !important; }
            .bill-page { 
              padding: 10mm !important;
              height: 297mm !important;
              width: 210mm !important;
              box-sizing: border-box !important;
            }
          }
        `}
      </style>
      
      <div className="flex flex-col h-full max-h-[95vh] w-full max-w-4xl bg-white shadow-2xl rounded-[3rem] overflow-hidden print:shadow-none print:rounded-none my-auto border border-white/20">
        {/* UI Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-slate-100 px-10 py-6 print-hidden shrink-0 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter italic">Bhumika <span className="text-primary-600 text-3xl">Pro</span> Bill</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Premium Designer Layout Ready
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="gap-3 h-14 px-10 rounded-[1.25rem] font-black uppercase text-sm shadow-2xl shadow-primary-200 bg-primary-600 hover:bg-primary-700 hover:scale-[1.02] transition-all" onClick={handlePrint}>
              <Printer className="h-6 w-6" /> Print Invoice
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 group">
              <X className="h-7 w-7 transition-transform group-hover:rotate-90" />
            </Button>
          </div>
        </div>

        {/* Invoice Copy for Printing */}
        <div className="flex-1 overflow-y-auto print:overflow-visible bg-slate-50/50">
          <div className="bill-page bg-white shadow-sm print:shadow-none mx-auto">
            <InvoiceContent />
          </div>
        </div>
      </div>
    </div>
  );
}
