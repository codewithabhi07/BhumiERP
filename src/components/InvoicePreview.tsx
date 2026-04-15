import { Button } from '../components/ui/Button';
import { Printer, X } from 'lucide-react';
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
    <div className="flex-1 p-8 print:p-6 bg-white border-2 border-slate-900 m-2 rounded-lg relative overflow-hidden" style={{ fontSize: '14px' }}>
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-600 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-600 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-600 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-600 rounded-br-lg" />

      <div className="flex flex-col gap-6 relative z-10">
        {/* Shop Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-primary-600 uppercase italic leading-none">
              {settings.shopName}
            </h1>
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-4">The Premium Garment Hub</p>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-black text-slate-800 uppercase tracking-tighter">Proprietor: {settings.ownerName}</p>
              <p className="max-w-[250px] leading-relaxed font-medium">{settings.address}</p>
              <div className="flex gap-4 mt-1">
                <p className="font-bold">Mob: {settings.phone}</p>
                {settings.gstNumber && <p className="font-bold">GST: {settings.gstNumber}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-primary-600 text-white px-5 py-2 text-xl font-black inline-block rounded-xl mb-3 tracking-widest shadow-lg shadow-primary-100">INVOICE</div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Number</p>
              <p className="text-xl font-black text-slate-900">{invoice.invoiceNumber}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Billing Date</p>
              <p className="text-lg font-black text-slate-900">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Billed To:</p>
            <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{invoice.customerName}</p>
            {invoice.customerPhone && <p className="text-sm font-bold text-primary-600 mt-0.5">Contact: +91 {invoice.customerPhone}</p>}
          </div>
          <div className="text-right flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Method:</p>
            <div className="flex items-center justify-end gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xl font-black text-green-700 uppercase tracking-tighter">{invoice.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-4 border-slate-900 text-slate-900">
                <th className="py-3 font-black uppercase tracking-[0.1em] pl-2">Item Description</th>
                <th className="py-3 text-center font-black uppercase tracking-[0.1em]">Qty</th>
                <th className="py-3 text-center font-black uppercase tracking-[0.1em]">S.Man</th>
                <th className="py-3 text-right font-black uppercase tracking-[0.1em]">Rate</th>
                <th className="py-3 text-right font-black uppercase tracking-[0.1em] pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="text-slate-800 group">
                  <td className="py-4 pl-2">
                    <p className="font-black text-slate-900 uppercase text-base tracking-tight">{item.name}</p>
                    {item.color && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.color}</p>}
                  </td>
                  <td className="py-4 text-center font-black text-base">{item.quantity}</td>
                  <td className="py-4 text-center font-bold text-slate-500">{item.salesmanId || '-'}</td>
                  <td className="py-4 text-right font-bold text-base">₹{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-black text-slate-900 text-base pr-2">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-full max-w-[300px] space-y-2.5 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-inner">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-slate-900 font-black">₹{invoice.subTotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400 uppercase tracking-widest">Cash Discount</span>
                <span className="text-rose-600 font-black">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-xs font-bold">
                <span className="text-primary-400 uppercase tracking-widest">GST (12%)</span>
                <span className="text-primary-600 font-black">₹{invoice.tax.toFixed(2)}</span>
              </div>
            )}
            {invoice.rounding !== 0 && (
              <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-400 uppercase tracking-widest">Round Adj.</span>
                <span className={invoice.rounding > 0 ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                  {invoice.rounding > 0 ? '+' : ''}₹{invoice.rounding.toFixed(2)}
                </span>
              </div>
            )}
            <div className="h-1 bg-slate-900 my-2 rounded-full" />
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Net Total</span>
              <span className="text-4xl font-black italic tracking-tighter text-primary-600 leading-none">₹{invoice.totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="mt-auto border-t-4 border-double border-slate-900 pt-6">
          <div className="flex justify-between items-end">
            <div className="space-y-5 max-w-[400px]">
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-900 uppercase underline decoration-primary-300 tracking-widest">Store Policy:</p>
                <ul className="text-[9px] text-slate-500 space-y-1 font-bold list-none">
                  <li className="flex gap-2 items-center"><div className="h-1 w-1 bg-primary-500 rounded-full" /> No refunds once items are sold.</li>
                  <li className="flex gap-2 items-center"><div className="h-1 w-1 bg-primary-500 rounded-full" /> Exchange allowed within 7 days with this bill.</li>
                  <li className="flex gap-2 items-center"><div className="h-1 w-1 bg-primary-500 rounded-full" /> Fixed price shop. No further bargaining.</li>
                </ul>
              </div>
              <p className="text-base font-black italic text-primary-600 uppercase tracking-tighter">✨ Thank you for choosing BHUMIKA GARMENTS! ✨</p>
            </div>
            <div className="text-right space-y-16 pb-2 pr-2">
              <div className="space-y-1">
                <div className="h-0.5 w-48 bg-slate-900 ml-auto" />
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none text-center pl-4">Authorized Signature</p>
              </div>
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
            body { margin: 0; padding: 0; }
            .print-container { 
              display: flex !important; 
              flex-direction: column !important;
              height: 297mm !important;
              width: 210mm !important;
              background: white !important;
            }
            .bill-half {
              height: 148.5mm !important;
              overflow: hidden !important;
              border-bottom: 2px dashed #000 !important;
              padding: 5mm !important;
            }
            .bill-half:last-child {
              border-bottom: none !important;
            }
          }
        `}
      </style>
      
      <div className="flex flex-col h-full max-h-[95vh] w-full max-w-4xl bg-white shadow-2xl rounded-[3rem] overflow-hidden print:shadow-none print:rounded-none my-auto border border-white/20">
        {/* UI Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-slate-100 px-10 py-6 print:hidden shrink-0 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Premium Print <span className="text-primary-600">Terminal</span></h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              A4 Dual-Copy Layout Ready
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="gap-3 h-14 px-10 rounded-[1.25rem] font-black uppercase text-sm shadow-2xl shadow-primary-200 bg-primary-600 hover:bg-primary-700 hover:scale-[1.02] transition-all" onClick={handlePrint}>
              <Printer className="h-6 w-6" /> Print 2 Copies
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 group">
              <X className="h-7 w-7 transition-transform group-hover:rotate-90" />
            </Button>
          </div>
        </div>

        {/* Invoice Copies for Printing */}
        <div className="flex-1 overflow-y-auto print:overflow-visible print-container bg-slate-50/50">
          <div className="bill-half">
            <InvoiceContent />
          </div>
          <div className="bill-half">
            <InvoiceContent />
          </div>
        </div>
      </div>
    </div>
  );
}
