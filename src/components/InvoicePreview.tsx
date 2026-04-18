import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Printer, X } from 'lucide-react';
import type { Invoice, ShopSettings, InvoiceItem } from '../types';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: ShopSettings;
  onClose: () => void;
}

export function InvoicePreview({ invoice, settings, onClose }: InvoicePreviewProps) {
  // Lock to A4 Half Landscape format as requested
  const ITEMS_PER_PAGE = 10;

  const handlePrint = () => {
    window.print();
  };

  const itemChunks = useMemo(() => {
    const chunks: InvoiceItem[][] = [];
    for (let i = 0; i < invoice.items.length; i += ITEMS_PER_PAGE) {
      chunks.push(invoice.items.slice(i, i + ITEMS_PER_PAGE));
    }
    if (chunks.length === 0) chunks.push([]);
    return chunks;
  }, [invoice.items, ITEMS_PER_PAGE]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-md print:bg-white print:p-0 overflow-y-auto">
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait; /* Using portrait paper to print on top half */
              margin: 0 !important;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              width: 210mm !important;
              height: 297mm !important;
              display: block !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-hidden {
              display: none !important;
            }

            /* Half A4 Page Container (Landscape Style) */
            .bill-page {
              width: 210mm !important;
              height: 148.5mm !important; /* Exactly half of 297mm */
              padding: 8mm 12mm !important;
              box-sizing: border-box !important;
              background: white !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
              position: relative !important;
              page-break-after: always !important;
              break-after: page !important;
            }

            .bill-page:last-child {
              page-break-after: auto !important;
            }
          }
        `}
      </style>

      <div className="flex flex-col w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none my-auto">
        <div className="print-hidden flex items-center justify-between border-b border-slate-100 px-10 py-6 shrink-0 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              BHUMIKA <span className="text-primary-600 italic">ERP</span>
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2 font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Professional Half-Page Landscape Format
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              className="gap-3 h-14 px-10 rounded-[1.25rem] font-black uppercase text-sm shadow-2xl shadow-primary-200 bg-primary-600 hover:bg-primary-700"
              onClick={handlePrint}
            >
              <Printer className="h-6 w-6" /> Confirm Print
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="h-7 w-7" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 print:bg-white p-10 print:p-0">
          {itemChunks.map((chunk, idx) => (
            <div key={idx} className="bill-page shadow-2xl shadow-slate-300/50 mb-12 print:shadow-none print:m-0 mx-auto bg-white">
              <div className="flex flex-col h-full relative text-black">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-300 pb-2 mb-3">
                  <div className="space-y-0.5">
                    <h1 className="text-2xl font-black uppercase italic leading-none text-slate-900">{settings.shopName}</h1>
                    <p className="font-bold text-primary-600 uppercase tracking-widest text-[9px]">{settings.ownerName} (Proprietor)</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-medium text-slate-500 uppercase leading-tight max-w-[450px]">{settings.address}</p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase">Phone: +91 {settings.phone}</p>
                      {settings.gstNumber && <p className="text-[10px] font-bold text-slate-700 uppercase leading-none">GSTIN: {settings.gstNumber}</p>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end pt-1">
                    <div className="border border-slate-400 px-3 py-0.5 rounded mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Tax Invoice</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Invoice No</p>
                      <p className="text-lg font-black italic tracking-tighter leading-none">{invoice.invoiceNumber}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-1">Date</p>
                      <p className="text-[10px] font-bold text-slate-800 uppercase leading-none">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Customer:</span>
                    <p className="text-[11px] font-black uppercase tracking-tight leading-none mt-0.5">{invoice.customerName || 'Walk-in Customer'}</p>
                    {invoice.customerPhone && <p className="text-[9px] font-bold text-slate-500 mt-1">Mob: {invoice.customerPhone}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Payment:</span>
                    <p className="text-[10px] font-black uppercase italic text-slate-700 mt-0.5">BY {invoice.paymentMethod}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50/50">
                        <th className="py-1 px-1 text-[9px] font-black uppercase text-slate-500 w-8 text-center border-r border-slate-200">Sr.</th>
                        <th className="py-1 px-2 text-[9px] font-black uppercase text-slate-500 border-r border-slate-200">Description</th>
                        <th className="py-1 px-1 text-[9px] font-black uppercase text-slate-500 w-10 text-center border-r border-slate-200">S.M</th>
                        <th className="py-1 px-1 text-[9px] font-black uppercase text-slate-500 w-16 text-center border-r border-slate-200">Rate</th>
                        <th className="py-1 px-1 text-[9px] font-black uppercase text-slate-500 w-10 text-center border-r border-slate-200">Qty</th>
                        <th className="py-1 px-2 text-[9px] font-black uppercase text-slate-500 w-20 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.map((item: any, cIdx: number) => (
                        <tr key={cIdx} className="border-b border-slate-100">
                          <td className="py-1 px-1 text-[10px] font-medium text-center border-r border-slate-100">{idx * ITEMS_PER_PAGE + cIdx + 1}</td>
                          <td className="py-1 px-2 text-[10px] font-bold uppercase italic border-r border-slate-100">{item.name}</td>
                          <td className="py-1 px-1 text-[9px] font-bold text-slate-400 text-center border-r border-slate-100">#{item.salesmanId}</td>
                          <td className="py-1 px-1 text-[10px] font-medium text-center border-r border-slate-100">{item.price.toLocaleString()}</td>
                          <td className="py-1 px-1 text-[10px] font-black text-center border-r border-slate-100">{item.quantity}</td>
                          <td className="py-1 px-2 text-[10px] font-black text-right">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="pt-3">
                  <div className="flex justify-between items-end gap-6">
                    <div className="flex-1">
                      <div className="border border-slate-300 p-2 rounded-lg bg-slate-50/30 flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Payable Amount</span>
                        <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">₹{invoice.totalAmount.toLocaleString()}</h2>
                      </div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">
                        * NO REFUND. EXCHANGE WITHIN 7 DAYS ONLY WITH BILL. COTTON COLOUR NOT GUARANTEED.
                      </p>
                    </div>
                    <div className="w-40 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold uppercase">
                        <span className="text-slate-500 tracking-tighter">Gross Total</span>
                        <span className="text-slate-900">₹{invoice.subTotal.toLocaleString()}</span>
                      </div>
                      {invoice.discount > 0 && (
                        <div className="flex justify-between text-[9px] font-black text-rose-600 italic">
                          <span className="tracking-tighter">Discount (-)</span>
                          <span>₹{invoice.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {invoice.tax > 0 && (
                        <div className="flex justify-between text-[9px] font-bold text-slate-700">
                          <span className="tracking-tighter">GST (12%)</span>
                          <span>₹{invoice.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-300 text-center">
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 text-center pt-1 border-t border-slate-100 opacity-60">
                   <p className="text-[8px] font-black tracking-[0.4em] uppercase italic">✨ THANK YOU FOR SHOPPING AT BHUMIKA ✨</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
