import { useState, useMemo, useRef, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Receipt, 
  Keyboard, 
  CheckCircle2, 
  Circle,
  UserRound
} from 'lucide-react';
import type { Product, InvoiceItem, Invoice } from '../types';
import { InvoicePreview } from '../components/InvoicePreview';
import { cn } from '../utils/cn';

const ITEM_SHORTCUTS: Record<string, string> = {
  '1': 'Shirt', '2': 'Pant', '3': 'T-Shirt', '4': 'Night Pant', '5': 'Knicker',
  '6': 'Banyan (Vest)', '7': 'Lungi', '8': 'Ladies Top', '9': 'Gown', '10': 'Frock',
  '11': 'Ladies Knicker', '12': 'Ladies Bra', '13': 'Ladies Slip', '14': 'Small Kids Dress',
  '15': 'Rumal (Handkerchief)', '16': 'Cap', '17': 'Socks', '18': 'Stole', '19': 'Petticoat',
  '20': 'Shawl', '21': 'Ramraj Shirt', '22': 'Siyaram Shirt', '23': 'Sweater',
  '24': 'Kurta Pajama', '25': 'Sherwani', '26': 'Jodhpuri', '27': 'Modi Jacket',
  '28': 'Dhoti Pant', '29': 'Shawl', '30': 'Blazer', '31': '3 Pieces', '32': '5 Pieces',
  '33': '1 Piece', '34': 'Lace', '35': 'Half Night Pant', '36': 'Dupatta',
  '37': 'Baby Dress', '38': 'Punjabi Dress', '39': 'Coat Set', '40': 'Baba Suit',
  '41': 'Palazzo Jeans', '42': 'Palazzo'
};

const SALESMEN: Record<string, string> = {
  '1': 'Sunil Patil',
  '2': 'Mukesh Patil',
  '3': 'Ankush Dada',
  '4': 'Dipak Mahajan'
};

