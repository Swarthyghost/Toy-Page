"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProducts } from "../context/ProductContext";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { Product } from "../context/CartContext";
import { useSEO } from "../hooks/useSEO";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-pulse">
      {/* Aspect-square image area */}
      <div className="relative aspect-square bg-white/10" />
      {/* Content area */}
      <div className="p-6 space-y-4">
        <div>
          <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-white/5 rounded-lg w-full" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 pt-2">
          <div className="h-5 bg-white/10 rounded-lg w-1/3" />
          <div className="h-9 bg-white/10 rounded-xl w-full md:w-24" />
        </div>
      </div>
    </div>
  );
};

const CATEGORY_SEO_CONTENT: Record<string, {
  guideTitle: string;
  guideIntro: string;
  sections: { title: string; content: string }[];
  faqs: { question: string; answer: string }[];
}> = {
  All: {
    guideTitle: "Discreet Adult Toy Shopping in Ghana — Ultimate Guide",
    guideIntro: "Welcome to PleasureToys GH, the leading online adult store in Accra, Ghana. We are dedicated to providing the highest quality, body-safe intimacy products to enhance your sexual wellness and pleasure. Our service is built on 100% customer privacy, secure checkout, and discreet nationwide shipping.",
    sections: [
      {
        title: "Why Choose PleasureToys GH for Sex Toys in Ghana?",
        content: "We understand that shopping for adult toys requires trust and discretion. Every order we package is delivered in plain, unmarked wrappers with no reference to the contents or our shop name. Whether you are ordering a rabbit vibrator, a male masturbator, or premium body-safe lubricant, we guarantee 100% confidential delivery to your doorstep in Accra, Kumasi, Tema, and beyond."
      },
      {
        title: "How to Shop Safely for Intimacy Products",
        content: "Always look for body-safe materials. All of our products are made from medical-grade silicone, body-safe ABS plastic, or premium TPE. Avoid low-quality plastics that contain phthalates. Cleaning and maintaining your toys with proper toy cleaners ensures hygiene and longevity."
      }
    ],
    faqs: [
      {
        question: "How discreet is your adult toy delivery in Accra?",
        answer: "Extremely discreet. Your package is sealed in a non-transparent wrapper with only your name and phone number on the shipping label. The delivery rider does not know what is inside, and our business name 'PleasureToys GH' is not printed anywhere on the packaging."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We support Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money) and card payments through Paystack. You can also select Cash on Delivery / Mobile Money on Delivery for order locations within Accra and Tema."
      }
    ]
  },
  Vibrators: {
    guideTitle: "Vibrators Buying Guide Ghana — How to Choose the Right Toy",
    guideIntro: "Explore our premium selection of rechargeable, quiet, and waterproof vibrators. Whether you are looking for clitoral stimulation, deep G-spot sensations, or dual-action satisfaction, this guide will help you choose the best vibrator for your needs.",
    sections: [
      {
        title: "Understanding Different Types of Vibrators",
        content: "1. Clitoral Stimulators: Focuses on external pleasure, featuring air-pulse suction technology (like the popular Rose Toy) or classic bullets. 2. Rabbit Vibrators: Provide simultaneous clitoral and G-spot stimulation. 3. Wand Vibrators: Offer powerful external massage with broad heads and strong vibrations. 4. Bullet Vibrators: Compact, discreet, and perfect for targeted stimulation or beginner play."
      },
      {
        title: "Material Safety and Care",
        content: "We recommend choosing medical-grade silicone vibrators. Silicone is non-porous, hypoallergenic, and extremely easy to clean. Use only water-based lubricants with silicone toys, as silicone-based lube can degrade the toy surface."
      }
    ],
    faqs: [
      {
        question: "What is the Rose Toy vibrator and how does it work?",
        answer: "The Rose Toy is a popular clitoral suction vibrator that uses touch-free air pulse technology to simulate tongue-licking and oral stimulation. It is rechargeable, waterproof, and has multiple speed settings."
      },
      {
        question: "Can I use silicone lubricant with silicone vibrators?",
        answer: "No. Silicone-based lubricants will chemically react with silicone toys and ruin the texture. Always use high-quality water-based lubricants with silicone vibrators."
      }
    ]
  },
  BDSM: {
    guideTitle: "BDSM Gear & Bondage Kits in Ghana — A Beginner's Guide",
    guideIntro: "Discover sensual restraints, bondage gear, and sensation play toys. Our BDSM collection is crafted with durability, comfort, and safety in mind, perfect for couples looking to explore power exchange and spice up their bedroom intimacy.",
    sections: [
      {
        title: "Choosing Your First BDSM restraints",
        content: "For beginners, we recommend starting with soft leather or nylon handcuffs and blindfolds. Adjustable velcro restraints are easy to use and quick to remove, prioritizing comfort and safety. Always establish a clear safeword with your partner before beginning BDSM play."
      },
      {
        title: "Exploring Sensation Play",
        content: "Sensation play involves temperature, impact, or texture. Whips, paddles, and ticklers allow you to experiment with light impact. Combine with temperature play (using ice or specialized body wax) for heightened arousal."
      }
    ],
    faqs: [
      {
        question: "Is BDSM gear safe for beginners?",
        answer: "Yes, provided you prioritize communication and safety. We offer soft, padded restraints and beginner BDSM kits that are designed for comfort and ease of use. Always ensure you have quick-release mechanisms or keys close by."
      },
      {
        question: "What are the essential rules of BDSM play?",
        answer: "The fundamental rule of BDSM is SSC (Safe, Sane, and Consensual) or RACK (Risk-Aware Consensual Kink). Establish clear boundaries, check in with your partner, and use safewords."
      }
    ]
  },
  Lubricants: {
    guideTitle: "Personal Lubricant Guide Ghana — Enhancing Intimacy & Comfort",
    guideIntro: "Lube is a game-changer for intimacy. It reduces friction, heightens sensations, and makes intimacy more comfortable. Read about the difference between water-based and silicone lubricants to make the right choice.",
    sections: [
      {
        title: "Water-Based vs. Silicone Lubricants",
        content: "1. Water-Based Lube: Extremely versatile, easy to wash off, and 100% compatible with latex condoms and silicone toys. 2. Silicone-Based Lube: Long-lasting, waterproof, and doesn't dry out. Perfect for shower play, but should not be used with silicone sex toys."
      },
      {
        title: "Ingredient Transparency and Body Safety",
        content: "We select only body-safe lubricants that are free from harsh parabens, glycerin, or artificial colors. Organic and pH-balanced lubricants match your body's natural fluids, preventing irritation or yeast infections."
      }
    ],
    faqs: [
      {
        question: "Is water-based lubricant safe to use with condoms?",
        answer: "Yes. Water-based lubricant is fully compatible with latex, polyisoprene, and polyurethane condoms, and will not cause them to break."
      },
      {
        question: "How do I wash off personal lubricant?",
        answer: "Water-based lubricants wash off easily with simple warm water. Silicone lubricants may require mild soap and water to wash off completely from the skin."
      }
    ]
  },
  "Mens Toy": {
    guideTitle: "Male Masturbators & Pocket Pussies — Premium Mens Toys Ghana",
    guideIntro: "Explore male pleasure sleeves, masturbator cups, and automatic masturbators. Modern mens toys offer realistic textures, suction control, and automated licking or vibration patterns to take solo play to the next level.",
    sections: [
      {
        title: "How to Choose a Male Masturbator",
        content: "1. Pocket Pussies: Compact, open-ended or closed sleeves made of soft TPE that mimic realistic textures. 2. Masturbator Cups: Standard cups with customizable inner suction and textures, offering hands-free options. 3. Automatic Masturbators: Battery-powered devices that stroke, vibrate, or lick automatically."
      },
      {
        title: "Cleaning and Storing Male Toys",
        content: "Since TPE and silicone are delicate, wash them with warm water and antibacterial toy cleaner immediately after use. Let the toy air-dry completely, and apply renewing powder (or cornstarch) to keep the texture soft and non-sticky."
      }
    ],
    faqs: [
      {
        question: "What is a pocket pussy masturbator?",
        answer: "It is a handheld male masturbation sleeve made of soft, stretchy, skin-like TPE. It features internal textures (ribs, nubs, or chambers) that simulate realistic intercourse sensations."
      },
      {
        question: "How do I maintain my male TPE toys?",
        answer: "Wash with warm water (avoid hot water as it can warp TPE). Use toy cleaner or mild soap, rinse, dry thoroughly, and apply renewing powder to prevent stickiness."
      }
    ]
  },
  Accessories: {
    guideTitle: "Sensual Accessories & Maintenance Guide Ghana",
    guideIntro: "Keep your toys clean, charged, and organized. Proper maintenance accessories extend the lifespan of your intimacy products and guarantee a hygienic, safe pleasure experience every single time.",
    sections: [
      {
        title: "Toy Cleaners and Hygiene",
        content: "Standard soap can sometimes contain alcohol or scents that dry out silicone. Alcohol-free antibacterial toy cleaners are specifically formulated to sterilize toys safely without damaging the material. Spray, leave for 5 seconds, and wipe clean."
      },
      {
        title: "Storage and Batteries",
        content: "Store toys separately in satin or velvet storage bags to avoid lint attraction. Separate storage also prevents silicone toys from touching each other, which can lead to color transfer or surface degradation."
      }
    ],
    faqs: [
      {
        question: "Why should I use a dedicated toy cleaner instead of regular soap?",
        answer: "Regular soap may contain harsh chemicals, alcohol, or fragrances that degrade silicone or body-safe plastics. Toy cleaners are alcohol-free, antibacterial, and maintain the integrity of your toys."
      },
      {
        question: "How should I store my sex toys safely?",
        answer: "Store them in a cool, dry place. Keep them inside individual breathable storage bags (like satin or velvet) to prevent dust accumulation and avoid chemical reactions between different toys."
      }
    ]
  }
};

