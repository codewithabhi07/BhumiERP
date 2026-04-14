import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import { mockProducts } from '../data/mockData';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantityChange: number) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: mockProducts,
      addProduct: (product) => 
        set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) => 
            p.id === id ? { ...p, ...updatedProduct } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      updateStock: (id, quantityChange) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, quantity: p.quantity + quantityChange } : p
          ),
        })),
    }),
    {
      name: 'garment-shop-products',
    }
  )
);
