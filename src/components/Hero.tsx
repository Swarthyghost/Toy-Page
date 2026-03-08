import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            <span>Premium Adult Boutique</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-[1.1] mb-6">
            Elevate Your <br />
            <span className="text-gradient">Pleasure.</span>
          </h1>
          
          <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
            Discover a curated collection of premium toys, elegant restraints, and sensual accessories designed for ultimate satisfaction.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              to="/category/Vibrators"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              Shop Collection
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/category/BDSM"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
            >
              Explore BDSM
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-white/40">Products</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-white/40">Happy Clients</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-white/40">Discreet Delivery</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-primary/20">
            <img
              src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=1200"
              alt="Premium Product"
              className="w-full aspect-[4/5] object-cover hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl">
              <div className="text-sm text-primary font-bold mb-1 uppercase tracking-widest">Featured</div>
              <div className="text-2xl font-bold">Midnight Pulse Pro</div>
              <div className="text-white/60 text-sm mt-1">GHS 450.00</div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
