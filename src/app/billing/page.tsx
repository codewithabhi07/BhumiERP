'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { 
  Trash2, 
  Plus, 
  Receipt, 
  History,
  Edit2,
  Save,
  ArrowRight,
  User,
  Tags,
  Star,
  Clock,
  Printer
} from 'lucide-react';
import type { InvoiceItem, Invoice } from '@/types';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { InvoicePreview } from '@/components/InvoicePreview';

const ITEM_SHORTCUTS: Record<string, string> = {
  '1': 'Shirt', '2': 'Pant', '3': 'T-Shirt', '4': 'Night Pant', '5': 'Knicker',
  '6': 'Banyan (Vest)', '7': 'Lungi', '8': 'Ladies Top', '9': 'Gown', '10': 'Frock',
  '11': 'Ladies Knicker', '12': 'Ladies Bra', '13': 'Ladies Slip', '14': 'Small Kids Dress',
  '15': 'Handkerchief', '16': 'Cap', '17': 'Socks', '18': 'Stole', '19': 'Petticoat',
  '20': 'Shawl', '21': 'Ramraj Shirt', '22': 'Siyaram Shirt', '23': 'Sweater',
  '24': 'Kurta Pajama', '25': 'Sherwani', '26': 'Jodhpuri', '27': 'Modi Jacket',
  '28': 'Dhoti Pant', '29': 'Muffler', '30': 'Blazer', '31': '3 Pieces', '32': '5 Pieces',
  '33': '1 Piece', '34': 'Lace', '35': 'Half Night Pant', '36': 'Dupatta',
  '37': 'Baby Dress', '38': 'Punjabi Dress', '39': 'Coat Set', '40': 'Baba Suit',
  '41': 'Palazzo Jeans', '42': 'Palazzo'
};

const createEmptyItem = (): InvoiceItem => ({
  productId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  color: 'Mix',
  price: 0,
  quantity: 0, // Starts empty
  discount: 0,
  total: 0,
  salesmanId: '',
  salesmanName: 'N/A'
});

