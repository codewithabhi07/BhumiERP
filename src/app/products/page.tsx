'use client';

import { useState, useRef } from 'react';
import { useProductStore } from '../../store/useProductStore';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Package, 
  Layers,
  BarChart2,
  ChevronDown,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import type { Product } from '../../types';
import { cn } from '../../utils/cn';
import * as XLSX from 'xlsx';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, importProducts } = useProductStore();
  const { settings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', brand: '', category: '', size: 'M', color: '',
    barcode: '', purchasePrice: 0, sellingPrice: 0, quantity: 0, minQuantity: 5,
  });

  const lowStockLimit = settings.lowStockThreshold || 5;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const lowStockProducts = products.filter(p => p.quantity <= lowStockLimit);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', brand: '', category: '', size: 'M', color: '',
        barcode: Math.random().toString().slice(2, 12),
        purchasePrice: 0, sellingPrice: 0, quantity: 0, minQuantity: lowStockLimit,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct({ ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() } as Product);
    }
    setIsModalOpen(false);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        
        const newProducts: Product[] = data.map((item, idx) => ({
          id: `import-${Date.now()}-${idx}`,
          name: item.Name || item.name || 'Unknown Article',
          brand: item.Brand || item.brand || 'Local',
          category: item.Category || item.category || 'General',
          size: (item.Size || item.size || 'M') as any,
          color: item.Color || item.color || 'Mix',
          barcode: String(item.Barcode || item.barcode || Math.random().toString().slice(2, 12)),
          purchasePrice: Number(item.PurchasePrice || item.purchase_price || 0),
          sellingPrice: Number(item.SellingPrice || item.selling_price || 0),
          quantity: Number(item.Quantity || item.quantity || 0),
          minQuantity: Number(item.MinQuantity || item.min_quantity || lowStockLimit),
          createdAt: new Date().toISOString()
        }));

        if (confirm(`Detected ${newProducts.length} items. Do you want to replace your current inventory with this list?`)) {
          importProducts(newProducts);
          alert('Inventory updated successfully!');
        }
      } catch (err) {
        alert('Failed to parse Excel file. Ensure headers are correct (Name, Brand, Category, Size, Color, Barcode, PurchasePrice, SellingPrice, Quantity).');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
            <span className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-200">
              <Package className="h-6 w-6 text-white" />
            </span>
            Stock <span className="text-orange-500">Inventory</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Warehouse Management System</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => excelInputRef.current?.click()} className="gap-2 h-12 px-6 rounded-2xl font-black uppercase text-xs border-2 border-slate-200 text-slate-600 bg-white">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Import Excel
          </Button>
          <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
          <Button onClick={() => handleOpenModal()} className="gap-2 h-12 px-8 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-100 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-5 w-5" /> Add New Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-primary-500 flex items-center gap-4 group">
          <div className="p-3 rounded-2xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform"><Layers className="h-6 w-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Articles</p>
            <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-emerald-500 flex items-center gap-4 group">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform"><BarChart2 className="h-6 w-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Quantity</p>
            <h3 className="text-2xl font-black text-slate-900">{products.reduce((acc, p) => acc + p.quantity, 0)} Pcs</h3>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl border-b-4 border-b-rose-500 flex items-center gap-4 group">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform"><AlertCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alert</p>
            <h3 className="text-2xl font-black text-rose-600">{lowStockProducts.length} Items</h3>
          </div>
        </div>
      </div>

      <Card className="shadow-2xl border-none rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500" />
            <Input 
              placeholder="Search by name, brand or barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white"
            />
          </div>
          <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400">
            Current Threshold: <span className="text-rose-500 ml-1">{lowStockLimit} Pcs</span>
          </div>
        </div>

        <Table headers={['Product Information', 'Category', 'Price Details', 'Stock', 'Status', '']}>
          {filteredProducts.map((p) => (
            <TableRow key={p.id} className="hover:bg-slate-50/50 group">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{p.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.brand} • {p.barcode}</span>
                </div>
              </TableCell>
              <TableCell><span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{p.category}</span></TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 text-sm italic">₹{p.sellingPrice}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter line-through">Cost: ₹{p.purchasePrice}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn("text-sm font-black italic", p.quantity <= lowStockLimit ? 'text-rose-600' : 'text-slate-900')}>
                  {p.quantity} Pcs
                </span>
              </TableCell>
              <TableCell>
                {p.quantity <= lowStockLimit ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[9px] font-black text-rose-600 uppercase tracking-widest border border-rose-100">
                    <AlertCircle className="h-3 w-3" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                    Healthy
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600 hover:bg-primary-50 rounded-lg" onClick={() => handleOpenModal(p)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-50 rounded-lg" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Update Inventory' : 'Create New Stock Entry'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Article Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 bg-slate-50 border-none" />
          <Input label="Brand / Label" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="h-11 bg-slate-50 border-none" />
          <Input label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="h-11 bg-slate-50 border-none" />
          <Input label="Item Barcode" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="h-11 bg-slate-50 border-none" />
          <div className="grid grid-cols-2 gap-4 col-span-2">
            <Input label="Purchase Price (₹)" type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="h-11 bg-slate-50 border-none" />
            <Input label="Selling Price (₹)" type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="h-11 bg-slate-50 border-none font-bold text-primary-600" />
          </div>
          <div className="grid grid-cols-2 gap-4 col-span-2">
            <Input label="Current Quantity" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="h-11 bg-slate-50 border-none" />
            <Input label="Min Stock Alert" type="number" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})} className="h-11 bg-slate-50 border-none text-rose-500" />
          </div>
          <div className="col-span-2 flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-12 rounded-xl uppercase font-black tracking-widest text-[10px] border-2" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-12 rounded-xl uppercase font-black tracking-widest text-[10px] bg-orange-500 shadow-lg shadow-orange-100" onClick={handleSubmit}>
              {editingProduct ? 'Save Changes' : 'Add to Warehouse'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