export default function ProductListing() {
  const params = useParams();
  const rawCategoryName = params?.categoryName as string | undefined;
  const categoryName = rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined;
  const router = useRouter();
  const { products, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState(categoryName || "All");

  const currentSEOContent = CATEGORY_SEO_CONTENT[activeCategory] || CATEGORY_SEO_CONTENT["All"];

  useEffect(() => {
    if (categoryName) {
      setActiveCategory(categoryName);
    } else {
      setActiveCategory("All");
    }
  }, [categoryName]);

  // SEO optimization to prevent Soft 404s
  const getCategoryKeywords = (category: string) => {
    const keywordMap: Record<string, string> = {
      All: "adult toys Ghana, sex toys Accra, vibrators Ghana, BDSM gear, lubricants, mens toys, discreet delivery, pleasure toys, adult shop Ghana",
      Vibrators:
        "vibrators Ghana, sex toys Accra, rabbit vibrators, bullet vibrators, wand vibrators, discreet delivery Ghana, adult toys Ghana",
      BDSM: "BDSM gear Ghana, bondage toys Accra, restraints, impact toys, sensation play, adult toys Ghana, discreet delivery",
      Lubricants:
        "lubricants Ghana, sex lube Accra, personal lubricant, water based lube, silicone lube, adult toys Ghana",
      "Mens Toy":
        "mens toys Ghana, male sex toys Accra, cock rings, masturbators, prostate massagers, adult toys for men",
      Accessories:
        "adult accessories Ghana, sex toy accessories Accra, cleaners, storage, batteries, adult toy maintenance",
    };
    return keywordMap[category] || keywordMap["All"];
  };

  const seoDetails = useMemo(() => {
    if (activeCategory === "All") {
      if (categoryName) {
        return {
          title: "Our Collection",
          description: "Browse Ghana's premier collection of adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana."
        };
      } else {
        return {
          title: "Buy Vibrators Online Ghana | PleasureToysGH",
          description: "Shop at PleasureToysGH, a discreet adult shop in Accra. Buy vibrators online in Ghana with fast delivery. Confidential packaging & payment on delivery."
        };
      }
    }
    
    switch (activeCategory) {
      case "Vibrators":
        return {
          title: "Vibrators Ghana — Buy Online | Fast Discreet Shipping",
          description: "Shop premium vibrators online in Ghana. Buy clitoral vibrators, couples toys in Accra with 100% confidential packaging and nationwide delivery."
        };
      case "BDSM":
        return {
          title: "BDSM Gear Ghana — Discreet Adult Shop Accra",
          description: "Buy premium BDSM gear and bondage kits in Ghana. Secure private sex toy shopping, confidential packaging, and payment on delivery in Accra."
        };
      case "Lubricants":
        return {
          title: "Lubricants Ghana — Body-Safe Lube | Discreet Delivery",
          description: "Buy organic water-based and silicone lubricants in Ghana. Shop premium body-safe lubes with 100% private packaging and fast delivery in Accra."
        };
      case "Mens Toy":
        return {
          title: "Male Masturbators Ghana — Private Shopping Accra",
          description: "Shop male masturbators, pocket pussies, and prostate massagers in Ghana. Discreet sex toys delivery, payment on delivery, complete privacy."
        };
      case "Accessories":
        return {
          title: "Sensual Accessories Ghana — Discreet Delivery Accra",
          description: "Buy premium adult accessories and toy cleaners in Ghana. Shop online with confidential packaging, fast shipping, and secure local payments."
        };
      default:
        return {
          title: `${activeCategory} Ghana — Discreet Delivery Accra`,
          description: `Explore high-quality ${activeCategory.toLowerCase()} on PleasureToysGH. Secure payment on delivery and confidential packaging across Ghana.`
        };
    }
  }, [activeCategory, categoryName]);

  useSEO({
    title: seoDetails.title,
    description: seoDetails.description,
    keywords: getCategoryKeywords(activeCategory),
    url: categoryName ? `/category/${categoryName}` : "/",
  });

  const categories = [
    "All",
    "Vibrators",
    "BDSM",
    "Lubricants",
    "Mens Toy",
    "Accessories",
  ];

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      router.push("/");
    } else {
      router.push(`/category/${cat}`);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "All" 
      ? products.filter(p => p.category?.trim() !== "Other Products") 
      : products.filter((p) => p.category?.trim() === activeCategory);
      
    return result.sort((a, b) => {
      if (a.isOutOfStock === b.isOutOfStock) return 0;
      return a.isOutOfStock ? 1 : -1;
    });
  }, [activeCategory, products]);

  return (
    <div id="collection" className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-6 md:mb-12 max-w-full overflow-hidden">
        <div>
          {categoryName ? (
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              {activeCategory === "All" ? "Our Collection" : `${activeCategory} Ghana`}
            </h1>
          ) : (
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              {activeCategory === "All" ? "Buy Vibrators Online Ghana" : `${activeCategory} Ghana`}
            </h2>
          )}
          <p className="text-white/40 max-w-md text-sm md:text-base font-normal">
            {activeCategory === "All"
              ? "Browse our premium selection of pleasure toys. Confidential packaging and same-day delivery."
              : `Discreet shipping Ghana sex toys same-day delivery. Explore premium ${activeCategory.toLowerCase()} in Accra.`}
          </p>
        </div>

        <div className="w-full max-w-full flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 md:px-6 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="p-2.5 md:p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))
        )}
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-white/20 text-xl mb-4">
            {activeCategory === "All"
              ? "New products coming soon! Check back regularly for our latest arrivals."
              : `${activeCategory} products coming soon! We're constantly updating our collection.`}
          </p>
          <p className="text-white/40 mb-8">
            Explore our other categories or contact us for special orders and
            recommendations.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleCategoryChange("All")}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold rounded-2xl transition-colors"
            >
              View All Products
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-colors"
            >
              Request Special Order
            </button>
          </div>
        </div>
      )}

      {/* Category Buying Guide and FAQs Section */}
      {!loading && (
        <div className="mt-16 md:mt-24 pt-12 border-t border-white/10">
          <div className="grid lg:grid-cols-3 gap-12 text-left">
            {/* Guide Column */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                {currentSEOContent.guideTitle}
              </h2>
              <p className="text-white/70 leading-relaxed text-xs md:text-sm">
                {currentSEOContent.guideIntro}
              </p>
              
              {currentSEOContent.sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-base md:text-lg font-bold text-primary">
                    {section.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed text-xs">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQs Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {currentSEOContent.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group border border-white/10 rounded-2xl p-5 bg-white/5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                  >
                    <summary className="flex items-center justify-between font-bold text-xs text-white/95 group-open:text-primary transition-colors list-none">
                      <span>{faq.question}</span>
                      <span className="ml-1.5 flex-shrink-0 text-white/40 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 text-xs leading-relaxed text-white/60">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Inject Dynamic JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": currentSEOContent.faqs.map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              })
            }}
          />
        </div>
      )}
    </div>
  );
}
