"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { slugify } from '../utils/seoHelper';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 md:pt-32 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search size={20} className="text-white/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-base"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-white/40 text-sm">
              No products found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug || slugify(product.name)}`}
              onClick={onClose}
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{product.name}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider">{product.category}</p>
              </div>
              <span className="text-primary font-bold text-sm flex-shrink-0">
                GHS {product.price.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
