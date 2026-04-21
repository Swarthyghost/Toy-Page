import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/firebaseApi";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { Product } from "../context/CartContext";
import { useSEO } from "../hooks/useSEO";

export default function ProductListing() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState(categoryName || "All");

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

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

  useSEO({
    title: activeCategory === "All" ? "Our Collection" : activeCategory,
    description:
      activeCategory === "All"
        ? "Browse Ghana's premier collection of adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana."
        : `Shop premium ${activeCategory.toLowerCase()} in Ghana. High-quality products with fast, discreet delivery. Explore our curated selection today.`,
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
      navigate("/");
    } else {
      navigate(`/category/${cat}`);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category?.trim() === activeCategory);
  }, [activeCategory, products]);

  return (
    <div id="collection" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-display font-bold mb-4">
            {activeCategory === "All" ? "Our Collection" : activeCategory}
          </h1>
          <p className="text-white/40 max-w-md">
            Browse our premium selection of {activeCategory.toLowerCase()} and
            find your next favorite pleasure tool.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
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
              onClick={() => navigate("/contact")}
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
