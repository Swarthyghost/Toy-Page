"use client";

import React from "react";
import { useProducts } from "../context/ProductContext";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function FeaturedSection() {
  const { products, loading } = useProducts();

  if (loading) {
    return null;
  }

  const featuredProduct = products.find((p) => p.featured === true);

  if (!featuredProduct) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-10"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">
          Special Spotlight
        </p>
        <h2 className="text-4xl font-display font-bold">
          Featured Product
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-[380px_1fr] gap-12 items-center bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative"
      >
        {/* Glow behind section */}
        <div className="absolute inset-0 bg-primary/5 pointer-events-none blur-3xl rounded-[2.5rem] -z-10" />

        {/* Product Card Container */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[340px]">
            <ProductCard product={featuredProduct} />
          </div>
        </div>

        {/* Spotlight Details */}
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
            <Sparkles size={12} className="fill-primary animate-pulse" />
            Spotlight Deal
          </span>
          
          <h3 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
            {featuredProduct.name}
          </h3>

          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl">
            {featuredProduct.description}
          </p>

          <div className="flex items-center gap-6 pt-4 w-full sm:w-auto">
            <Link
              href={`/product/${featuredProduct.id}`}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-primary text-black hover:text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5 hover:shadow-primary/20 w-full sm:w-auto"
            >
              View Product
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
