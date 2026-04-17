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
  const isA4Half = settings.invoiceType === 'A4 Half';
  const ITEMS_PER_PAGE = isA4Half ? 10 : 22;

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
              size: A4 portrait;
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

            .a4-container {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
              display: block !important;
              background: white !important;
            }

            .bill-content {
              width: 210mm !important;
              height: ${isA4Half ? '148.5mm' : '297mm'} !important;
              padding: 5mm 15mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              background: white !important;
            }
          }
        `}
      </style>

      <div className="flex flex-col w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:h-auto my-auto">
        <div className="print-hidden flex items-center justify-between border-b border-slate-100 px-10 py-6 shrink-0 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              BHUMIKA <span className="text-primary-600 italic">ERP</span>
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2 font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Standard Ink-Saver Layout
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
            <div key={idx} className="a4-container shadow-2xl shadow-slate-300/50 mb-12 print:shadow-none print:m-0 mx-auto bg-white">
              <div className="bill-content">
                <InvoicePage 
                  chunk={chunk} 
                  pageIdx={idx} 
                  totalPages={itemChunks.length} 
                  settings={settings} 
                  invoice={invoice} 
                  isA4Half={isA4Half}
                  ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InvoicePage({ chunk, pageIdx, totalPages, settings, invoice, isA4Half, ITEMS_PER_PAGE }: any) {
  return (
    <div className="flex flex-col h-full bg-white relative text-black">
      {/* Header - Ink Saver */}
      <div className="flex justify-between items-start border-b-2 border-slate-300 pb-3 mb-4">
        <div className="space-y-0.5">
          <h1 className={cn("font-black uppercase italic leading-none text-slate-900", isA4Half ? "text-3xl" : "text-5xl")}>
            {settings.shopName}
          </h1>
          <p className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">
            {settings.ownerName} (Proprietor)
          </p>
          <div className="pt-2 space-y-0.5">
            <p className="text-[10px] font-medium text-slate-500 uppercase leading-tight max-w-[400px]">{settings.address}</p>
            <p className="text-[10px] font-bold text-slate-700 uppercase">Phone: +91 {settings.phone}</p>
            {settings.gstNumber && <p className="text-[10px] font-bold text-slate-700 uppercase">GSTIN: {settings.gstNumber}</p>}
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="border border-slate-400 px-4 py-1 rounded-md mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Tax Invoice</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Invoice No</p>
            <p className="text-xl font-black italic tracking-tighter leading-none text-slate-800">{invoice.invoiceNumber}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-2">Date</p>
            <p className="text-[10px] font-bold text-slate-800 uppercase leading-none">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 rounded-xl mb-4">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer:</p>
          <p className="text-base font-black uppercase tracking-tight text-slate-800">{invoice.customerName || 'Cash Customer'}</p>
          {invoice.customerPhone && <p className="text-[10px] font-medium text-slate-600">Contact: +91 {invoice.customerPhone}</p>}
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method:</p>
          <p className="text-sm font-black uppercase italic text-slate-700">{invoice.paymentMethod}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        <table className="w-full text-left border-collapse border-b-2 border-slate-300">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-300">
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-200 w-8 text-center">Sr.</th>
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-200">Item Description</th>
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-200 text-center w-10">S.M</th>
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-200 text-center w-16">Rate</th>
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-200 text-center w-10">Qty</th>
              <th className="py-2 px-2 text-[9px] font-black uppercase tracking-widest text-right w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {chunk.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-2 px-2 text-[10px] font-medium border-r border-slate-100 text-center">{pageIdx * ITEMS_PER_PAGE + idx + 1}</td>
                <td className="py-2 px-2 text-[10px] font-bold uppercase italic border-r border-slate-100 text-slate-700">{item.name}</td>
                <td className="py-2 px-2 text-[9px] font-bold text-slate-400 border-r border-slate-100 text-center">#{item.salesmanId}</td>
                <td className="py-2 px-2 text-[10px] font-medium border-r border-slate-100 text-center">{item.price.toLocaleString()}</td>
                <td className="py-2 px-2 text-[10px] font-bold border-r border-slate-100 text-center text-slate-700">{item.quantity}</td>
                <td className="py-2 px-2 text-[10px] font-bold text-right text-slate-800">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section - No Solid Black */}
      <div className="pt-4 mt-2">
        <div className="flex justify-between items-end gap-10">
          <div className="flex-1 space-y-3">
            <div className="border-2 border-slate-800 p-4 rounded-xl flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Grand Total</p>
                <p className="text-[8px] font-bold uppercase text-slate-400 italic">Inclusive of all adjustments</p>
              </div>
              <div className="text-right">
                <h2 className={cn("font-black italic tracking-tighter leading-none text-slate-900", isA4Half ? "text-3xl" : "text-5xl")}>
                  ₹{invoice.totalAmount.toLocaleString()}
                </h2>
              </div>
            </div>
            <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight italic">
              Terms: Goods once sold will not be taken back. Exchange allowed within 7 days.
            </p>
          </div>

          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900 font-bold">₹{invoice.subTotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-600 italic">
                <span>Discount (-)</span>
                <span>₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-2 mt-4 border-t border-slate-300 text-center">
              <div className="h-10 flex items-end justify-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center border-t border-slate-100 pt-2">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase italic text-slate-500">Thank You! Visit Again</p>
        <p className="text-[8px] font-bold text-slate-300 mt-0.5 uppercase tracking-widest">{pageIdx + 1} / {totalPages}</p>
      </div>
    </div>
  );
}
