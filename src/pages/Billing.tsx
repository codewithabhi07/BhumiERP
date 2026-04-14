import { useState, useMemo, useRef, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, Keyboard, CheckCircle2, Circle } from 'lucide-react';
import type { Product, InvoiceItem, Invoice, Size } from '../types';
import { InvoicePreview } from '../components/InvoicePreview';
import { cn } from '../utils/cn';

const ITEM_SHORTCUTS: Record<string, string> = {
  '1': 'Shirt',
  '2': 'Pant',
  '3': 'T-Shirt',
  '4': 'Night Pant',
  '5': 'Knicker',
  '6': 'Banyan (Vest)',
  '7': 'Lungi',
  '8': 'Ladies Top',
  '9': 'Gown',
  '10': 'Frock',
  '11': 'Ladies Knicker',
  '12': 'Ladies Bra',
  '13': 'Ladies Slip',
  '14': 'Small Kids Dress',
  '15': 'Rumal (Handkerchief)',
  '16': 'Cap',
  '17': 'Socks',
  '18': 'Stole',
  '19': 'Petticoat',
  '20': 'Shawl',
  '21': 'Ramraj Shirt',
  '22': 'Siyaram Shirt',
  '23': 'Sweater',
  '24': 'Kurta Pajama',
  '25': 'Sherwani',
  '26': 'Jodhpuri',
  '27': 'Modi Jacket',
  '28': 'Dhoti Pant',
  '29': 'Shawl',
  '30': 'Blazer',
  '31': '3 Pieces',
  '32': '5 Pieces',
  '33': '1 Piece',
  '34': 'Lace',
  '35': 'Half Night Pant',
  '36': 'Dupatta',
  '37': 'Baby Dress',
  '38': 'Punjabi Dress',
  '39': 'Coat Set',
  '40': 'Baba Suit',
  '41': 'Palazzo Jeans',
  '42': 'Palazzo'
};

const ITEM_SUGGESTIONS = Object.values(ITEM_SHORTCUTS);

