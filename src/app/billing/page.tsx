'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useProductStore } from '../../store/useProductStore';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  Search, 
  Trash2, 
  Plus, 
  Receipt, 
  Keyboard, 
  CheckCircle2, 
  Circle,
  History,
  Edit2,
  Save,
  ArrowRight,
  User,
  Tags,
  ShoppingCart,
  Star,
  Clock,
  Printer
} from 'lucide-react';
import type { Product, InvoiceItem, Invoice } from '../../types';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { InvoicePreview } from '../../components/InvoicePreview';

const ITEM_SHORTCUTS: Record<string, string> = {
  '1': 'Shirt', '2': 'Pant', '3': 'T-Shirt', '4': 'Night Pant', '5': 'Knicker',
  '6': 'Banyan (Vest)', '7': 'Lungi', '8': 'Ladies Top', '9': 'Gown', '10': 'Frock',
  '11': 'Ladies Knicker', '12': 'Ladies Bra', '13': 'Ladies Slip', '14': 'Small Kids Dress',
  '15': 'Rumal (Handkerchief)', '16': 'Cap', '17': 'Socks', '18': 'Stole', '19': 'Petticoat',
  '20': 'Shawl', '21': 'Ramraj Shirt', '22': 'Siyaram Shirt', '23': 'Sweater',
  '24': 'Kurta Pajama', '25': 'Sherwani', '26': 'Jodhpuri', '27': 'Modi Jacket',
  '28': 'Dhoti Pant', '29': 'Muffler', '30': 'Blazer', '31': '3 Pieces', '32': '5 Pieces',
  '33': '1 Piece', '34': 'Lace', '35': 'Half Night Pant', '36': 'Dupatta',
  '37': 'Baby Dress', '38': 'Punjabi Dress', '39': 'Coat Set', '40': 'Baba Suit',
  '41': 'Palazzo Jeans', '42': 'Palazzo'
};

const ITEM_SUGGESTIONS = Object.values(ITEM_SHORTCUTS);

