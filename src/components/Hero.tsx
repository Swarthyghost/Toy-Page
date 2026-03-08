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
            Explore <br />
            <span className="text-gradient">Pleasure Without Limits.</span>
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

       
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">Featured Product</h2>
          <p className="text-white/60 mb-8">Experience pleasure with our premium selection</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
          <div className="grid md:grid-cols-1 gap-8 p-6">
            <div className="relative h-96">
              <div className="absolute inset-0">
                <img
                  src="/rosetoy2in1.jpg"
                  alt="Rose Toy Sucking Vibrator 2 in 1"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="relative z-10 flex items-end justify-center p-8 h-full">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Rose Toy Sucking Vibrator 2 in 1</h3>
                  <p className="text-white/80 text-sm mb-4">Premium pleasure device with advanced suction technology</p>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">GHS 400.00</span>
                    <Link
                      to="/product/featured-rose-vibrator"
                      className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
          </div>
          </div>
        </div>
      </div>

    </section>
  );
}