export default function BillingPage() {
  const { products, updateStock } = useProductStore();
  const { addInvoice, settings } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

  // GST State
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(12);

  // Manual entry state
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualItem, setManualItem] = useState({
    name: '',
    price: 0,
    quantity: 1,
    size: 'M' as Size,
    color: 'Mix'
  });

  // Refs for keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);
  const manualPriceRef = useRef<HTMLInputElement>(null);
  const manualQtyRef = useRef<HTMLInputElement>(null);
  const manualSizeRef = useRef<HTMLSelectElement>(null);
  const manualAddBtnRef = useRef<HTMLButtonElement>(null);
  const custNameRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const generateBillBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isManualEntry) {
      manualNameRef.current?.focus();
    } else {
      searchInputRef.current?.focus();
    }
  }, [isManualEntry]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  ).slice(0, 5);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      updateQuantity(product.id, 1);
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        size: product.size,
        color: product.color,
        price: product.sellingPrice,
        quantity: 1,
        discount: 0,
        total: product.sellingPrice
      }]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleManualNameChange = (val: string) => {
    // If user types exactly a number that exists in our shortcuts
    if (ITEM_SHORTCUTS[val]) {
      setManualItem({ ...manualItem, name: ITEM_SHORTCUTS[val] });
    } else {
      setManualItem({ ...manualItem, name: val });
    }
  };

  const addManualToCart = () => {
    if (!manualItem.name || manualItem.price <= 0) return;

    setCart([...cart, {
      productId: `manual-${Date.now()}`,
      name: manualItem.name,
      size: manualItem.size,
      color: manualItem.color,
      price: manualItem.price,
      quantity: manualItem.quantity,
      discount: 0,
      total: manualItem.price * manualItem.quantity
    }]);

    setManualItem({ name: '', price: 0, quantity: 1, size: 'M', color: 'Mix' });
    manualNameRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const subTotal = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);
  const tax = useMemo(() => isGstEnabled ? (subTotal * (gstPercentage / 100)) : 0, [subTotal, isGstEnabled, gstPercentage]);
  const totalAmount = subTotal + tax - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Cash Customer',
      customerPhone,
      items: cart,
      subTotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      date: new Date().toISOString()
    };

    addInvoice(invoice);
    setLastInvoice(invoice);
    
    // Update stock for non-manual items
    cart.forEach(item => {
      if (!item.productId.startsWith('manual-')) {
        updateStock(item.productId, -item.quantity);
      }
    });

    // Reset
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setPaymentMethod('Cash');
    setIsGstEnabled(false);
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>, action?: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action) action();
      if (nextRef) nextRef.current?.focus();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {lastInvoice && (
        <InvoicePreview 
          invoice={lastInvoice} 
          settings={settings} 
          onClose={() => {
            setLastInvoice(null);
            searchInputRef.current?.focus();
          }} 
        />
      )}
      
      {/* Product Selection */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <Card title="Billing Panel" description="Search products or enter items manually.">
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
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="flex w-full items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-100"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          <span className="text-xs text-slate-500">{p.brand} | {p.size} | {p.color}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-slate-900">₹{p.sellingPrice}</span>
                          <span className="text-xs text-slate-400">Stock: {p.quantity}</span>
                          <Plus className="h-4 w-4 text-primary-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                variant={isManualEntry ? 'primary' : 'outline'} 
                className="gap-2 shrink-0 h-11"
                onClick={() => setIsManualEntry(!isManualEntry)}
              >
                <Keyboard className="h-4 w-4" /> Manual Entry (F2)
              </Button>
            </div>

            {isManualEntry && (
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4 relative">
                    <Input 
                      ref={manualNameRef}
                      label="Item Name (Type number for shortcut)" 
                      placeholder="e.g. 1 for Shirt" 
                      value={manualItem.name}
                      onChange={e => handleManualNameChange(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, manualPriceRef)}
                    />
                    {manualItem.name && ITEM_SUGGESTIONS.some(s => s.toLowerCase().includes(manualItem.name.toLowerCase())) && (
                      <div className="absolute top-full z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-40 overflow-y-auto">
                        {ITEM_SUGGESTIONS.filter(s => s.toLowerCase().includes(manualItem.name.toLowerCase())).map(s => (
                          <button 
                            key={s} 
                            className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-primary-50 hover:text-primary-600"
                            onClick={() => {
                              setManualItem({...manualItem, name: s});
                              manualPriceRef.current?.focus();
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Input 
                      ref={manualPriceRef}
                      label="Price" 
                      type="number" 
                      value={manualItem.price || ''}
                      onChange={e => setManualItem({...manualItem, price: Number(e.target.value)})}
                      onKeyDown={(e) => handleKeyDown(e, manualQtyRef)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Input 
                      ref={manualQtyRef}
                      label="Qty" 
                      type="number" 
                      value={manualItem.quantity}
                      onChange={e => setManualItem({...manualItem, quantity: Number(e.target.value)})}
                      onKeyDown={(e) => handleKeyDown(e, manualSizeRef)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</label>
                    <select 
                      ref={manualSizeRef}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                      value={manualItem.size}
                      onChange={e => setManualItem({...manualItem, size: e.target.value as Size})}
                      onKeyDown={(e) => handleKeyDown(e, manualAddBtnRef)}
                    >
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-end">
                    <Button 
                      ref={manualAddBtnRef}
                      className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-100" 
                      onClick={addManualToCart} 
                      disabled={!manualItem.name || manualItem.price <= 0}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Current Items" className="overflow-hidden shadow-xl">
          <Table headers={['Product', 'Price', 'Quantity', 'Total', '']}>
            {cart.map(item => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 uppercase tracking-tight">{item.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.size} | {item.color} {item.productId.startsWith('manual-') && '(Written)'}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-slate-900">₹{item.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" onClick={() => updateQuantity(item.productId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" onClick={() => updateQuantity(item.productId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-black text-primary-600">₹{item.total}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" onClick={() => removeFromCart(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {cart.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <ShoppingCart className="h-12 w-12" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Cart is empty</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </div>

      {/* Checkout Summary */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card title="Customer Details">
          <div className="space-y-4">
            <Input 
              ref={custNameRef}
              label="Customer Name" 
              placeholder="Guest Customer"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, custPhoneRef)}
            />
            <Input 
              ref={custPhoneRef}
              label="Phone Number" 
              placeholder="10-digit number"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, discountRef)}
            />
          </div>
        </Card>

        <Card title="Order Summary" className="bg-slate-50/50">
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-900">₹{subTotal.toFixed(2)}</span>
            </div>

            {/* GST Checkbox and Percentage */}
            <div className="space-y-3 pt-2 pb-2 border-y border-slate-200/60">
              <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setIsGstEnabled(!isGstEnabled)}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary-600 transition-colors">Apply GST Tax</span>
                {isGstEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                )}
              </div>
              
              {isGstEnabled && (
                <div className="flex items-center justify-between animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Rate (%)</span>
                    <input 
                      type="number"
                      value={gstPercentage}
                      onChange={e => setGstPercentage(Number(e.target.value))}
                      className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{tax.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>Final Discount</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">-</span>
                <input 
                  ref={discountRef}
                  type="number" 
                  value={discount || ''}
                  onChange={e => setDiscount(Number(e.target.value))}
                  onKeyDown={(e) => handleKeyDown(e, generateBillBtnRef)}
                  placeholder="0"
                  className="w-20 text-right font-black text-rose-600 focus:outline-none bg-transparent border-b-2 border-slate-200 focus:border-rose-400 pb-0.5"
                />
              </div>
            </div>
            <div className="my-4 h-px bg-slate-200" />
            <div className="flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grand Total</span>
              <span className="text-3xl font-black italic tracking-tighter text-primary-600 leading-none">₹{totalAmount.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { id: 'Cash', label: 'Cash' },
                { id: 'Card', label: 'Card' },
                { id: 'UPI', label: 'UPI' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={cn(
                    "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                    paymentMethod === m.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <Button 
              ref={generateBillBtnRef}
              className="w-full h-14 text-lg mt-4 gap-3 rounded-2xl font-black uppercase tracking-tighter shadow-2xl shadow-primary-200 animate-pulse hover:animate-none" 
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <Receipt className="h-6 w-6" /> Generate Bill (Enter)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
