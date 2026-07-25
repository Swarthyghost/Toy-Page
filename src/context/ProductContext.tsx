"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchProducts } from "../services/firebaseApi";
import type { Product } from "../services/firebaseApi";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      const visibleProducts = data.filter(p => !p.hide_product);
      setProducts(visibleProducts);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, refreshProducts: loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
