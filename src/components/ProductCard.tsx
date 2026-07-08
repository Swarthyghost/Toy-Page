"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product, useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Link from 'next/link';
import { flyToCart } from '../utils/animations';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { siteSettings } = useSiteSettings();
  const showDiscount = siteSettings?.isDiscountTagsActive !== false && product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden transition-all hover:bg-white/10 hover:border-primary/50"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} - premium sex toys Ghana - PleasureToysGH`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {!product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Link
              href={`/product/${product.id}`}
              className="p-3 bg-white text-black rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              <Eye size={20} />
            </Link>
            <button
              onClick={(e) => {
                flyToCart(e);
                addToCart(product);
              }}
              className="p-3 bg-primary text-white rounded-full hover:bg-white hover:text-black transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 sm:top-4 sm:left-4 sm:px-3 sm:py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
          {product.category}
        </div>
        
        {/* SALE Badge */}
        {showDiscount && (
          <div className="absolute top-2 right-2 px-2 py-0.5 sm:top-4 sm:right-4 sm:px-3 sm:py-1 bg-red-600/90 backdrop-blur-md border border-red-500 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white shadow-lg animate-pulse">
            Sale
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm sm:text-lg font-bold mb-1 truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-white/40 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-1">
          {product.description}
        </p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
          <div className="flex flex-col">
            {showDiscount && (
              <span className="text-[10px] sm:text-sm font-bold text-white/40 line-through">
                GHS {product.originalPrice!.toFixed(2)}
              </span>
            )}
            <span className={`text-sm sm:text-xl font-display font-bold ${product.isOutOfStock ? 'text-white/20' : 'text-emerald-400'}`}>
              GHS {product.price.toFixed(2)}
            </span>
          </div>
          {product.isOutOfStock ? (
            <span className="w-full md:w-auto text-center px-1.5 py-1 sm:px-4 sm:py-2 bg-white/5 text-primary text-[8px] sm:text-[10px] md:text-sm font-bold uppercase tracking-widest rounded-xl border border-white/10">
              Restocking soon
            </span>
          ) : (
            <button
              onClick={(e) => {
                flyToCart(e);
                addToCart(product);
              }}
              className="w-full md:w-auto px-1.5 py-1 sm:px-4 sm:py-2 bg-white/5 hover:bg-primary text-white text-[8px] sm:text-[10px] md:text-sm font-bold rounded-xl transition-all border border-white/10 hover:border-primary"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
