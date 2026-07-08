import React from "react";
import { motion } from "motion/react";
import { Shield, Package, Truck } from "lucide-react";

const trustItems = [
  {
    icon: Package,
    title: "Plain Packaging",
    desc: "All orders arrive in unmarked, discreet packaging. No brand names visible.",
  },
  {
    icon: Shield,
    title: "Body-Safe Materials",
    desc: "Every product is vetted for safety. Medical-grade silicone & phthalate-free.",
  },
  {
    icon: Truck,
    title: "Same-Day Accra",
    desc: "Order before 8pm for same-day delivery within Accra. Nationwide next day.",
  },
];

export default function TrustBand() {
  return (
    <section className="border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustItems.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-5 p-6 rounded-2xl hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">{title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