export default function BillingPage() {
  const { products, updateStock } = useProductStore();
  const { addInvoice, settings } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Totals
  const [discountPercent, setDiscountPercent] = useState(0);
  const [rounding, setRounding] = useState(0); // Manual adjustment
  
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

  // Salesman Selection
  const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);

  // GST State
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage] = useState(12);

  // Manual entry state
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualItem, setManualItem] = useState({
    name: '', price: 0, quantity: 1, color: 'Mix'
  });

  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);
  const manualPriceRef = useRef<HTMLInputElement>(null);
  const manualQtyRef = useRef<HTMLInputElement>(null);
  const custNameRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const roundingRef = useRef<HTMLInputElement>(null);
  const generateBillBtnRef = useRef<HTMLButtonElement>(null);
  const salesmanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isManualEntry) {
      manualNameRef.current?.focus();
    } else if (!isSalesmanModalOpen) {
      searchInputRef.current?.focus();
    }
  }, [isManualEntry, isSalesmanModalOpen]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  ).slice(0, 5);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      updateCartItem(product.id, { quantity: existing.quantity + 1 });
    } else {
      setCart([...cart, {
        productId: product.id, name: product.name, color: product.color,
        price: product.sellingPrice, quantity: 1, discount: 0, total: product.sellingPrice
      }]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleManualNameChange = (val: string) => {
    if (ITEM_SHORTCUTS[val]) {
      setManualItem({ ...manualItem, name: ITEM_SHORTCUTS[val] });
    } else {
      setManualItem({ ...manualItem, name: val });
    }
  };

  const addManualToCart = () => {
    if (!manualItem.name || manualItem.price <= 0) return;
    setCart([...cart, {
      productId: `manual-${Date.now()}`, name: manualItem.name,
      color: manualItem.color, price: manualItem.price, quantity: manualItem.quantity,
      discount: 0, total: manualItem.price * manualItem.quantity
    }]);
    setManualItem({ name: '', price: 0, quantity: 1, color: 'Mix' });
    manualNameRef.current?.focus();
  };

  const updateCartItem = (id: string, updates: Partial<InvoiceItem>) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const updated = { ...item, ...updates };
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
  
  // Total before rounding
  const rawTotal = subTotal - discountAmount + tax;
  // Total after rounding/settlement
  const totalAmount = rawTotal + rounding;

  const handleGenerateClick = () => {
    if (cart.length === 0) return;
    setIsSalesmanModalOpen(true);
    setTimeout(() => salesmanInputRef.current?.focus(), 100);
  };

  const handleSalesmanSelect = (id: string) => {
    if (SALESMEN[id]) {
      finalizeInvoice(id, SALESMEN[id]);
    }
  };

  const finalizeInvoice = (sId: string, sName: string) => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Cash Customer',
      customerPhone,
      items: cart,
      subTotal,
      tax,
      discount: discountAmount,
      rounding,
      totalAmount,
      paymentMethod,
      salesmanId: sId,
      salesmanName: sName,
      date: new Date().toISOString()
    };

    addInvoice(invoice);
    setLastInvoice(invoice);
    
    cart.forEach(item => {
      if (!item.productId.startsWith('manual-')) {
        updateStock(item.productId, -item.quantity);
      }
    });

    // Reset
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
    setRounding(0);
    setPaymentMethod('Cash');
    setIsGstEnabled(false);
    setIsSalesmanModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>, action?: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action) action();
      if (nextRef) nextRef.current?.focus();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10">
      {lastInvoice && (
        <InvoicePreview invoice={lastInvoice} settings={settings} onClose={() => { setLastInvoice(null); searchInputRef.current?.focus(); }} />
      )}
      
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <Card title="Billing Panel" description="Scanner & Manual Entry System">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  ref={searchInputRef}
                  placeholder="Scan barcode or search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredProducts.length > 0) {
                      addToCart(filteredProducts[0]);
                    } else if (e.key === 'Enter' && !searchTerm) {
                      custNameRef.current?.focus();
                    }
                  }}
                  className="pl-10 h-11"
                  disabled={isManualEntry}
                />
                {searchTerm && filteredProducts.length > 0 && (
                  <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-xl">
                    {filteredProducts.map(p => (
                      <button
                        key={p.id} onClick={() => addToCart(p)}
                        className="flex w-full items-center justify-between p-4 hover:bg-slate-50 border-b last:border-0 border-slate-100"
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-slate-900 uppercase text-xs tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.brand} | {p.color}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-primary-600 tracking-tighter">₹{p.sellingPrice}</span>
                          <Plus className="h-4 w-4 text-primary-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant={isManualEntry ? 'primary' : 'outline'} className="gap-2 shrink-0 h-11 rounded-xl" onClick={() => setIsManualEntry(!isManualEntry)}>
                <Keyboard className="h-4 w-4" /> Manual Entry (F2)
              </Button>
            </div>

            {isManualEntry && (
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-5 relative">
                    <Input 
                      ref={manualNameRef}
                      label="Item Name (1-42 shortcuts)" 
                      placeholder="Type number e.g. 1" 
                      value={manualItem.name}
                      onChange={e => handleManualNameChange(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, manualPriceRef)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <Input 
                      ref={manualPriceRef} label="Price" type="number" 
                      value={manualItem.price || ''}
                      onChange={e => setManualItem({...manualItem, price: Number(e.target.value)})}
                      onKeyDown={(e) => handleKeyDown(e, manualQtyRef)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Input 
                      ref={manualQtyRef} label="Qty" type="number" 
                      value={manualItem.quantity}
                      onChange={e => setManualItem({...manualItem, quantity: Number(e.target.value)})}
                      onKeyDown={(e) => handleKeyDown(e, undefined, addManualToCart)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-end">
                    <Button className="w-full h-10 rounded-xl font-black uppercase text-xs" onClick={addManualToCart} disabled={!manualItem.name || manualItem.price <= 0}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Current Cart" className="overflow-hidden shadow-xl border-none">
          <Table headers={['Item Description', 'Price (₹)', 'Qty', 'Total', '']}>
            {cart.map(item => (
              <TableRow key={item.productId} className="group">
                <TableCell>
                  <input 
                    type="text"
                    value={item.name}
                    onChange={(e) => updateCartItem(item.productId, { name: e.target.value })}
                    className="w-full bg-transparent font-bold text-slate-900 uppercase text-xs focus:outline-none focus:border-b-2 border-primary-500 pb-1"
                  />
                </TableCell>
                <TableCell>
                  <input 
                    type="number"
                    value={item.price || ''}
                    onChange={(e) => updateCartItem(item.productId, { price: Number(e.target.value) })}
                    className="w-20 bg-transparent font-black text-slate-900 focus:outline-none focus:border-b-2 border-primary-500 pb-1"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartItem(item.productId, { quantity: Number(e.target.value) })}
                      className="w-12 bg-transparent text-center font-black text-slate-900 focus:outline-none focus:border-b-2 border-primary-500 pb-1"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-black text-primary-600">₹{item.total.toFixed(0)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 group-hover:scale-110" onClick={() => removeFromCart(item.productId)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {cart.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center opacity-30">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-black uppercase tracking-widest text-[10px]">No items added yet</p>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card title="Customer Details">
          <div className="space-y-4">
            <Input ref={custNameRef} label="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, custPhoneRef)} />
            <Input ref={custPhoneRef} label="Mobile Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} onKeyDown={(e) => handleKeyDown(e, discountRef)} />
          </div>
        </Card>

        <Card title="Order Summary" className="bg-slate-900 text-white border-none shadow-2xl">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <span>Gross Total</span>
              <span className="text-white">₹{subTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-3 pt-4 pb-4 border-y border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Discount (%)</span>
                <div className="flex items-center gap-2">
                  <input 
                    ref={discountRef}
                    type="number" value={discountPercent || ''}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    onKeyDown={(e) => handleKeyDown(e, roundingRef)}
                    className="w-16 text-right font-black text-rose-400 focus:outline-none bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-xs font-black text-rose-400">%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Adjustment / Rounding</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{rounding >= 0 ? '+' : ''}</span>
                  <input 
                    ref={roundingRef}
                    type="number" value={rounding || ''}
                    onChange={e => setRounding(Number(e.target.value))}
                    onKeyDown={(e) => handleKeyDown(e, generateBillBtnRef)}
                    className="w-20 text-right font-black text-emerald-400 focus:outline-none bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                    placeholder="+/- amt"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsGstEnabled(!isGstEnabled)}>
              <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-primary-400 transition-colors">Apply GST (12%)</span>
              {isGstEnabled ? <CheckCircle2 className="h-5 w-5 text-primary-500" /> : <Circle className="h-5 w-5 text-white/20" />}
            </div>

            <div className="my-2 h-px bg-white/10" />
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Final Settlement</p>
                <p className="text-4xl font-black italic tracking-tighter text-primary-400 leading-none">₹{totalAmount.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase italic">Pay Mode</p>
                <div className="flex gap-1 mt-1">
                  {['Cash', 'Card', 'UPI'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m as any)} className={cn("px-2 py-1 rounded text-[9px] font-black uppercase border transition-all", paymentMethod === m ? "bg-primary-600 border-primary-600 text-white" : "border-white/10 text-slate-500 hover:text-white")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button ref={generateBillBtnRef} className="w-full h-16 text-xl mt-4 gap-3 rounded-3xl font-black uppercase tracking-tighter shadow-2xl bg-primary-600 hover:bg-primary-700 hover:scale-[1.02] transition-all" disabled={cart.length === 0} onClick={handleGenerateClick}>
              <Receipt className="h-7 w-7" /> Generate Bill
            </Button>
          </div>
        </Card>
      </div>

      {/* Salesman Selection Modal */}
      <Modal isOpen={isSalesmanModalOpen} onClose={() => setIsSalesmanModalOpen(false)} title="Select Salesman" size="sm">
        <div className="space-y-4">
          <Input 
            ref={salesmanInputRef} placeholder="Type Number 1-4" 
            onChange={e => handleSalesmanSelect(e.target.value)}
            className="text-center text-3xl font-black tracking-[0.5em] h-16 rounded-2xl bg-slate-50 border-2 border-slate-200"
          />
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(SALESMEN).map(([id, name]) => (
              <button 
                key={id} onClick={() => finalizeInvoice(id, name)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-primary-500 hover:bg-primary-50 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-black text-slate-400 group-hover:text-primary-600 shadow-sm border border-slate-100">{id}</div>
                  <span className="font-black text-slate-700 uppercase tracking-tight group-hover:text-primary-700">{name}</span>
                </div>
                <UserRound className="h-5 w-5 text-slate-300 group-hover:text-primary-500" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
