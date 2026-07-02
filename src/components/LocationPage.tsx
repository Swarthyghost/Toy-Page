"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Sparkles, Shield, Package, Truck } from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export default function LocationPage({ city }: { city: string }) {
  // Format city name from URL slug (e.g. "east-legon" -> "East Legon")
  const formattedCity = city 
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useSEO({
    title: `Premium Adult Toys in ${formattedCity} | Fast & Discreet Delivery`,
    description: `Shop the best adult toys, vibrators, and BDSM gear in ${formattedCity}. Experience 100% discreet packaging and fast, reliable delivery to ${formattedCity} with PleasureToys GH.`,
    keywords: `adult toys ${formattedCity}, sex toys ${formattedCity}, vibrators ${formattedCity}, discreet delivery ${formattedCity}, pleasure toys ${formattedCity}`,
    url: `/${city}`,
  });

  const features = [
    { icon: Shield, title: "Body Safe", desc: "Premium materials" },
    { icon: Package, title: "100% Discreet", desc: "Private packaging" },
    { icon: Truck, title: "Fast Delivery", desc: `Direct to ${formattedCity}` },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      {/* ── Background Glow ── */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/[0.05] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-[0.15em] mb-6">
            <MapPin size={12} />
            Delivering to {formattedCity}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Premium Adult Toys in <br/>
            <span className="text-gradient">{formattedCity}</span>
          </h1>
          
          <p className="text-white/50 text-lg mb-10">
            Welcome to PleasureToys GH! We offer a curated collection of high-quality vibrators, BDSM gear, and accessories. Enjoy fast, 100% discreet delivery directly to your door in {formattedCity}.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            >
              Shop All Products
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold font-display mb-2">{feature.title}</h3>
              <p className="text-white/40">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* SEO Text Block */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-6 text-primary">
            <Sparkles size={24} />
            <h2 className="text-2xl font-bold font-display">Why Choose Us in {formattedCity}?</h2>
          </div>
          <div className="space-y-4 text-white/50 leading-relaxed">
            <p>
              When looking for adult toys in {formattedCity}, privacy and quality are top priorities. At PleasureToys GH, we understand the importance of discretion. Every order dispatched to {formattedCity} is securely packaged in plain, unbranded materials, ensuring your personal business remains completely private.
            </p>
            <p>
              Our exclusive range includes everything from beginner-friendly vibrators and high-quality lubricants to advanced BDSM restraints and couples' accessories. Experience the best pleasure tools available in Ghana without compromising on safety or satisfaction. Order today and elevate your intimate experiences in {formattedCity}.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
