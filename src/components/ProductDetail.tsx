import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Package,
} from "lucide-react";
import { useCart, Product } from "../context/CartContext";
import { fetchProductById } from "../services/firebaseApi";
import { useSEO } from "../hooks/useSEO";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [id]);

  // SEO optimization for product pages
  const productKeywords = product 
    ? `${product.name}, ${product.category} Ghana, adult toys Accra, ${product.name} price Ghana, discreet delivery, pleasure toys, sex toys Ghana, ${product.name} review`
    : undefined;

  useSEO({
    title: product?.name,
    description: product 
      ? `${product.name} - ${product.description.substring(0, 150)}... Shop premium adult toys in Ghana with discreet delivery.`
      : undefined,
    keywords: productKeywords,
    image: product?.image,
    url: id ? `/product/${id}` : undefined,
    type: "product",
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-white/40 hover:text-primary mb-12 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Collection
      </Link>

      <div className="grid lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2.5rem] overflow-hidden border border-white/10"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="flex flex-col justify-center">
          <div className="inline-flex px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full w-fit mb-6">
            {product.category}
          </div>

          <h1 className="text-5xl font-display font-bold mb-4">
            {product.name}
          </h1>
          <p className="text-3xl font-display font-bold text-primary mb-8">
            GHS {product.price.toFixed(2)}
          </p>

          <p className="text-white/60 text-lg leading-relaxed mb-10">
            {product.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <ShieldCheck className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Body Safe
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <Truck className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Discreet
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <Package className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Premium
              </div>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="w-full py-5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <ShoppingCart size={24} />
            Add to Collection
          </button>
        </div>
      </div>
    </div>
  );
}