export default function BillingPage() {
  const { updateStock } = useProductStore();
  const { addInvoice, invoices, updateInvoice, settings, salesmen } = useAppStore();
  
  const SALESMEN_MAP = useMemo(() => {
    const map: Record<string, string> = { '0': 'N/A' };
    salesmen.forEach(s => {
      map[s.id] = s.name;
    });
    return map;
  }, [salesmen]);
  
  const [cart, setCart] = useState<InvoiceItem[]>(Array.from({ length: 6 }, createEmptyItem));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [discountPercent, setDiscountPercent] = useState(0);
  const [rounding, setRounding] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage] = useState(12);

  const gridRefs = useRef<Array<Record<string, HTMLInputElement | null>>>([]);
  const custNameRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const roundingRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showHistory && gridRefs.current[0]?.name) {
      gridRefs.current[0].name.focus();
    }
  }, [showHistory]);

  const updateCartItem = (idx: number, updates: Partial<InvoiceItem>) => {
    const newCart = [...cart];
    const item = { ...newCart[idx], ...updates };
    if (updates.salesmanId !== undefined) {
      item.salesmanName = SALESMEN_MAP[item.salesmanId] || 'N/A';
    }
    item.total = Math.round(item.quantity * item.price);
    newCart[idx] = item;
    setCart(newCart);
  };

  const addMoreRows = () => {
    setCart(prev => [...prev, ...Array.from({ length: 3 }, createEmptyItem)]);
  };

  const removeFromCart = (idx: number) => {
    const newCart = cart.filter((_, i) => i !== idx);
    while (newCart.length < 6) newCart.push(createEmptyItem());
    setCart(newCart);
  };

  const handleGridKeyDown = (e: React.KeyboardEvent, rowIdx: number, field: string) => {
    const isLastRow = rowIdx === cart.length - 1;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'name') {
        const val = cart[rowIdx].name;
        if (ITEM_SHORTCUTS[val]) {
          updateCartItem(rowIdx, { name: ITEM_SHORTCUTS[val] });
        }
        gridRefs.current[rowIdx].sman?.focus();
        return;
      }
      if (field === 'sman') gridRefs.current[rowIdx].qty?.focus();
      if (field === 'qty') gridRefs.current[rowIdx].price?.focus();
      if (field === 'price') {
        if (isLastRow) {
          addMoreRows();
          setTimeout(() => gridRefs.current[rowIdx + 1]?.name?.focus(), 10);
        } else {
          gridRefs.current[rowIdx + 1]?.name?.focus();
        }
      }
    }

    if (e.key === 'ArrowDown' && !isLastRow) gridRefs.current[rowIdx + 1][field]?.focus();
    if (e.key === 'ArrowUp' && rowIdx > 0) gridRefs.current[rowIdx - 1][field]?.focus();
  };

  const activeItems = useMemo(() => cart.filter(item => item.name.trim() !== '' && item.price > 0), [cart]);
  const subTotal = useMemo(() => activeItems.reduce((acc, item) => acc + item.total, 0), [activeItems]);
  const discountAmount = useMemo(() => Math.round(subTotal * (discountPercent / 100)), [subTotal, discountPercent]);
  const tax = useMemo(() => isGstEnabled ? Math.round((subTotal - discountAmount) * (gstPercentage / 100)) : 0, [subTotal, discountAmount, isGstEnabled, gstPercentage]);
  const totalAmount = Math.round(subTotal - discountAmount + tax + rounding);

  const filteredHistory = useMemo(() => 
    invoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(historySearch.toLowerCase()))
    ).slice(0, 20),
  [invoices, historySearch]);

  const handleCheckout = () => {
    if (activeItems.length === 0) return alert("Please add at least one item.");
    
    let invoiceNumber = '';
    if (editingInvoiceId) {
      invoiceNumber = invoices.find(inv => inv.id === editingInvoiceId)!.invoiceNumber;
    } else {
      const numbers = invoices.map(inv => {
        const match = inv.invoiceNumber.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      });
      const maxNumber = Math.max(0, ...numbers);
      invoiceNumber = `INV-${maxNumber < 100 ? 100 : maxNumber + 1}`;
    }

    const invoice: Invoice = {
      id: editingInvoiceId || Date.now().toString(),
      invoiceNumber,
      customerName: customerName || 'Cash Customer',
      customerPhone,
      items: activeItems,
      subTotal, tax, discount: discountAmount, rounding, totalAmount,
      paymentMethod,
      date: new Date(billDate).toISOString()
    };

    if (editingInvoiceId) {
      updateInvoice(editingInvoiceId, invoice);
    } else {
      addInvoice(invoice);
      setLastInvoice(invoice);
      activeItems.forEach(item => {
        if (!item.productId.startsWith('manual-')) updateStock(item.productId, -item.quantity);
      });
    }

    setCart(Array.from({ length: 6 }, createEmptyItem));
    setCustomerName(''); setCustomerPhone('');
    setDiscountPercent(0); setRounding(0);
    setPaymentMethod('Cash'); setIsGstEnabled(false);
    setEditingInvoiceId(null);
  };

  const loadBillForEditing = (inv: Invoice) => {
    const rows = [...inv.items];
    while (rows.length < 6) rows.push(createEmptyItem());
    setCart(rows);
    setCustomerName(inv.customerName || '');
    setCustomerPhone(inv.customerPhone || '');
    setDiscountPercent((inv.discount / inv.subTotal) * 100);
    setRounding(inv.rounding);
    setPaymentMethod(inv.paymentMethod);
    setIsGstEnabled(inv.tax > 0);
    setEditingInvoiceId(inv.id);
    setShowHistory(false);
  };

  const handlePrintBill = (inv: Invoice) => {
    setLastInvoice(inv);
    setShowHistory(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10 max-w-[1600px] mx-auto animate-slide-up">
      {lastInvoice && settings && (
        <InvoicePreview invoice={lastInvoice} settings={settings} onClose={() => setLastInvoice(null)} />
      )}
      
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
              <span className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-200">
                <Receipt className="h-6 w-6 text-white" />
              </span>
              Standard <span className="text-primary-600">POS Terminal</span>
            </h2>
          </div>
          <Button variant="outline" className="gap-2 rounded-2xl h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-black uppercase text-[10px] px-6" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" /> History
          </Button>
        </div>

        <Card className="premium-card p-0 overflow-hidden border-none ring-1 ring-slate-100 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-20 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">Sr.</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Description</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 text-center">S.Man</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 text-center">Qty</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 text-center">Price (₹)</th>
                  <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 text-right">Total</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item, idx) => (
                  <tr key={item.productId} className="group hover:bg-slate-50/50 transition-colors focus-within:bg-primary-50/50">
                    <td className="py-3 px-4 text-center font-black text-slate-300 italic text-xs">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <input 
                        ref={el => { if(!gridRefs.current[idx]) gridRefs.current[idx] = {}; gridRefs.current[idx].name = el; }}
                        type="text" value={item.name}
                        placeholder="CODE / NAME"
                        autoComplete="off"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.endsWith('++')) {
                            updateCartItem(idx, { name: val.replace('++', '') });
                            custNameRef.current?.focus();
                          } else {
                            updateCartItem(idx, { name: val });
                          }
                        }}
                        onKeyDown={(e) => handleGridKeyDown(e, idx, 'name')}
                        className="w-full h-11 bg-white border border-slate-300 rounded-xl px-4 text-sm font-black uppercase focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        ref={el => { if(!gridRefs.current[idx]) gridRefs.current[idx] = {}; gridRefs.current[idx].sman = el; }}
                        type="text" value={item.salesmanId}
                        onChange={(e) => updateCartItem(idx, { salesmanId: e.target.value })}
                        onKeyDown={(e) => handleGridKeyDown(e, idx, 'sman')}
                        className="w-full h-11 bg-white border border-slate-300 rounded-xl text-center text-sm font-black text-primary-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        ref={el => { if(!gridRefs.current[idx]) gridRefs.current[idx] = {}; gridRefs.current[idx].qty = el; }}
                        type="number" value={item.quantity || ''}
                        onChange={(e) => updateCartItem(idx, { quantity: Number(e.target.value) })}
                        onKeyDown={(e) => handleGridKeyDown(e, idx, 'qty')}
                        className="w-full h-11 bg-white border border-slate-300 rounded-xl text-center text-sm font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        ref={el => { if(!gridRefs.current[idx]) gridRefs.current[idx] = {}; gridRefs.current[idx].price = el; }}
                        type="number" value={item.price || ''}
                        onChange={(e) => updateCartItem(idx, { price: Number(e.target.value) })}
                        onKeyDown={(e) => handleGridKeyDown(e, idx, 'price')}
                        className="w-full h-11 bg-white border border-slate-300 rounded-xl text-center text-sm font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm italic">₹{item.total.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <button onClick={() => removeFromCart(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
             <Button variant="outline" className="h-10 gap-2 rounded-xl bg-white font-black text-[10px] uppercase border-slate-200 text-slate-500 hover:text-primary-600 shadow-sm" onClick={addMoreRows}>
               <Plus className="h-4 w-4" /> Add Rows
             </Button>
             <p className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">Type code and hit ENTER to expand shortcuts</p>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card title="Client Details" className="premium-card bg-white relative overflow-hidden border-none shadow-xl p-8">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                ref={custNameRef} placeholder="Customer Name" value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter') custPhoneRef.current?.focus(); }}
                className="w-full h-12 pl-11 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              />
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">+91</span>
              <input 
                ref={custPhoneRef} placeholder="Mobile Number" value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') discountRef.current?.focus(); }}
                className="w-full h-12 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              />
            </div>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="date" value={billDate} onChange={e => setBillDate(e.target.value)}
                className="w-full h-12 pl-11 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none uppercase"
              />
            </div>
          </div>
        </Card>

        <Card className="premium-card p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Receipt className="h-40 w-40" /></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Subtotal</span>
                <span className="text-xl font-black italic">₹{subTotal.toFixed(0)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 px-1">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Disc (%)</span>
                  <input 
                    ref={discountRef} type="number" value={discountPercent || ''}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    onKeyDown={(e) => { if(e.key === 'Enter') roundingRef.current?.focus(); }}
                    className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-3 text-base font-black text-white focus:ring-4 focus:ring-white/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1 px-1">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Adjust</span>
                  <input 
                    ref={roundingRef} type="number" value={rounding || ''}
                    onChange={e => setRounding(Number(e.target.value))}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleCheckout(); }}
                    className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-3 text-base font-black text-emerald-300 focus:ring-4 focus:ring-white/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between cursor-pointer p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-400 transition-all" onClick={() => setIsGstEnabled(!isGstEnabled)}>
                <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Apply GST (12%)</span>
                <div className={cn("h-6 w-11 rounded-full transition-all relative", isGstEnabled ? "bg-emerald-400" : "bg-white/20")}>
                  <div className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-all", isGstEnabled ? "left-6" : "left-1")} />
                </div>
              </div>

              <div className="pt-2 text-center border-t border-white/10">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-1">Net Settlement</p>
                <div className="flex justify-center items-start gap-1">
                  <span className="text-xl font-black text-white/40 mt-2">₹</span>
                  <p className="text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl">{totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Card', 'UPI'].map(m => (
                  <button 
                    key={m} onClick={() => setPaymentMethod(m as any)} 
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2", 
                      paymentMethod === m ? "bg-white text-primary-700 border-white shadow-xl scale-105" : "border-white/10 text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <Button 
                className="w-full h-20 text-2xl gap-4 rounded-[2rem] bg-white text-primary-700 font-black uppercase tracking-tighter shadow-2xl hover:translate-y-[-4px] active:scale-95 transition-all"
                onClick={handleCheckout}
              >
                <Printer className="h-8 w-8" /> Print Bill
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Quick Bill Search" size="lg">
        <div className="space-y-6 p-2">
          <div className="relative group">
            <Tags className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <Input 
              placeholder="Type Bill No or Customer Name..." 
              value={historySearch} onChange={e => setHistorySearch(e.target.value)} 
              className="pl-12 rounded-2xl bg-slate-100 border-transparent h-14 font-bold text-base focus:bg-white"
            />
          </div>
          <div className="max-h-[450px] overflow-y-auto rounded-[2rem] border border-slate-100 shadow-inner bg-slate-50/50">
            <Table headers={['Bill No', 'Client', 'Amount', 'Method', '']}>
              {filteredHistory.map(inv => (
                <TableRow key={inv.id} className="hover:bg-white transition-all group">
                  <TableCell className="font-black text-primary-600 italic tracking-tighter">{inv.invoiceNumber}</TableCell>
                  <TableCell className="font-bold uppercase text-[10px] text-slate-600">{inv.customerName}</TableCell>
                  <TableCell className="font-black text-slate-900 italic text-sm">₹{inv.totalAmount.toLocaleString()}</TableCell>
                  <TableCell><span className="text-[9px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded-lg tracking-widest">{inv.paymentMethod}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-primary-600 bg-white shadow-sm border border-slate-100 rounded-xl hover:scale-110" onClick={() => loadBillForEditing(inv)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-emerald-600 bg-white shadow-sm border border-slate-100 rounded-xl hover:scale-110" onClick={() => handlePrintBill(inv)}><Printer className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
