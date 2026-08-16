"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Package,
  Clock,
} from "lucide-react";
import { useCart, Product } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { fetchProductById, fetchPublishedGuides, Guide } from "../services/firebaseApi";
import { useProducts } from "../context/ProductContext";
import { useSEO } from "../hooks/useSEO";
import { flyToCart } from "../utils/animations";
import { parseMarkdown } from "../utils/markdown";
import { slugify } from "../utils/seoHelper";
import ProductCard from "./ProductCard";

interface ProductDetailProps {
  initialProduct?: Product;
}

export default function ProductDetail({ initialProduct }: ProductDetailProps = {}) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [activeImage, setActiveImage] = useState<string>(initialProduct?.image || "");
  const { addToCart } = useCart();
  const { siteSettings } = useSiteSettings();
  const { products } = useProducts();
  const [relevantGuides, setRelevantGuides] = useState<Guide[]>([]);
  const showDiscount = siteSettings?.isDiscountTagsActive !== false && product?.originalPrice && product.originalPrice > product.price;
  const topCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Show the mobile sticky "Add to Cart" bar once the user has scrolled past
  // the primary CTA near the top of the page.
  useEffect(() => {
    const target = topCtaRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only reveal the sticky bar once the CTA has scrolled above the
        // viewport (top < 0) — not simply because it hasn't been scrolled
        // to yet on initial load (which is also "not intersecting").
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      if (initialProduct.image) setActiveImage(initialProduct.image);
      setLoading(false);
    } else if (slug) {
      fetchProductById(slug)
        .then((data) => {
          if (data?.hide_product) {
            router.replace("/");
            return;
          }
          setProduct(data);
          if (data?.image) setActiveImage(data.image);
        })
        .finally(() => setLoading(false));
    }
  }, [slug, router, initialProduct]);

  useEffect(() => {
    if (product) {
      fetchPublishedGuides()
        .then((guides) => {
          const filtered = guides.filter(g => 
            (g.relatedProductIds && g.relatedProductIds.includes(product.id)) ||
            (g.category?.toLowerCase() === product.category?.toLowerCase())
          ).slice(0, 3);
          setRelevantGuides(filtered);
        })
        .catch(err => console.error("Error loading relevant guides:", err));
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id && !p.hide_product)
      .slice(0, 4);
  }, [products, product]);

  // SEO optimization for product pages
  const productKeywords = product 
    ? `${product.name}, ${product.category} Ghana, adult toys Accra, ${product.name} price Ghana, discreet delivery, pleasure toys, sex toys Ghana, ${product.name} review`
    : undefined;

  const seoDetails = useMemo(() => {
    if (!product) return { title: undefined, description: undefined };
    const name = product.name;
    const category = product.category;
    const description = product.description || "";
    const cleanName = name.toLowerCase().trim();
    
    let seoTitle = `${name} Ghana — Discreet ${category} Delivery Accra`;
    let seoDescription = `${name} - ${description.substring(0, 140)}... Discreet delivery in Accra and across Ghana.`;

    // Specific product keyword mappings
    if (cleanName.includes('rose toy')) {
      seoTitle = "Rose Vibrator — Discreet Clitoral Stimulator | Buy Online Ghana";
      seoDescription = "Shop the popular Rose Toy clitoral vibrator in Ghana. 100% private shopping and same-day discreet delivery in Accra. Payment on delivery available.";
    } else if (cleanName.includes('sucking') || cleanName.includes('air pulse')) {
      seoTitle = `${name} — Sucking Vibrator Ghana | Discreet Delivery Accra`;
      seoDescription = `Buy the ultimate sucking vibrator online in Ghana. Discreet same-day delivery in Accra. 100% confidential packaging and fast shipping.`;
    } else if (cleanName.includes('thrusting') || cleanName.includes('telescopic')) {
      seoTitle = `${name} — Thrusting Vibrator | Buy Online Ghana | Fast Discreet Shipping`;
      seoDescription = `Shop high-quality thrusting vibrators. Private adult toy shopping in Ghana with fast nationwide delivery and payment on delivery options.`;
    } else if (category.toLowerCase().includes('vibrator') && cleanName.includes('g-spot')) {
      seoTitle = `${name} — Rechargeable G-Spot Vibrator Ghana | Nationwide Delivery`;
      seoDescription = `Find the best rechargeable G-Spot vibrators in Ghana. Fast, discreet adult toys delivery in Accra and nationwide. Shop in complete privacy.`;
    } else if (cleanName.includes('bdsm') || cleanName.includes('bondage') || cleanName.includes('leather')) {
      seoTitle = `${name} — BDSM Gear Ghana | Discreet Adult Shop Accra`;
      seoDescription = `Explore premium BDSM gear and bondage kits. Secure private sex toy shopping in Ghana. 100% discreet packaging and delivery.`;
    } else if (cleanName.includes('handcuff')) {
      seoTitle = `${name} — Bondage Handcuffs | Buy Online Ghana`;
      seoDescription = `Shop high-quality bondage restraints and handcuffs online. Fast, discreet shipping in Accra and across Ghana. Secure payment on delivery.`;
    } else if (cleanName.includes('butt plug') || cleanName.includes('anal')) {
      seoTitle = `${name} — Butt Plugs Ghana | Discreet Packaging & Delivery`;
      seoDescription = `Buy premium silicone butt plugs and anal toys in Ghana. 100% confidential packaging and same-day discreet delivery in Accra.`;
    } else if (cleanName.includes('masturbator') || cleanName.includes('pocket pussy') || cleanName.includes('fleshlight')) {
      seoTitle = `${name} — Male Masturbator Ghana | Private Shopping, Discreet Delivery`;
      seoDescription = `Purchase premium male masturbators and pocket pussies in Accra, Ghana. 100% private shopping, discreet shipping, payment on delivery.`;
    } else if (cleanName.includes('dildo') || cleanName.includes('jelly dildo')) {
      seoTitle = `${name} — Jelly Dildo Ghana | Buy Online, Nationwide Delivery`;
      seoDescription = `Buy realistic jelly dildos online in Ghana. Fast, confidential packaging and safe sex toys delivery in Accra and other regions.`;
    } else if (category.toLowerCase().includes('lubricant') || cleanName.includes('lube')) {
      seoTitle = `${name} — Water-Based Lubricant Ghana | Buy Online, Discreet Shipping`;
      seoDescription = `Shop premium body-safe lubricants in Ghana. Long-lasting water-based lube with 100% discreet delivery. Buy online today.`;
    }

    return { title: seoTitle, description: seoDescription };
  }, [product]);

  useSEO({
    title: seoDetails.title,
    description: seoDetails.description,
    keywords: productKeywords,
    image: product?.image,
    url: product ? `/product/${product.slug || slugify(product.name)}` : undefined,
    type: "product",
  });

  const richDescription = useMemo(() => {
    if (!product) return "";
    let desc = product.description || "";
    if (desc.split(/\s+/).length >= 150) return desc;

    const name = product.name;
    const category = product.category;
    const cleanName = name.toLowerCase().trim();
    
    let extension = "";
    if (cleanName.includes('rose toy')) {
      extension = ` This premium clitoral stimulator is designed for maximum body-safe comfort and intense pleasure. As a top choice at PleasureToysGH, our discreet adult shop in Accra provides direct access to the popular rose toy and couples toys in Accra with complete confidentiality. Enjoy private sex toy shopping in Ghana with fast delivery. We prioritize safe materials and whisper-quiet motors, making it perfect for both beginners and experienced users.`;
    } else if (cleanName.includes('sucking') || cleanName.includes('air pulse')) {
      extension = ` Experience the ultimate in pinpoint stimulation with advanced air-pulse sucking technology. We provide fast, discreet shipping for Ghana sex toys, ensuring your order arrives in 100% confidential packaging. Buy sex toys in Ghana with same-day delivery in Accra. This product features medical-grade body-safe silicone and rechargeable waterproof designs, making it a premium addition to your self-care routine.`;
    } else if (cleanName.includes('thrusting') || cleanName.includes('telescopic')) {
      extension = ` Elevate your solo play or partner intimacy with deep-reaching automated thrusting sensations. This rechargeable vibrator is crafted from premium body-safe materials and designed to satisfy. Order online with same-day delivery in Accra. With PleasureToysGH, buy vibrators online in Ghana and enjoy confidential packaging for all pleasure products nationwide.`;
    } else if (category.toLowerCase().includes('vibrator') && cleanName.includes('g-spot')) {
      extension = ` This ergonomically curved G-spot vibrator targets your most sensitive areas with powerful, multi-speed vibration patterns. Perfect for private sex toy shopping in Ghana, we offer payment on delivery options. Buy vibrators online in Ghana today. Features a body-safe, rechargeable design and waterproof silicone finish for easy maintenance and safe usage.`;
    } else if (cleanName.includes('bdsm') || cleanName.includes('bondage') || cleanName.includes('leather')) {
      extension = ` Crafted for adventurous couples and sensory exploration, this BDSM and bondage gear set is both durable and comfortable. We ensure secure private sex toy shopping in Ghana with confidential packaging and discreet adult shop delivery in Accra. Safe for direct skin contact and designed for adjustable, secure fits for both beginners and enthusiasts.`;
    } else if (cleanName.includes('handcuff')) {
      extension = ` Expand your restraint play with comfortable, adjustable wrist cuffs. Designed for safe, exciting bedroom bondage, these cuffs feature quick-release buckles for safety. Order sex toys online in Ghana with fast, same-day delivery and private packaging. Ideal for couples seeking to build trust and play in absolute privacy.`;
    } else if (cleanName.includes('butt plug') || cleanName.includes('anal')) {
      extension = ` This smooth, tapered silicone butt plug is ideal for temperature play and deep pressure. Features a flared safety base for worry-free exploration and body-safe compatibility. Enjoy 100% confidential packaging and fast sex toys delivery in Accra. Shop securely at PleasureToysGH and explore anal play comfortably.`;
    } else if (cleanName.includes('masturbator') || cleanName.includes('pocket pussy')) {
      extension = ` Experience realistic, textured inner chambers designed for high-sensation male pleasure. Crafted from durable, easy-to-clean body-safe TPE. PleasureToysGH provides private shopping and discreet shipping of male adult toys in Ghana. Pay on delivery is available for same-day Accra orders.`;
    } else if (cleanName.includes('dildo')) {
      extension = ` This realistic dildo is crafted from high-quality silicone for firm yet flexible play. Featuring a sturdy suction cup base, it is compatible with harnesses and flat surfaces. Order sex toys in Ghana with discreet shipping. Every package is sealed in plain wrappers for complete customer privacy.`;
    } else if (category.toLowerCase().includes('lubricant') || cleanName.includes('lube')) {
      extension = ` Formulated to match natural moisture, this body-safe personal lubricant reduces friction and enhances overall comfort. Compatible with natural rubber latex and silicone toys, it washes off easily with warm water. Buy personal lube online in Ghana with fast, private packaging and delivery.`;
    } else {
      extension = ` Enhance your personal wellness collection with this premium ${category.toLowerCase()} product. Built with high-quality body-safe components, we assure 100% discreet shipping for Ghana sex toys. Buy sex toys online in Ghana with fast same-day delivery in Accra and payment on delivery options nationwide.`;
    }

    return desc + " " + extension.trim();
  }, [product]);

  const imageAltText = useMemo(() => {
    if (!product) return "";
    return `${product.name} - rechargeable ${product.category.toLowerCase()} Ghana - PleasureToysGH`;
  }, [product]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 animate-pulse">
        {/* Back Link Placeholder */}
        <div className="h-6 bg-white/5 rounded-lg w-32 mb-12" />

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column: Images */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white/10 aspect-square w-full" />
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5" />
              ))}
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col justify-center">
            {/* Category */}
            <div className="h-4 bg-white/5 rounded-md w-24 mb-4" />
            {/* Title */}
            <div className="h-12 bg-white/10 rounded-2xl w-3/4 mb-6" />
            {/* Description Lines */}
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-white/5 rounded-lg w-full" />
              <div className="h-4 bg-white/5 rounded-lg w-full" />
              <div className="h-4 bg-white/5 rounded-lg w-2/3" />
            </div>
            {/* Price */}
            <div className="h-8 bg-white/10 rounded-xl w-32 mb-8" />
            {/* Button */}
            <div className="h-14 bg-white/10 rounded-2xl w-full sm:w-48 mb-12" />

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );

  const sku = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const absoluteImages = [product.image, ...(product.images || [])].map((img) =>
    img.startsWith("http") ? img : `https://pleasuretoysgh.com${img}`
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pb-24">
      {/* Product JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": absoluteImages,
            "description": product.description || "",
            "sku": sku,
            "category": product.category,
            "brand": {
              "@type": "Brand",
              "name": "PleasureToys GH"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://pleasuretoysgh.com/product/${product.slug || slugify(product.name)}`,
              "priceCurrency": "GHS",
              "price": product.price.toString(),
              "availability": product.isOutOfStock 
                ? "https://schema.org/OutOfStock" 
                : "https://schema.org/InStock"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://pleasuretoysgh.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": product.category,
                "item": `https://pleasuretoysgh.com/category/${encodeURIComponent(product.category)}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://pleasuretoysgh.com/product/${product.slug || slugify(product.name)}`
              }
            ]
          })
        }}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/40 hover:text-primary mb-12 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Collection
      </Link>

      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-6 lg:sticky lg:top-24">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] overflow-hidden border border-white/10"
          >
            <Image
              src={activeImage}
              sizes="(max-width: 640px) 100vw, 800px"
              alt={imageAltText}
              className="w-full aspect-square object-cover"
              referrerPolicy="no-referrer"
              width={800}
              height={800}
              priority
            />
          </motion.div>

          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              <button
                onClick={() => setActiveImage(product.image)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === product.image ? 'border-primary' : 'border-transparent hover:border-white/20'
                }`}
              >
                <Image
                  src={product.image}
                  alt={`${product.name} main view thumbnail`}
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              </button>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-primary' : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} detail view ${idx + 1} thumbnail`}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <Link
            href={`/category/${encodeURIComponent(product.category)}`}
            className="inline-flex px-3 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-bold uppercase tracking-widest rounded-full w-fit mb-6 transition-all"
          >
            {product.category}
          </Link>

          {showDiscount && (
            <div className="inline-flex ml-3 px-3 py-1 bg-red-600/20 border border-red-500 text-red-500 text-xs font-bold uppercase tracking-widest rounded-full w-fit mb-6 animate-pulse">
              {`${Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF`}
            </div>
          )}

          <h1 className="text-5xl font-display font-bold mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex flex-col">
              {showDiscount && (
                <p className="text-lg font-bold text-white/40 line-through">
                  GHS {product.originalPrice!.toFixed(2)}
                </p>
              )}
              <p className={`text-3xl font-display font-bold ${product.isOutOfStock ? 'text-white/20' : 'text-primary'}`}>
                GHS {product.price.toFixed(2)}
              </p>
            </div>
            {product.isOutOfStock && (
              <div className="px-4 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                Restocking soon
              </div>
            )}
          </div>

          <div ref={topCtaRef}>
            {product.isOutOfStock ? (
              <div className="w-full py-5 bg-white/5 border border-white/10 text-primary font-bold rounded-2xl flex items-center justify-center gap-3 mb-10">
                 Restocking soon
              </div>
            ) : (
              <button
                onClick={(e) => {
                  flyToCart(e);
                  addToCart(product);
                }}
                className="w-full py-5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 group mb-10"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
            )}
          </div>

          <div
            className="rich-text-content text-white/60 text-lg leading-relaxed mb-10"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(richDescription) }}
          />

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

          {product.isOutOfStock ? (
            <div className="w-full py-5 bg-white/5 border border-white/10 text-primary font-bold rounded-2xl flex items-center justify-center gap-3">
               Restocking soon
            </div>
          ) : (
            <button
              onClick={(e) => {
                flyToCart(e);
                addToCart(product);
              }}
              className="w-full py-5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 group"
            >
              <ShoppingCart size={24} />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Mobile sticky Add to Cart bar — appears once scrolled past the primary CTA */}
      {showStickyBar && !product.isOutOfStock && (
        <div
          className="fixed left-3 z-50 md:hidden bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl flex items-center gap-4 px-4"
          style={{
            right: '5.5rem',
            bottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 truncate">{product.name}</p>
            <p className="text-lg font-display font-bold text-primary">GHS {product.price.toFixed(2)}</p>
          </div>
          <button
            onClick={(e) => {
              flyToCart(e);
              addToCart(product);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all flex-shrink-0"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-white/10">
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Discover More</span>
            <h2 className="text-3xl font-display font-bold">Related Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Relevant Guides Section */}
      {relevantGuides.length > 0 && (
        <div className="mt-24 pt-16 border-t border-white/10">
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Wellness Tips</span>
            <h2 className="text-3xl font-display font-bold">Intimacy & Wellness Guides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relevantGuides.map((guideItem) => (
              <div
                key={guideItem.id}
                className="bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors flex flex-col group"
              >
                <Link href={`/guides/${guideItem.slug}`} className="block relative aspect-video overflow-hidden">
                  {guideItem.featuredImage ? (
                    <Image
                      src={guideItem.featuredImage}
                      alt={guideItem.featuredImageAlt || "Guide thumbnail"}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 350px"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                      <Clock size={24} />
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-grow space-y-2">
                  <Link
                    href={`/category/${encodeURIComponent(guideItem.category)}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-primary transition-colors"
                  >
                    {guideItem.category}
                  </Link>
                  <h3 className="font-bold text-base font-display line-clamp-1 group-hover:text-primary transition-colors">
                    <Link href={`/guides/${guideItem.slug}`}>{guideItem.title}</Link>
                  </h3>
                  <p className="text-xs text-white/40 line-clamp-2 leading-relaxed flex-grow">
                    {guideItem.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
