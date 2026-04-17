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
  
  // REDUCED ITEMS PER PAGE: 8 items for half page ensures price/totals are never pushed off the paper
  const ITEMS_PER_PAGE = isA4Half ? 8 : 22;

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
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-hidden {
              display: none !important;
            }

            /* The physical A4 sheet */
            .a4-container {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
              background: white !important;
              display: block !important;
            }

            /* The actual Bill content - reduced height to 142mm to leave 6mm safety margin at bottom */
            .bill-content {
              width: 210mm !important;
              height: ${isA4Half ? '142mm' : '290mm'} !important;
              padding: 10mm 15mm 5mm 15mm !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              display: flex !important;
              flex-direction: column !important;
              background: white !important;
              position: relative !important;
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
              {isA4Half ? 'Safe-Print A4 Half Mode' : 'Standard Full A4 Mode'}
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
      {/* Header */}
      <div className={cn("flex justify-between items-start border-b-2 border-black", isA4Half ? "pb-2 mb-2" : "pb-4 mb-4")}>
        <div className="space-y-0.5">
          <h1 className={cn("font-black uppercase italic leading-none text-slate-900", isA4Half ? "text-3xl" : "text-5xl")}>
            {settings.shopName}
          </h1>
          <p className={cn("font-black text-primary-600 uppercase tracking-widest", isA4Half ? "text-[10px]" : "text-sm")}>
            {settings.ownerName} (Proprietor)
          </p>
          <div className={cn("space-y-0.5", isA4Half ? "pt-1" : "pt-2")}>
            <p className="text-[10px] font-bold text-slate-600 uppercase leading-tight max-w-[450px]">{settings.address}</p>
            <div className="flex gap-4">
              <p className="text-[11px] font-black uppercase">Phone: +91 {settings.phone}</p>
              {settings.gstNumber && <p className="text-[11px] font-black uppercase">GSTIN: {settings.gstNumber}</p>}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="bg-black text-white px-4 py-1 rounded-lg mb-2 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest">Tax Invoice</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Invoice No</p>
            <p className="text-xl font-black italic tracking-tighter leading-none">{invoice.invoiceNumber}</p>
            <p className="text-[11px] font-black uppercase leading-none mt-2">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className={cn("grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200", isA4Half ? "p-2 rounded-xl mb-2" : "p-4 rounded-2xl mb-4")}>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Customer:</p>
          <p className="text-base font-black uppercase tracking-tight">{invoice.customerName || 'Cash Customer'}</p>
          {invoice.customerPhone && <p className="text-[10px] font-bold text-slate-500">Contact: +91 {invoice.customerPhone}</p>}
        </div>
        <div className="text-right flex flex-col justify-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment:</p>
          <p className="text-sm font-black uppercase italic tracking-widest text-primary-600">{invoice.paymentMethod}</p>
        </div>
      </div>

      {/* Items Table - flex-1 ensures it takes available space but doesn't push others */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left border-collapse border-b-2 border-black">
          <thead>
            <tr className="bg-slate-100 border-y-2 border-black">
              <th className="py-1.5 px-2 text-[10px] font-black uppercase border-r border-slate-300 w-10 text-center">Sr.</th>
              <th className="py-1.5 px-3 text-[10px] font-black uppercase border-r border-slate-300">Description</th>
              <th className="py-1.5 px-2 text-[10px] font-black uppercase border-r border-slate-300 text-center w-12">Staff</th>
              <th className="py-1.5 px-2 text-[10px] font-black uppercase border-r border-slate-300 text-center w-16">Rate</th>
              <th className="py-1.5 px-2 text-[10px] font-black uppercase border-r border-slate-300 text-center w-10">Qty</th>
              <th className="py-1.5 px-3 text-[10px] font-black uppercase text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {chunk.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-1 px-2 text-[11px] font-bold border-r border-slate-200 text-center">{pageIdx * ITEMS_PER_PAGE + idx + 1}</td>
                <td className="py-1 px-3 text-[11px] font-black uppercase italic border-r border-slate-200">{item.name}</td>
                <td className="py-1 px-2 text-[10px] font-black text-slate-400 border-r border-slate-200 text-center">#{item.salesmanId}</td>
                <td className="py-1 px-2 text-[11px] font-bold border-r border-slate-200 text-center">{item.price.toLocaleString()}</td>
                <td className="py-1 px-2 text-[11px] font-black border-r border-slate-200 text-center">{item.quantity}</td>
                <td className="py-1 px-3 text-[11px] font-black text-right">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section - This is now guaranteed to be inside 142mm */}
      <div className={cn("border-t-2 border-black", isA4Half ? "pt-2" : "pt-4")}>
        <div className="flex justify-between items-end gap-8">
          <div className="flex-1 space-y-2">
            <div className="bg-black text-white p-3 rounded-xl flex justify-between items-center shadow-lg">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Net Payable</p>
              </div>
              <div className="text-right">
                <h2 className={cn("font-black italic tracking-tighter leading-none", isA4Half ? "text-3xl" : "text-5xl")}>
                  ₹{invoice.totalAmount.toLocaleString()}
                </h2>
              </div>
            </div>
            <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight italic">
              * Terms: Goods once sold will not be taken back. Exchange within 7 days. Cotton wash not guaranteed.
            </p>
          </div>

          <div className="w-48 space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900 font-black">₹{invoice.subTotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-[10px] font-black uppercase text-rose-600 italic">
                <span>Disc (-)</span>
                <span>₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-center">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-[9px] font-black tracking-[0.3em] uppercase italic text-slate-900">THANK YOU! VISIT AGAIN</p>
        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{pageIdx + 1} / {totalPages}</p>
      </div>
    </div>
  );
}
