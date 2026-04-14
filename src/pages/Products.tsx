import { useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { Product, Size } from '../types';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: '',
    size: 'M',
    color: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minQuantity: 5,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: '',
        size: 'M',
        color: '',
        barcode: Math.random().toString().slice(2, 15),
        purchasePrice: 0,
        sellingPrice: 0,
        quantity: 0,
        minQuantity: 5,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct({
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      } as Product);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Stock</h1>
          <p className="text-sm text-slate-500">Manage your garment inventory and stock levels.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by name, brand or barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        <Table headers={['Product', 'Category', 'Size/Color', 'Price', 'Stock', 'Status', 'Actions']}>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{product.name}</span>
                  <span className="text-xs text-slate-500">{product.brand} | {product.barcode}</span>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {product.size}
                  </span>
                  <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {product.color}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">₹{product.sellingPrice}</span>
                  <span className="text-xs text-slate-400 line-through">₹{product.purchasePrice}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={product.quantity <= product.minQuantity ? 'font-bold text-red-600' : 'text-slate-700'}>
                  {product.quantity}
                </span>
              </TableCell>
              <TableCell>
                {product.quantity <= product.minQuantity ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                    <AlertCircle className="h-3 w-3" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    In Stock
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)}>
                    <Edit2 className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingProduct ? 'Update Product' : 'Save Product'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Product Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Brand" 
            value={formData.brand} 
            onChange={e => setFormData({...formData, brand: e.target.value})}
          />
          <Input 
            label="Category" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          />
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Size</label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              value={formData.size}
              onChange={e => setFormData({...formData, size: e.target.value as Size})}
            >
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Input 
            label="Color" 
            value={formData.color} 
            onChange={e => setFormData({...formData, color: e.target.value})}
          />
          <Input 
            label="Barcode" 
            value={formData.barcode} 
            onChange={e => setFormData({...formData, barcode: e.target.value})}
          />
          <Input 
            label="Purchase Price (₹)" 
            type="number"
            value={formData.purchasePrice} 
            onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
          />
          <Input 
            label="Selling Price (₹)" 
            type="number"
            value={formData.sellingPrice} 
            onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})}
          />
          <Input 
            label="Quantity in Stock" 
            type="number"
            value={formData.quantity} 
            onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
          />
          <Input 
            label="Min Stock Level" 
            type="number"
            value={formData.minQuantity} 
            onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})}
          />
        </div>
      </Modal>
    </div>
  );
}
