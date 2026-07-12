"use client";

import React from "react";
import { motion } from "motion/react";
import { Heart, Shield, Eye, Lock } from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export default function About() {
  useSEO({
    title: "Our Story",
    description:
      "Learn about PleasureToys GH - Ghana's premier adult toy store. Empowering individuals and couples with quality products, discretion, and absolute privacy since 2020.",
    url: "/about",
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-24"
      >
        <h1 className="text-6xl font-display font-bold mb-8">Our Story</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          PleasureToys GH was founded with a simple mission: to empower
          individuals and couples in Ghana to explore their desires with
          confidence, elegance, and absolute privacy.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          {
            icon: Heart,
            title: "Passion",
            desc: "We are passionate about sexual wellness and exploration.",
          },
          {
            icon: Shield,
            title: "Quality",
            desc: "Every product is hand-picked for safety and premium performance.",
          },
          {
            icon: Eye,
            title: "Discretion",
            desc: "Your privacy is our top priority. 100% discreet packaging.",
          },
          {
            icon: Lock,
            title: "Security",
            desc: "Safe transactions and reliable delivery across Ghana.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-8 bg-white/5 border border-white/10 rounded-[2rem] text-center hover:bg-white/10 transition-colors"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <item.icon className="text-primary" size={32} />
            </div>
            <h2 className="text-xl font-bold mb-4">{item.title}</h2>
            <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[3rem] overflow-hidden relative h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&q=80&w=2000"
          alt="Atmosphere"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-12">
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-display font-bold mb-6">
              Empowering Intimacy
            </h2>
            <p className="text-white/80 text-lg">
              We believe that pleasure is a fundamental part of a healthy life.
              Our boutique is designed to be a safe space for discovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
