import { create } from 'zustand';
import type { Product } from '../types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantityChange: number) => Promise<void>;
  importProducts: (products: Product[]) => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Products endpoint returned non-JSON response:', text.substring(0, 200));
        throw new Error('Products endpoint returned non-JSON response (HTML error page?)');
      }
      const products = await res.json();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    set((state) => ({ products: [product, ...state.products] }));
  },

  updateProduct: async (id, updatedProduct) => {
    await fetch('/api/products', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updatedProduct }),
    });
    set((state) => ({
      products: state.products.map((p) => 
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    }));
  },

  deleteProduct: async (id) => {
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  updateStock: async (id, quantityChange) => {
    const product = get().products.find(p => p.id === id);
    if (product) {
      const newQuantity = product.quantity + quantityChange;
      await fetch('/api/products', {
        method: 'PUT',
        body: JSON.stringify({ id, quantity: newQuantity }),
      });
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, quantity: newQuantity } : p
        ),
      }));
    }
  },

  importProducts: (newProducts) => {
    if (!newProducts) return;
    set(() => ({ products: newProducts }));
  },
}));
