import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/firebaseApi';
import ProductCard from './ProductCard';
import { Shield, Heart, Zap, Lock } from 'lucide-react';
import { Product } from '../context/CartContext';

export default function BDSMPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const bdsmProducts = useMemo(() => {
    return products.filter((p) => p.category === 'BDSM');
  }, [products]);

  const subcategories = [
    { id: 'all', name: 'All Items', icon: Heart },
    { id: 'restraints', name: 'Restraints', icon: Lock },
    { id: 'impact', name: 'Impact Toys', icon: Zap },
    { id: 'sensation', name: 'Sensation Play', icon: Shield },
  ];

  const filteredProducts = useMemo(() => {
    if (selectedSubcategory === 'all') return bdsmProducts;
    // For now, return all products since we don't have subcategory data
    return bdsmProducts;
  }, [selectedSubcategory, bdsmProducts]);

  const features = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Premium materials and safety-tested designs for peace of mind'
    },
    {
      icon: Heart,
      title: 'Quality Craftsmanship',
      description: 'Expertly crafted items designed for durability and comfort'
    },
    {
      icon: Zap,
      title: 'Enhanced Experience',
      description: 'Professional-grade equipment for ultimate satisfaction'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/50 to-red-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-bold mb-6">
              <Shield size={16} />
              <span>EXCLUSIVE COLLECTION</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[1.1] mb-6">
              Explore Your <br />
              <span className="text-gradient">Desires.</span>
            </h1>
            
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated BDSM collection featuring premium restraints, 
              impact toys, and sensation play equipment designed for safe, consensual exploration.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="#products"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Browse Collection
              </Link>
              <Link
                to="/category/BDSM"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Our BDSM Collection?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Professional-grade equipment designed with your safety and satisfaction in mind
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-purple-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold mb-4">BDSM Collection</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Explore our premium selection of BDSM equipment and accessories
            </p>
          </motion.div>

          {/* Subcategory Filter */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedSubcategory === sub.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <sub.icon size={16} />
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
          
          {filteredProducts.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-white/20 text-xl">No products found in this subcategory.</p>
              <Link
                to="/category/BDSM"
                className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-colors"
              >
                View All BDSM Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold mb-6">
              <Shield size={16} />
              <span>SAFETY & CONSENT</span>
            </div>
            
            <h2 className="text-4xl font-display font-bold mb-6">
              Play Safe, Explore Confidently
            </h2>
            
            <p className="text-white/60 mb-8 leading-relaxed">
              All our BDSM products are selected with safety as the top priority. Remember to always practice safe, 
              sane, and consensual play. Establish clear boundaries, use safe words, and prioritize communication 
              with your partner(s).
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3 text-purple-400">Communication</h3>
                <p className="text-white/60 text-sm">Open discussion before, during, and after play sessions</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3 text-red-400">Boundaries</h3>
                <p className="text-white/60 text-sm">Know and respect personal limits and safe words</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3 text-purple-400">Aftercare</h3>
                <p className="text-white/60 text-sm">Emotional and physical care after intense sessions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
