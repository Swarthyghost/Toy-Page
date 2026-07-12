"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSEO } from "../../hooks/useSEO";

const safetyFaq = [
  {
    q: "What lubricant is safe to use with silicone toys?",
    a: "Only water-based lubricants are safe to use with silicone toys. Silicone-based lubricants will chemically react with and dissolve the silicone toy surface, rendering it tacky, damaged, and unsafe for future bodily contact."
  },
  {
    q: "How often should I wash my toys?",
    a: "You must wash your adult toys before and after every single use. Doing so keeps them hygienic, removes bodily fluids, prevents bacteria build-up, and preserves the longevity of the materials."
  }
];

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-2 font-display text-lg md:text-xl font-bold text-white hover:text-primary transition-colors group focus:outline-none"
      >
        <h3>{question}</h3>
        <span className={`text-xl font-light transform transition-transform duration-300 ${isOpen ? "rotate-45 text-primary" : "text-white/40 group-hover:text-primary"}`}>
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-white/60 text-sm md:text-base leading-relaxed pb-4">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function AdultToySafetyGuidePage() {
  useSEO({
    title: "Adult Toy Safety & Hygiene Guide | PleasureToysGH",
    description: "Learn about adult toy safety, body-safe materials, antibacterial toy cleaner, silicone care, storage tips, and water-based lubricant compatibility in Ghana.",
    url: "/adult-toy-safety-guide"
  });

  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Build JSON-LD FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": safetyFaq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="text-xs uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-white">Adult Toy Safety Guide</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Adult Toy Safety &amp; Care Guide
        </h1>

        <p className="text-white/60 text-lg leading-relaxed mb-12">
          Explore our adult toy safety Ghana guide. Intimate health and product durability depend on proper material safety, cleaning, and storage. Learn how to care for your products for a safe, hygienic, and satisfying experience.
        </p>

        {/* Evergreen Content (400-600 words) */}
        <div className="prose prose-invert max-w-none space-y-8 text-white/60 mb-12">
          <section className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
              1. Material Safety First
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              Knowing what your toy is made of is the first step toward a safe experience. Non-porous materials like <strong>medical-grade silicone</strong>, borosilicate glass, and stainless steel are body-safe, hypoallergenic, and easy to clean. They do not absorb body fluids or bacteria, unlike cheaper, porous materials like jelly rubber or vinyl (PVC), which can trap pathogens and degrade over time. At PleasureToysGH, we prioritize body-safe, high-quality materials to guarantee health and wellness.
            </p>
          </section>

          <section className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
              2. Proper Cleaning &amp; Hygiene
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              Always wash your toys immediately before and after every use. For non-porous toys, rinse with warm water and a specialized antibacterial toy cleaner, or a mild, unscented soap. Avoid harsh chemicals, alcohol, or boiling water, as they can warp silicone and damage electronics. Pay close attention to texture ridges, joints, and buttons. 
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              If your toy is fully waterproof, it can be fully submerged during cleaning. If it is only splash-proof or contains non-waterproof ports, clean it using a damp soapy cloth, keeping water away from battery entries or charging slots.
            </p>
          </section>

          <section className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
              3. Lubricant Compatibility
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              Using the right lubricant is essential for your comfort and your toy's lifecycle. <strong>Never use silicone-based lubricants with silicone toys</strong>. Since they share the same chemical structure, silicone lube will dissolve the surface of a silicone toy, creating sticky crevices that trap harmful bacteria. We recommend using premium, pH-balanced water-based lubricants. Browse our certified body-safe products in the <Link href="/category/Lubricants" className="text-primary hover:underline font-semibold">Lubricants Category</Link>.
            </p>
          </section>

          <section className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
              4. Safe Storage Guidelines
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              Always let your toys air dry completely before storing them. Store them in a cool, dry place away from direct sunlight, which can weaken materials. Avoid storing silicone toys in direct contact with one another—silicone reacts chemically with other silicone surfaces and will cause mutual melting over time. Keep them in individual cotton or satin bags, or in separated storage drawer cells.
            </p>
          </section>

          <section className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">
              5. Safe &amp; Mindful Use
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              Follow all manufacturer guidelines, and wash toys thoroughly when moving between different body zones to prevent bacteria cross-transfer. If using toys for anal play, ensure they feature a flared base or pull ring for safe retrieval. For questions regarding return policies or product warranties, visit our general <Link href="/faq" className="text-primary hover:underline font-semibold">FAQ page</Link>.
            </p>
          </section>
        </div>

        {/* Collapsible FAQ list */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-12">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-primary border-b border-white/10 pb-4">
            Safety &amp; Lubricant Compatibility FAQ
          </h2>
          <div className="space-y-2">
            {safetyFaq.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.q}
                answer={item.a}
                isOpen={!!openItems[index]}
                onClick={() => toggleItem(index)}
              />
            ))}
          </div>
        </div>

        {/* trust block */}
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 text-center mt-16 space-y-6">
          <h2 className="text-2xl font-display font-bold">Still have questions about product safety?</h2>
          <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
            Do you want to know about material certification, motor levels, or specific care guides? Message our consultants on WhatsApp.
          </p>
          <a
            href="https://wa.me/233266181581?text=Hello%20PleasureToysGH%2C%20I%20have%20questions%20regarding%20adult%20toy%20material%20safety%20and%20hygiene."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20"
          >
            Chat with us on WhatsApp
          </a>
        </div>

        {/* Learn More / Internal Link Section */}
        <div className="border-t border-white/10 pt-12 mt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="font-bold text-lg mb-2">Want to learn more?</h2>
            <p className="text-white/40 text-sm">
              Check out our Guides section for more tips and expert advice on adult wellness.
            </p>
          </div>
          <Link
            href="/guides"
            className="px-6 py-3 bg-white/5 border border-white/10 hover:border-primary/50 text-white font-bold rounded-xl transition-all"
          >
            Explore Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