export default function BillingPage() {
  const { products, updateStock } = useProductStore();
  const { addInvoice, invoices, updateInvoice, settings, salesmen } = useAppStore();
  
  // Convert salesmen array to the Record format used in the code
  const SALESMEN_MAP = useMemo(() => {
    const map: Record<string, string> = { '0': 'N/A' };
    salesmen.forEach(s => {
      map[s.id] = s.name;
    });
    return map;
  }, [salesmen]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Totals
  const [discountPercent, setDiscountPercent] = useState(0);
  const [rounding, setRounding] = useState(0);
  
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

  // Bill History & Editing
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // GST State
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage] = useState(12);

  // Manual entry state
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualItem, setManualItem] = useState({
    name: '', price: 0, quantity: 1, color: 'Mix', salesmanId: '0'
  });

  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);
  const manualPriceRef = useRef<HTMLInputElement>(null);
  const manualQtyRef = useRef<HTMLInputElement>(null);
  const manualSmanRef = useRef<HTMLInputElement>(null);
  const custNameRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const roundingRef = useRef<HTMLInputElement>(null);
  const generateBillBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showHistory) {
      manualNameRef.current?.focus();
    }
  }, [showHistory]);

  // Customer History Lookup
  const customerHistory = useMemo(() => {
    if (!customerPhone || customerPhone.length < 10) return null;
    const history = invoices.filter(inv => inv.customerPhone === customerPhone);
    if (history.length === 0) return null;
    
    return {
      count: history.length,
      lastDate: history[0].date,
      lastAmount: history[0].totalAmount,
      name: history[0].customerName
    };
  }, [customerPhone, invoices]);

  useEffect(() => {
    if (customerHistory && !customerName) {
      setCustomerName(customerHistory.name || '');
    }
  }, [customerHistory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  ).slice(0, 5);

  const filteredHistory = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
    (inv.customerName && inv.customerName.toLowerCase().includes(historySearch.toLowerCase()))
  ).slice(0, 20);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      updateCartItem(product.id, { quantity: existing.quantity + 1 });
    } else {
      setCart([...cart, {
        productId: product.id, name: product.name, color: product.color,
        price: product.sellingPrice, quantity: 1, discount: 0, total: product.sellingPrice,
        salesmanId: '0', salesmanName: 'N/A'
      }]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleManualNameShortcut = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value;
      if (ITEM_SHORTCUTS[val]) {
        e.preventDefault();
        setManualItem({ ...manualItem, name: ITEM_SHORTCUTS[val] });
        manualPriceRef.current?.focus();
      } else {
        handleKeyDown(e, manualPriceRef);
      }
    }
  };

  const addManualToCart = () => {
    if (!manualItem.name || manualItem.price <= 0) return;
    setCart([...cart, {
      productId: `manual-${Date.now()}`, name: manualItem.name,
      color: manualItem.color, price: manualItem.price, quantity: manualItem.quantity,
      discount: 0, total: manualItem.price * manualItem.quantity,
      salesmanId: manualItem.salesmanId, salesmanName: SALESMEN_MAP[manualItem.salesmanId] || 'N/A'
    }]);
    setManualItem({ name: '', price: 0, quantity: 1, color: 'Mix', salesmanId: '0' });
    manualNameRef.current?.focus();
  };

  const updateCartItem = (id: string, updates: Partial<InvoiceItem>) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const updated = { ...item, ...updates };
        if (updates.salesmanId) {
          updated.salesmanName = SALESMEN_MAP[updates.salesmanId] || 'N/A';
        }
        updated.total = updated.quantity * updated.price;
        return updated;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const subTotal = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);
  const discountAmount = useMemo(() => subTotal * (discountPercent / 100), [subTotal, discountPercent]);
  const tax = useMemo(() => isGstEnabled ? ((subTotal - discountAmount) * (gstPercentage / 100)) : 0, [subTotal, discountAmount, isGstEnabled, gstPercentage]);
  
  const rawTotal = subTotal - discountAmount + tax;
  const totalAmount = rawTotal + rounding;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let invoiceNumber = '';
    if (editingInvoiceId) {
      invoiceNumber = invoices.find(inv => inv.id === editingInvoiceId)!.invoiceNumber;
    } else {
      // Find the highest existing invoice number
      const numbers = invoices.map(inv => {
        const match = inv.invoiceNumber.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      });
      const maxNumber = Math.max(0, ...numbers);
      // Start from 100 if no invoices exist or if highest is less than 100
      const nextNumber = maxNumber < 100 ? 100 : maxNumber + 1;
      invoiceNumber = `INV-${nextNumber}`;
    }

    const invoice: Invoice = {
      id: editingInvoiceId || Date.now().toString(),
      invoiceNumber,
      customerName: customerName || 'Cash Customer',
      customerPhone,
      items: cart,
      subTotal,
      tax,
      discount: discountAmount,
      rounding,
      totalAmount,
      paymentMethod,
      date: new Date(billDate).toISOString()
    };

    if (editingInvoiceId) {
      updateInvoice(editingInvoiceId, invoice);
      alert('Bill updated successfully!');
    } else {
      addInvoice(invoice);
      setLastInvoice(invoice);
      cart.forEach(item => {
        if (!item.productId.startsWith('manual-')) {
          updateStock(item.productId, -item.quantity);
        }
      });
    }

    // Reset
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
    setRounding(0);
    setPaymentMethod('Cash');
    setIsGstEnabled(false);
    setEditingInvoiceId(null);
  };

  const loadBillForEditing = (inv: Invoice) => {
    setCart(inv.items);
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

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>, action?: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action) action();
      if (nextRef) nextRef.current?.focus();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10 max-w-[1600px] mx-auto animate-slide-up">
      {lastInvoice && settings && (
        <InvoicePreview invoice={lastInvoice} settings={settings} onClose={() => { setLastInvoice(null); searchInputRef.current?.focus(); }} />
      )}
      
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
              <span className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-200">
                <Receipt className="h-6 w-6 text-white" />
              </span>
              Billing <span className="text-primary-600">Terminal</span>
            </h2>
          </div>
          <Button variant="outline" className="gap-2 rounded-2xl h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold px-6" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" /> Previous Bills
          </Button>
        </div>

        <Card className="shadow-2xl border-none ring-1 ring-slate-100 overflow-hidden relative">
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
              <Tags className="h-40 w-40 text-primary-600" />
            </div>
            <div className="grid grid-cols-12 gap-6 relative z-10">
              <div className="col-span-12 md:col-span-4 relative">
                <Input 
                  ref={manualNameRef} label="Item Name (1-42 or Name)" 
                  placeholder="Type code or name..." 
                  value={manualItem.name}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.endsWith('++')) {
                      // Trigger jump to customer name
                      setManualItem({...manualItem, name: val.replace('++', '')});
                      custNameRef.current?.focus();
                    } else {
                      setManualItem({...manualItem, name: val});
                    }
                  }}
                  onKeyDown={handleManualNameShortcut}
                  className="bg-white border-slate-200 h-14 text-base font-black shadow-sm"
                />
                {manualItem.name && !ITEM_SHORTCUTS[manualItem.name] && ITEM_SUGGESTIONS.some(s => s.toLowerCase().includes(manualItem.name.toLowerCase())) && (
                  <div className="absolute top-full z-10 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl py-1 max-h-60 overflow-y-auto">
                    {ITEM_SUGGESTIONS.filter(s => s.toLowerCase().includes(manualItem.name.toLowerCase())).map(s => (
                      <button 
                        key={s} className="w-full text-left px-4 py-3 text-sm font-black uppercase hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => { setManualItem({...manualItem, name: s}); manualPriceRef.current?.focus(); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-4 md:col-span-3">
                <Input 
                  ref={manualPriceRef} label="Price (₹)" type="number" 
                  value={manualItem.price || ''}
                  onChange={e => setManualItem({...manualItem, price: Number(e.target.value)})}
                  onKeyDown={(e) => handleKeyDown(e, manualQtyRef)}
                  className="bg-white border-slate-200 h-14 text-center text-lg font-black shadow-sm"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Input 
                  ref={manualQtyRef} label="Quantity" type="number" 
                  value={manualItem.quantity}
                  onChange={e => setManualItem({...manualItem, quantity: Number(e.target.value)})}
                  onKeyDown={(e) => handleKeyDown(e, manualSmanRef)}
                  className="bg-white border-slate-200 h-14 text-center text-lg font-black shadow-sm"
                />
              </div>
              <div className="col-span-4 md:col-span-3">
                <Input 
                  ref={manualSmanRef} label="Salesman ID" type="text" 
                  value={manualItem.salesmanId}
                  onChange={e => setManualItem({...manualItem, salesmanId: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, undefined, addManualToCart)}
                  className="bg-white border-slate-200 h-14 text-center text-lg font-black text-primary-600 shadow-sm"
                />
              </div>
              <div className="col-span-12 flex justify-end pt-2">
                <Button className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl bg-primary-600 shadow-primary-100 hover:scale-105 transition-all" onClick={addManualToCart} disabled={!manualItem.name || manualItem.price <= 0}>
                  <Plus className="h-5 w-5 mr-2" /> Add Item to List
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Order List" className="overflow-hidden shadow-2xl border-none ring-1 ring-slate-100 p-0 rounded-[2.5rem]">
          <Table headers={['Item Description', 'Price', 'Qty', 'S.Man', 'Total', '']}>
            {cart.map(item => (
              <TableRow key={item.productId} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <TableCell>
                  <input 
                    type="text" value={item.name}
                    onChange={(e) => updateCartItem(item.productId, { name: e.target.value })}
                    className="w-full bg-transparent font-black text-slate-900 uppercase text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 transition-all"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-black text-slate-900 text-sm">
                    <span className="text-slate-400">₹</span>
                    <input 
                      type="number" value={item.price || ''}
                      onChange={(e) => updateCartItem(item.productId, { price: Number(e.target.value) })}
                      className="w-20 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 transition-all"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <input 
                    type="number" value={item.quantity}
                    onChange={(e) => updateCartItem(item.productId, { quantity: Number(e.target.value) })}
                    className="w-12 bg-transparent text-center font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded py-1 transition-all"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <input 
                      type="text" value={item.salesmanId}
                      onChange={(e) => updateCartItem(item.productId, { salesmanId: e.target.value })}
                      className="w-10 bg-slate-50 border-none rounded-lg text-center font-black text-primary-600 text-xs focus:ring-2 focus:ring-primary-500 py-1 transition-all uppercase"
                    />
                    <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[50px]">
                      {item.salesmanName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-black text-slate-900 text-sm">₹{item.total.toFixed(0)}</TableCell>
                <TableCell>
                  <button onClick={() => removeFromCart(item.productId)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {cart.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center opacity-30">
                  <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <ShoppingCart className="h-10 w-10 text-primary-300" />
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 italic">Terminal waiting for items...</p>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card title="Customer Profile" className="shadow-xl border-none rounded-[2rem] bg-white relative overflow-hidden">
          {customerHistory && (
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 animate-bounce">
                <Star className="h-3 w-3 fill-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">Regular Customer</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <Input 
                ref={custNameRef} placeholder="Customer Full Name" value={customerName} 
                onChange={e => setCustomerName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, custPhoneRef)} 
                className="bg-slate-50/50 border-transparent h-12 pl-11 text-sm font-bold rounded-2xl" 
              />
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">+91</div>
              <Input 
                ref={custPhoneRef} placeholder="Mobile Number" value={customerPhone} 
                onChange={e => setCustomerPhone(e.target.value)} onKeyDown={(e) => handleKeyDown(e, discountRef)} 
                className="bg-slate-50/50 border-transparent h-12 pl-12 text-sm font-bold rounded-2xl" 
              />
            </div>

            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                className="w-full bg-slate-50/50 border-none h-12 pl-11 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none uppercase"
              />
            </div>

            {customerHistory && (
              <div className="mt-4 p-4 rounded-2xl bg-primary-50 border border-primary-100 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-primary-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Last Visit: {format(new Date(customerHistory.lastDate), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">Total Visits</p>
                    <p className="text-xl font-black text-primary-700 leading-none">{customerHistory.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">Last Bill</p>
                    <p className="text-xl font-black text-primary-700 leading-none">₹{customerHistory.lastAmount.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white border-none shadow-2xl p-0 rounded-[2.5rem] overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <Receipt className="h-40 w-40" />
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-6">Payment Summary</h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest group-hover:text-white">Subtotal</span>
                <span className="text-xl font-black italic">₹{subTotal.toFixed(0)}</span>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-white/70 tracking-tighter">Discount (%)</span>
                  <div className="flex items-center gap-3">
                    <input 
                      ref={discountRef}
                      type="number" value={discountPercent || ''}
                      onChange={e => setDiscountPercent(Number(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, roundingRef)}
                      className="w-20 text-right font-black text-white focus:outline-none bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-base shadow-inner focus:ring-2 focus:ring-rose-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm font-black text-rose-300">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-white/70 tracking-tighter">Adjustment</span>
                  <div className="flex items-center gap-3">
                    <input 
                      ref={roundingRef}
                      type="number" value={rounding || ''}
                      onChange={e => setRounding(Number(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, generateBillBtnRef)}
                      className="w-20 text-right font-black text-emerald-300 focus:outline-none bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-base shadow-inner focus:ring-2 focus:ring-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                    <span className="text-xs font-black text-emerald-300">₹</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between cursor-pointer group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-emerald-400 transition-all" onClick={() => setIsGstEnabled(!isGstEnabled)}>
                <span className="text-xs font-black uppercase text-white/70 group-hover:text-white tracking-widest">Apply GST (12%)</span>
                {isGstEnabled ? <CheckCircle2 className="h-6 w-6 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" /> : <Circle className="h-6 w-6 text-white/20" />}
              </div>

              <div className="my-2 h-px bg-white/10" />
              
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-2 text-center">Settlement Amount</p>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-start gap-1">
                    <span className="text-xl font-black text-white/50 mt-2 tracking-tighter">₹</span>
                    <p className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                      {totalAmount.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4">
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
                ref={generateBillBtnRef} 
                className={cn(
                  "w-full h-20 text-2xl mt-4 gap-4 rounded-[2rem] font-black uppercase tracking-tighter shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all transform hover:translate-y-[-4px]", 
                  editingInvoiceId ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white text-primary-700 hover:bg-primary-50"
                )} 
                disabled={cart.length === 0} onClick={handleCheckout}
              >
                {editingInvoiceId ? <Save className="h-8 w-8" /> : <Receipt className="h-8 w-8" />}
                {editingInvoiceId ? 'Update Bill' : 'Print Bill'}
                <ArrowRight className="h-6 w-6 ml-auto opacity-30" />
              </Button>
              
              {editingInvoiceId && (
                <button 
                  className="w-full text-white/40 hover:text-white uppercase font-black text-[9px] h-8 tracking-[0.3em] transition-colors" 
                  onClick={() => { setEditingInvoiceId(null); setCart([]); setCustomerName(''); setCustomerPhone(''); }}
                >
                  Cancel Correction
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bill History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Quick Bill Search" size="lg">
        <div className="space-y-6 p-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <Input 
              placeholder="Type Bill No or Customer Name..." 
              value={historySearch} 
              onChange={e => setHistorySearch(e.target.value)} 
              className="pl-12 rounded-2xl bg-slate-100 border-transparent h-14 font-bold text-base focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <div className="max-h-[450px] overflow-y-auto rounded-[2rem] border border-slate-100 shadow-inner bg-slate-50/50">
            <Table headers={['Bill No', 'Customer', 'Amount', 'Mode', 'Actions']}>
              {filteredHistory.map(inv => (
                <TableRow key={inv.id} className="hover:bg-white transition-all group">
                  <TableCell className="font-black text-primary-600 tracking-tighter italic">{inv.invoiceNumber}</TableCell>
                  <TableCell className="font-bold uppercase text-[10px] text-slate-600">{inv.customerName}</TableCell>
                  <TableCell className="font-black text-slate-900">₹{inv.totalAmount.toFixed(0)}</TableCell>
                  <TableCell>
                    <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded-lg tracking-widest">{inv.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-primary-600 bg-white shadow-sm border border-slate-100 rounded-xl hover:scale-110" onClick={() => loadBillForEditing(inv)} title="Edit Bill">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-emerald-600 bg-white shadow-sm border border-slate-100 rounded-xl hover:scale-110" onClick={() => handlePrintBill(inv)} title="Print Bill">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            {filteredHistory.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <Search className="h-12 w-12 mx-auto mb-2" />
                <p className="font-black uppercase tracking-widest text-[10px]">No matches found</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
