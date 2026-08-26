"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  text: string;
}

// Real Google Business Profile reviews — update this list as new ones come in.
const REVIEWS: Review[] = [
  {
    name: "Regina",
    rating: 5,
    text: "Excellent customer service",
  },
  {
    name: "Abdul",
    rating: 5,
    text: "Excellent experience. I love how discreet and professional they are. Truly a discreet service in Ghana with safe packaging and quick response on WhatsApp.",
  },
  {
    name: "Abena",
    rating: 5,
    text: "Excellent service! I ordered from PleasureToys GH and my package arrived in Kumasi much faster than I expected. The packaging was completely discreet, the product quality was exactly as described, and communication throughout the process was professional. If you're looking for a reliable online adult wellness store with fast delivery to Kumasi, I highly recommend them.",
  },
  {
    name: "John",
    rating: 5,
    text: "Fast and discreet delivery to Tema! My vibrator arrived well packaged, and the service was professional from start to finish. Highly recommend PleasureToys GH.",
  },
  {
    name: "Ohema",
    rating: 5,
    text: "Bought a wand vibrator with delivery to Airport Residential Area. Super-fast delivery, discreet packaging, and exactly as advertised. The best place to buy sex toys in Accra.",
  },
];

const ROTATE_INTERVAL_MS = 5000;
const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/?q=place_id:ChIJa20knFGj3w8Rs-QV5Vswhqc";

export default function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % REVIEWS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const review = REVIEWS[index];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-10"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">
          What customers say
        </p>
        <h2 className="text-4xl font-display font-bold mb-3">
          Loved Across Ghana
        </h2>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white/50 hover:text-primary text-sm font-bold transition-colors"
        >
          <span className="flex items-center gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
          5.0 · 11 Google Reviews
        </a>
      </motion.div>

      <div
        className="relative max-w-2xl mx-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-12 md:px-16 md:py-16 min-h-[280px] flex items-center overflow-hidden">
          <Quote
            size={90}
            className="absolute -top-4 -left-2 text-primary/10 rotate-180"
            strokeWidth={0}
            fill="currentColor"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative text-center w-full"
            >
              <div className="flex items-center justify-center gap-1 mb-5 text-primary">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-primary font-bold text-sm uppercase tracking-widest">
                {review.name}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show review ${i + 1} of ${REVIEWS.length}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
