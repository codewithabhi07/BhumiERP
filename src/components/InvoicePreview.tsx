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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white overflow-y-auto">
      <div className="flex min-h-fit w-full max-w-2xl flex-col bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none my-auto">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 print:hidden shrink-0">
          <h3 className="text-lg font-bold text-slate-900">Final Bill</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print (Ctrl+P)
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 p-8 print:p-4" id="printable-invoice">
          <div className="flex flex-col gap-6">
            {/* Shop Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter text-primary-600 uppercase italic leading-none">
                  {settings.shopName}
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-1">Proprietor: {settings.ownerName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Quality Garments for all</p>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="max-w-[200px] leading-relaxed">{settings.address}</p>
                  <p className="font-bold">Contact: {settings.phone}</p>
                  {settings.gstNumber && <p className="font-bold">GST: {settings.gstNumber}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-3 py-1 text-sm font-bold inline-block rounded mb-3">INVOICE</div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bill No.</p>
                <p className="text-sm font-black text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Date</p>
                <p className="text-sm font-black text-slate-900">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 border-y border-slate-200 py-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
                <p className="font-black text-slate-900">{invoice.customerName}</p>
                {invoice.customerPhone && <p className="text-xs font-bold text-slate-600">Mob: +91 {invoice.customerPhone}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales & Payment</p>
                <p className="font-black text-slate-900 uppercase">Sales: {invoice.salesmanName || 'N/A'}</p>
                <p className="font-black text-green-700 uppercase">{invoice.paymentMethod}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="w-full">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900">
                    <th className="py-2 font-black uppercase tracking-widest">Item Description</th>
                    <th className="py-2 text-center font-black uppercase tracking-widest">Qty</th>
                    <th className="py-2 text-right font-black uppercase tracking-widest">Rate</th>
                    <th className="py-2 text-right font-black uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-3">
                        <p className="font-bold text-slate-900 uppercase">{item.name}</p>
                        {item.color && <p className="text-[10px] font-medium text-slate-500">{item.color}</p>}
                      </td>
                      <td className="py-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 text-right font-bold">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 text-right font-black text-slate-900">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-4">
              <div className="w-full max-w-[240px] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest">Gross Amount</span>
                  <span className="text-slate-900">₹{invoice.subTotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Discount</span>
                    <span className="text-red-600">-₹{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">GST (12%)</span>
                    <span className="text-slate-900">₹{invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {invoice.rounding !== 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-widest">Adjustment</span>
                    <span className={invoice.rounding > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {invoice.rounding > 0 ? '+' : ''}₹{invoice.rounding.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="h-0.5 bg-slate-900 my-2" />
                <div className="flex justify-between text-xl font-black italic">
                  <span className="text-slate-900 uppercase tracking-tighter">Net Payable</span>
                  <span className="text-primary-600 leading-none">₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms & Footer */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-end">
                <div className="space-y-4 max-w-[300px]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-900 uppercase underline decoration-primary-300">Terms & Conditions:</p>
                    <ul className="text-[9px] text-slate-500 space-y-0.5 font-medium list-disc ml-3">
                      <li>Goods once sold will not be taken back.</li>
                      <li>Exchange within 7 days with original bill.</li>
                      <li>No guarantee on color or wash for cotton items.</li>
                    </ul>
                  </div>
                  <p className="text-xs font-black italic text-primary-600">Thank you for shopping at BHUMIKA GARMENTS!</p>
                </div>
                <div className="text-right space-y-12">
                  <div className="h-px w-40 bg-slate-300 ml-auto" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
