import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkles, Shield, Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useSEO } from "../hooks/useSEO";

const MARQUEE_ITEMS = [
  "Premium Quality",
  "Discreet Delivery",
  "100% Private",
  "Fast Shipping",
  "Body Safe",
  "Curated Collection",
  "Ghana's Best",
  "Discreet Packaging",
];

function MarqueeBand() {
  return (
    <div className="relative overflow-hidden py-3 bg-primary/10 border-y border-primary/20">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/70"
          >
            <span className="w-1 h-1 rounded-full bg-primary/50 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const stats = [
  { value: "500+", label: "Products" },
  { value: "10k+", label: "Happy Clients" },
  { value: "100%", label: "Discreet" },
];

const features = [
  { icon: Shield, text: "Body Safe Materials" },
  { icon: Package, text: "Discreet Packaging" },
  { icon: Truck, text: "Fast Delivery" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // SEO optimization for homepage
  useSEO({
    title: undefined, // Uses default from hook
    description: undefined, // Uses default from hook
    url: "/",
  });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={containerRef} className="relative bg-black overflow-hidden">
      {/* ── Ambient background glows ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/[0.07] blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/[0.07] blur-[130px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px]" />
      </motion.div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ══════════════════════════════════════════
          MAIN HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-12">
        <motion.div
          className="max-w-7xl mx-auto px-6 w-full"
          style={{ y: textY, opacity }}
        >
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
            {/* ── Left: Copy ── */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-[0.15em] mb-8"
              >
                <Sparkles size={12} />
                Ghana's Premier Adult Boutique
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display font-bold leading-[1.05] mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
              >
                Explore
                <br />
                <span className="relative inline-block">
                  <span className="text-gradient">Pleasure</span>
                </span>
                <br />
                <span className="text-white/90">Without Limits.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg"
              >
                A curated collection of premium toys, elegant restraints and
                sensual accessories — delivered with complete privacy across
                Ghana.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-14"
              >
                <Link
                  to="/category/Vibrators"
                  className="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                >
                  Shop Collection
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  to="/category/BDSM"
                  className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl transition-all"
                >
                  Explore BDSM
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex items-center gap-10"
              >
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-10">
                    <div>
                      <div className="text-2xl font-display font-bold">
                        {s.value}
                      </div>
                      <div className="text-xs text-white/40 uppercase tracking-widest mt-0.5">
                        {s.label}
                      </div>
                    </div>
                    {i < stats.length - 1 && (
                      <div className="w-px h-10 bg-white/10" />
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Featured Product Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-3xl scale-110" />

              <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src="/hero-optimized.png"
                    alt="Rose Thrusting & Sucking Vibrator"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Featured badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full">
                    <Sparkles size={10} />
                    Featured
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">
                    Vibrators
                  </p>
                  <h3 className="text-xl font-display font-bold mb-1 leading-tight">
                    Rose Thrusting & Sucking Vibrator
                  </h3>
                  <p className="text-white/40 text-sm mb-5">
                    Advanced suction technology with dual stimulation modes
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-display font-bold text-primary">
                      GHS 450
                    </span>
                    <Link
                      to="/product/pcNPkD2LuoQ8hdODSntW"
                      className="group flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      View
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </Link>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                  {features.map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/50"
                    >
                      <Icon size={11} className="text-primary" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Marquee separator ── */}
      <MarqueeBand />

      {/* ══════════════════════════════════════════
          CATEGORY QUICK-ACCESS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">
              Browse by category
            </p>
            <h2 className="text-4xl font-display font-bold">
              Shop the Collection
            </h2>
          </div>
          <button
            onClick={() =>
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group flex items-center gap-2 text-white/40 hover:text-primary text-sm font-bold transition-colors cursor-pointer"
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              name: "Vibrators",
              emoji: "💜",
              desc: "Solo & couples",
              path: "/category/Vibrators",
              accent: "from-purple-900/30",
            },
            {
              name: "BDSM",
              emoji: "🖤",
              desc: "Restraints & more",
              path: "/category/BDSM",
              accent: "from-red-900/30",
            },
            {
              name: "Lubricants",
              emoji: "✨",
              desc: "Smooth & safe",
              path: "/category/Lubricants",
              accent: "from-blue-900/30",
            },
            {
              name: "Mens Toy",
              emoji: "🍆",
              desc: "For him",
              path: "/category/Mens Toy",
              accent: "from-indigo-900/30",
            },
            {
              name: "Accessories",
              emoji: "🎀",
              desc: "Enhance your play",
              path: "/category/Accessories",
              accent: "from-pink-900/30",
            },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={cat.path}
                className={`group block relative overflow-hidden bg-gradient-to-br ${cat.accent} to-white/[0.03] border border-white/10 rounded-3xl p-6 hover:border-white/20 hover:bg-white/5 transition-all duration-300`}
              >
                <div className="text-4xl mb-4">{cat.emoji}</div>
                <h3 className="font-display font-bold text-lg mb-1">
                  {cat.name}
                </h3>
                <p className="text-white/40 text-sm">{cat.desc}</p>
                <ArrowRight
                  size={16}
                  className="absolute bottom-5 right-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRUST BAND
      ══════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
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
                desc: "Order before noon for same-day delivery within Accra. Nationwide in 2–3 days.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
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
    </div>
  );
}
