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
    <div className="flex-1 p-8 print:p-4 bg-white" style={{ fontSize: '14px' }}>
      <div className="flex flex-col gap-6">
        {/* Shop Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-primary-600 uppercase italic leading-none">
              {settings.shopName}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Quality Garments for all</p>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-800">Proprietor: {settings.ownerName}</p>
              <p className="max-w-[250px] leading-relaxed">{settings.address}</p>
              <p className="font-bold">Contact: {settings.phone}</p>
              {settings.gstNumber && <p className="font-bold">GST: {settings.gstNumber}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-4 py-1.5 text-lg font-black inline-block rounded mb-3 tracking-widest">INVOICE</div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bill No.</p>
            <p className="text-lg font-black text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Date</p>
            <p className="text-lg font-black text-slate-900">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 border-y-2 border-slate-900 py-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
            <p className="text-lg font-black text-slate-900 uppercase">{invoice.customerName}</p>
            {invoice.customerPhone && <p className="text-sm font-bold text-slate-600">Mob: +91 {invoice.customerPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sales & Payment</p>
            <p className="text-sm font-black text-slate-900 uppercase">Salesman: {invoice.salesmanName || 'N/A'}</p>
            <p className="text-lg font-black text-green-700 uppercase">{invoice.paymentMethod}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="py-3 font-black uppercase tracking-widest">Item Description</th>
                <th className="py-3 text-center font-black uppercase tracking-widest">Qty</th>
                <th className="py-3 text-right font-black uppercase tracking-widest">Rate</th>
                <th className="py-3 text-right font-black uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="text-slate-800">
                  <td className="py-4">
                    <p className="font-black text-slate-900 uppercase text-base">{item.name}</p>
                    {item.color && <p className="text-xs font-bold text-slate-500">{item.color}</p>}
                  </td>
                  <td className="py-4 text-center font-black text-base">{item.quantity}</td>
                  <td className="py-4 text-right font-bold text-base">₹{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-black text-slate-900 text-base">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-full max-w-[280px] space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-500 uppercase tracking-widest">Gross Amount</span>
              <span className="text-slate-900 font-black">₹{invoice.subTotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Discount</span>
                <span className="text-rose-600 font-black">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest">GST (12%)</span>
                <span className="text-slate-900 font-black">₹{invoice.tax.toFixed(2)}</span>
              </div>
            )}
            {invoice.rounding !== 0 && (
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Adjustment</span>
                <span className={invoice.rounding > 0 ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                  {invoice.rounding > 0 ? '+' : ''}₹{invoice.rounding.toFixed(2)}
                </span>
              </div>
            )}
            <div className="h-0.5 bg-slate-900 my-2" />
            <div className="flex justify-between text-3xl font-black italic">
              <span className="text-slate-900 uppercase tracking-tighter">TOTAL</span>
              <span className="text-primary-600 leading-none">₹{invoice.totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="mt-8 border-t-2 border-slate-900 pt-6">
          <div className="flex justify-between items-end">
            <div className="space-y-4 max-w-[350px]">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase underline decoration-primary-300">Terms & Conditions:</p>
                <ul className="text-[10px] text-slate-600 space-y-0.5 font-bold list-disc ml-4">
                  <li>Goods once sold will not be taken back.</li>
                  <li>Exchange within 7 days with original bill.</li>
                  <li>No guarantee on color or wash for cotton items.</li>
                </ul>
              </div>
              <p className="text-sm font-black italic text-primary-600 uppercase">Thank you for shopping at BHUMIKA GARMENTS!</p>
            </div>
            <div className="text-right space-y-14">
              <div className="h-0.5 w-48 bg-slate-900 ml-auto" />
              <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Authorized Signatory</p>
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
            }
            .bill-half {
              height: 148.5mm !important;
              overflow: hidden !important;
              border-bottom: 1px dashed #000 !important;
            }
            .bill-half:last-child {
              border-bottom: none !important;
            }
          }
        `}
      </style>
      
      <div className="flex flex-col h-full max-h-[95vh] w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none my-auto">
        {/* UI Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 print:hidden shrink-0 bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic">A4 Half-Size Preview</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Will print 2 copies on one A4 sheet</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl font-black uppercase text-sm border-2 border-slate-200" onClick={handlePrint}>
              <Printer className="h-5 w-5" /> Print Bill
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Invoice Copies for Printing */}
        <div className="flex-1 overflow-y-auto print:overflow-visible print-container">
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
