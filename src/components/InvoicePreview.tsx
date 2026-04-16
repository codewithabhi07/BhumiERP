import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Printer, X } from 'lucide-react';
import type { Invoice, ShopSettings, InvoiceItem } from '../types';
import { cn } from '../utils/cn';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: ShopSettings;
  onClose: () => void;
}

export function InvoicePreview({ invoice, settings, onClose }: InvoicePreviewProps) {
  const isThermal = settings.invoiceType === 'Thermal';
  const isA4Half = settings.invoiceType === 'A4 Half';
  
  const ITEMS_PER_PAGE = isThermal ? 100 : (isA4Half ? 8 : 18);
  
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

  const ThermalLayout = () => (
    <div className="w-[80mm] mx-auto p-4 bg-white text-black font-mono text-[12px] leading-tight">
      <div className="text-center border-b border-dashed border-black pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">{settings.shopName}</h1>
        <p className="text-[10px] mt-1">{settings.address}</p>
        <p className="text-[10px]">Ph: {settings.phone}</p>
        {settings.gstNumber && <p className="text-[10px]">GST: {settings.gstNumber}</p>}
      </div>

      <div className="flex justify-between text-[10px] mb-2 font-bold">
        <span>Bill: #{invoice.invoiceNumber}</span>
        <span>{new Date(invoice.date).toLocaleDateString()}</span>
      </div>
      
      <div className="border-b border-dashed border-black mb-2 pb-1">
        <p className="text-[10px] uppercase font-bold">Customer: {invoice.customerName || 'Cash'}</p>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Amt</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 uppercase truncate max-w-[40mm]">{item.name}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">₹{item.total.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{invoice.subTotal.toFixed(0)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount (-):</span>
            <span>₹{invoice.discount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>₹{invoice.totalAmount.toFixed(0)}</span>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
        <p className="text-[10px] font-bold">THANK YOU! VISIT AGAIN</p>
        <p className="text-[8px] mt-1 italic">Software by BhumiERP</p>
      </div>
    </div>
  );

  const InvoicePage = ({ chunk, pageIdx, totalPages }: { chunk: InvoiceItem[], pageIdx: number, totalPages: number }) => (
    <div className="flex-1 p-0 bg-white relative flex flex-col text-black font-sans" style={{ fontSize: '13px', lineHeight: '1.4' }}>
      <div className="flex flex-col h-full border-[2px] border-black p-5 print:p-6 box-border">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none mb-1">{settings.shopName}</h1>
            <div className="space-y-0.5 text-[11px] font-bold uppercase tracking-tight text-slate-700">
              <p className="text-sm font-black text-black">Proprietor: {settings.ownerName}</p>
              <p className="max-w-[450px] leading-tight">{settings.address}</p>
              <div className="flex gap-6 mt-1">
                <p>Contact: +91 {settings.phone}</p>
                {settings.gstNumber && <p>GSTIN: {settings.gstNumber}</p>}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end min-w-[150px]">
            <h2 className="text-lg font-black border-2 border-black px-4 py-1.5 uppercase tracking-[0.2em] mb-3 bg-slate-50">TAX INVOICE</h2>
            <div className="text-[11px] space-y-1 font-bold text-right uppercase">
              <p>Invoice No: <span className="text-sm font-black">{invoice.invoiceNumber}</span></p>
              <p>Date: <span className="text-sm font-black">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></p>
              {totalPages > 1 && <p className="italic text-slate-500 pt-1">Page {pageIdx + 1} of {totalPages}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-black mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Billed To:</p>
            <p className="text-lg font-black uppercase tracking-tight text-black">{invoice.customerName || 'Cash Customer'}</p>
            {invoice.customerPhone && <p className="text-[11px] font-bold text-slate-600 mt-0.5">Mobile: +91 {invoice.customerPhone}</p>}
          </div>
          <div className="text-right flex flex-col justify-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Payment Details:</p>
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-sm font-black uppercase text-slate-900">{invoice.paymentMethod}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 px-2 rounded-full bg-emerald-50">Payment Received</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <table className="w-full text-left border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-black">
                <th className="py-2 px-2 border-r border-black font-black uppercase text-[10px] text-center w-10">Sr.</th>
                <th className="py-2 px-3 border-r border-black font-black uppercase text-[10px]">Description of Goods</th>
                <th className="py-2 px-2 border-r border-black font-black uppercase text-[10px] text-center w-16">Qty</th>
                <th className="py-2 px-2 border-r border-black font-black uppercase text-[10px] text-center w-16">Staff</th>
                <th className="py-2 px-3 border-r border-black font-black uppercase text-[10px] text-right w-24">Rate (₹)</th>
                <th className="py-2 px-3 font-black uppercase text-[10px] text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chunk.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 px-2 border-r border-black text-center font-bold text-[12px]">{pageIdx * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="py-2 px-3 border-r border-black uppercase font-bold text-[12px]">{item.name}</td>
                  <td className="py-2 px-2 border-r border-black text-center font-black text-[12px]">{item.quantity}</td>
                  <td className="py-2 px-2 border-r border-black text-center font-bold text-[11px] text-slate-500">{item.salesmanId || '-'}</td>
                  <td className="py-2 px-3 border-r border-black text-right font-bold text-[12px]">{item.price.toFixed(0)}</td>
                  <td className="py-2 px-3 text-right font-black text-[12px]">₹{item.total.toFixed(0)}</td>
                </tr>
              ))}
              {[...Array(Math.max(0, ITEMS_PER_PAGE - chunk.length))].map((_, i) => (
                <tr key={`empty-${i}`} className="h-9 border-none">
                  <td className="border-r border-black opacity-0"></td>
                  <td colSpan={5} className="border-r border-black"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-black">
          {pageIdx === totalPages - 1 ? (
            <div className="flex justify-between items-start">
              <div className="max-w-[380px] space-y-4">
                <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 text-[10px] space-y-1.5 uppercase tracking-tighter font-bold">
                  <p className="font-black underline mb-1">Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back or refunded.</p>
                  <p>2. Exchange allowed within 7 days with this invoice copy.</p>
                  <p>3. Colors and Wash of cotton articles are not guaranteed.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black italic text-slate-900 uppercase tracking-tighter">✨ Thank You For Your Visit! ✨</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BHUMIKA GARMENTS • PAROLA</p>
                </div>
              </div>
              <div className="w-72">
                <table className="w-full border-collapse border-2 border-black text-[11px] font-bold uppercase tracking-tight">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="py-1.5 px-3 border-r-2 border-black">Gross Total</td>
                      <td className="py-1.5 px-3 text-right">₹{invoice.subTotal.toFixed(0)}</td>
                    </tr>
                    {invoice.discount > 0 && (
                      <tr className="border-b border-black text-rose-600 font-black italic">
                        <td className="py-1.5 px-3 border-r-2 border-black">Discount Applied (-)</td>
                        <td className="py-1.5 px-3 text-right">-₹{invoice.discount.toFixed(0)}</td>
                      </tr>
                    )}
                    <tr className="bg-black text-white text-base">
                      <td className="py-2.5 px-3 border-r-2 border-white font-black tracking-widest">NET PAYABLE</td>
                      <td className="py-2.5 px-3 text-right font-black italic text-xl">₹{invoice.totalAmount.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="pt-12 text-center">
                  <div className="h-px w-full bg-black mb-1 opacity-40" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] pl-1">Authorized Signatory</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center py-4">
              <p className="text-[11px] font-black uppercase italic tracking-widest text-slate-400">... Continued on Page {pageIdx + 2}</p>
              <div className="text-right pt-6 min-w-[200px]">
                <div className="h-px w-full bg-black mb-1 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">For {settings.shopName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-white overflow-y-auto">
      <style>
        {`
          @media print {
            @page { 
              size: ${isThermal ? '80mm 200mm' : (isA4Half ? 'A4 landscape' : 'A4 portrait')}; 
              margin: 0 !important; 
            }
            body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background: white !important; 
            }
            .print-hidden { display: none !important; }
            .bill-page { 
              height: ${isThermal ? 'auto' : (isA4Half ? '148mm' : '297mm')} !important;
              width: ${isThermal ? '80mm' : (isA4Half ? '210mm' : '210mm')} !important;
              padding: ${isThermal ? '0' : (isA4Half ? '10mm 15mm' : '10mm 15mm')} !important;
              box-sizing: border-box !important;
              page-break-after: always !important;
              background: white !important;
              overflow: hidden !important;
              margin: 0 auto !important;
              display: block !important;
            }
            .bill-page:last-child {
              page-break-after: auto !important;
            }
          }
        `}
      </style>
      
      <div className={cn(
        "flex flex-col h-full max-h-[95vh] bg-white shadow-2xl rounded-[3rem] overflow-hidden print:shadow-none print:rounded-none my-auto border border-white/20",
        isThermal ? "w-full max-w-sm" : (isA4Half ? "w-full max-w-5xl" : "w-full max-w-4xl")
      )}>
        <div className="flex items-center justify-between border-b border-slate-100 px-10 py-6 print-hidden shrink-0 bg-white">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">BHUMIKA <span className="text-primary-600 italic">ERP</span></h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2 font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isThermal ? "Thermal 80mm Receipt Mode" : (isA4Half ? "A4 Half Landscape Mode" : "Standard A4 Layout Mode")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="gap-3 h-14 px-10 rounded-[1.25rem] font-black uppercase text-sm shadow-2xl shadow-primary-200 bg-primary-600 hover:bg-primary-700" onClick={handlePrint}>
              <Printer className="h-6 w-6" /> Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-14 w-14 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600">
              <X className="h-7 w-7" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto print:overflow-visible bg-slate-50/50 p-10 print:p-0">
          {itemChunks.map((chunk, idx) => (
            <div key={idx} className="bill-page bg-white shadow-sm print:shadow-none mx-auto print:m-0 mb-16">
              {isThermal ? <ThermalLayout /> : <InvoicePage chunk={chunk} pageIdx={idx} totalPages={itemChunks.length} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
