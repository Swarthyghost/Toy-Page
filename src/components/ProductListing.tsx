import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/firebaseApi';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { Product } from '../context/CartContext';

export default function ProductListing() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState(categoryName || 'All');

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (categoryName) {
      setActiveCategory(categoryName);
    } else {
      setActiveCategory('All');
    }
  }, [categoryName]);

  const categories = ['All', 'Vibrators', 'BDSM', 'Lubricants', 'Accessories', 'Mens Toy'];

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      navigate('/');
    } else {
      navigate(`/category/${cat}`);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category?.trim() === activeCategory);
  }, [activeCategory, products]);

  return (
    <div id="collection" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-display font-bold mb-4">
            {activeCategory === 'All' ? 'Our Collection' : activeCategory}
          </h1>
          <p className="text-white/40 max-w-md">
            Browse our premium selection of {activeCategory.toLowerCase()} and find your next favorite pleasure tool.
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
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>
      
      {filteredProducts.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-white/20 text-xl">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
