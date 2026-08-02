"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProducts } from "../context/ProductContext";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { Product } from "../context/CartContext";
import { useSEO } from "../hooks/useSEO";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-pulse">
      {/* Aspect-square image area */}
      <div className="relative aspect-square bg-white/10" />
      {/* Content area */}
      <div className="p-6 space-y-4">
        <div>
          <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-white/5 rounded-lg w-full" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 pt-2">
          <div className="h-5 bg-white/10 rounded-lg w-1/3" />
          <div className="h-9 bg-white/10 rounded-xl w-full md:w-24" />
        </div>
      </div>
    </div>
  );
};

export default function ProductListing() {
  const params = useParams();
  const rawCategoryName = params?.categoryName as string | undefined;
  const categoryName = rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined;
  const router = useRouter();
  const { products, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState(categoryName || "All");

  useEffect(() => {
    if (categoryName) {
      setActiveCategory(categoryName);
    } else {
      setActiveCategory("All");
    }
  }, [categoryName]);

  // SEO optimization to prevent Soft 404s
  const getCategoryKeywords = (category: string) => {
    const keywordMap: Record<string, string> = {
      All: "adult toys Ghana, sex toys Accra, vibrators Ghana, BDSM gear, lubricants, mens toys, discreet delivery, pleasure toys, adult shop Ghana",
      Vibrators:
        "vibrators Ghana, sex toys Accra, rabbit vibrators, bullet vibrators, wand vibrators, discreet delivery Ghana, adult toys Ghana",
      BDSM: "BDSM gear Ghana, bondage toys Accra, restraints, impact toys, sensation play, adult toys Ghana, discreet delivery",
      Lubricants:
        "lubricants Ghana, sex lube Accra, personal lubricant, water based lube, silicone lube, adult toys Ghana",
      "Mens Toy":
        "mens toys Ghana, male sex toys Accra, cock rings, masturbators, prostate massagers, adult toys for men",
      Accessories:
        "adult accessories Ghana, sex toy accessories Accra, cleaners, storage, batteries, adult toy maintenance",
    };
    return keywordMap[category] || keywordMap["All"];
  };

  const seoDetails = useMemo(() => {
    if (activeCategory === "All") {
      if (categoryName) {
        return {
          title: "Our Collection",
          description: "Browse Ghana's premier collection of adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana."
        };
      } else {
        return {
          title: "Buy Vibrators Online Ghana | PleasureToysGH",
          description: "Shop at PleasureToysGH, a discreet adult shop in Accra. Buy vibrators online in Ghana with fast delivery. Confidential packaging & payment on delivery."
        };
      }
    }
    
    switch (activeCategory) {
      case "Vibrators":
        return {
          title: "Vibrators Ghana — Buy Online | Fast Discreet Shipping",
          description: "Shop premium vibrators online in Ghana. Buy clitoral vibrators, couples toys in Accra with 100% confidential packaging and nationwide delivery."
        };
      case "BDSM":
        return {
          title: "BDSM Gear Ghana — Discreet Adult Shop Accra",
          description: "Buy premium BDSM gear and bondage kits in Ghana. Secure private sex toy shopping, confidential packaging, and payment on delivery in Accra."
        };
      case "Lubricants":
        return {
          title: "Lubricants Ghana — Body-Safe Lube | Discreet Delivery",
          description: "Buy organic water-based and silicone lubricants in Ghana. Shop premium body-safe lubes with 100% private packaging and fast delivery in Accra."
        };
      case "Mens Toy":
        return {
          title: "Male Masturbators Ghana — Private Shopping Accra",
          description: "Shop male masturbators, pocket pussies, and prostate massagers in Ghana. Discreet sex toys delivery, payment on delivery, complete privacy."
        };
      case "Accessories":
        return {
          title: "Sensual Accessories Ghana — Discreet Delivery Accra",
          description: "Buy premium adult accessories and toy cleaners in Ghana. Shop online with confidential packaging, fast shipping, and secure local payments."
        };
      default:
        return {
          title: `${activeCategory} Ghana — Discreet Delivery Accra`,
          description: `Explore high-quality ${activeCategory.toLowerCase()} on PleasureToysGH. Secure payment on delivery and confidential packaging across Ghana.`
        };
    }
  }, [activeCategory, categoryName]);

  useSEO({
    title: seoDetails.title,
    description: seoDetails.description,
    keywords: getCategoryKeywords(activeCategory),
    url: categoryName ? `/category/${categoryName}` : "/",
  });

  const categories = [
    "All",
    "Vibrators",
    "BDSM",
    "Lubricants",
    "Mens Toy",
    "Accessories",
  ];

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      router.push("/");
    } else {
      router.push(`/category/${cat}`);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "All" 
      ? products.filter(p => p.category?.trim() !== "Other Products") 
      : products.filter((p) => p.category?.trim() === activeCategory);
      
    return result.sort((a, b) => {
      if (a.isOutOfStock === b.isOutOfStock) return 0;
      return a.isOutOfStock ? 1 : -1;
    });
  }, [activeCategory, products]);

  return (
    <div id="collection" className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-6 md:mb-12 max-w-full overflow-hidden">
        <div>
          {categoryName ? (
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              {activeCategory === "All" ? "Our Collection" : `${activeCategory} Ghana`}
            </h1>
          ) : (
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              {activeCategory === "All" ? "Buy Vibrators Online Ghana" : `${activeCategory} Ghana`}
            </h2>
          )}
          <p className="text-white/40 max-w-md text-sm md:text-base font-normal">
            {activeCategory === "All"
              ? "Browse our premium selection of pleasure toys. Confidential packaging and same-day delivery."
              : `Discreet shipping Ghana sex toys same-day delivery. Explore premium ${activeCategory.toLowerCase()} in Accra.`}
          </p>
        </div>

        <div className="w-full max-w-full flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 md:px-6 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="p-2.5 md:p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))
        )}
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-white/20 text-xl mb-4">
            {activeCategory === "All"
              ? "New products coming soon! Check back regularly for our latest arrivals."
              : `${activeCategory} products coming soon! We're constantly updating our collection.`}
          </p>
          <p className="text-white/40 mb-8">
            Explore our other categories or contact us for special orders and
            recommendations.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleCategoryChange("All")}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl transition-colors"
            >
              View All Products
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-colors"
            >
              Request Special Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
