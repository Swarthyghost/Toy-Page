"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSEO } from "../../hooks/useSEO";

const privacyFaq = [
  {
    q: "Will anyone know what I ordered?",
    a: "No. Your privacy is our priority. Our packages are designed to look like regular deliveries, and your order details remain confidential."
  },
  {
    q: "Does the delivery package show PleasureToysGH branding?",
    a: "No. We use completely plain, discreet packaging to protect your privacy. No product descriptions or store logos are ever displayed on the outer box. Refer to our Delivery Information page for package examples."
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. Customer information is treated confidentially, encrypted during transmission, and only used to process orders, provide support, and improve your shopping experience."
  },
  {
    q: "Do you sell customer data?",
    a: "Never. We do not sell, trade, or share your contact details or order history with any third parties or marketing agencies."
  },
  {
    q: "How is communication secured?",
    a: "We use end-to-end encrypted messaging via WhatsApp for all consultations and order updates to ensure your correspondence remains private."
  }
];

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  const renderAnswerText = (text: string) => {
    if (text.includes("Delivery Information page")) {
      const parts = text.split("Delivery Information page");
      return (
        <span>
          {parts[0]}
          <Link href="/delivery-information" className="text-primary hover:underline font-semibold">
            Delivery Information page
          </Link>
          {parts[1]}
        </span>
      );
    }
    return text;
  };

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
          {renderAnswerText(answer)}
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  useSEO({
    title: "Privacy Policy | PleasureToysGH private sex toy shopping",
    description: "At PleasureToysGH, we prioritize your absolute confidentiality. Our privacy-policy outlines how we protect your data during private sex toy shopping in Ghana.",
    url: "/privacy-policy"
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
    "mainEntity": privacyFaq.map(item => ({
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
          <span className="text-white">Privacy Policy</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Privacy Policy
        </h1>

        <p className="text-white/60 text-lg leading-relaxed mb-12">
          At PleasureToysGH, we prioritize your absolute confidentiality. Our privacy-policy outlines how we protect your personal data and ensure completely private sex toy shopping in Ghana with discreet delivery in Accra and nationwide.
        </p>

        {/* Collapsible FAQ list */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-primary border-b border-white/10 pb-4">
            Confidentiality &amp; Data Security FAQ
          </h2>
          <div className="space-y-2">
            {privacyFaq.map((item, index) => (
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
          <h2 className="text-2xl font-display font-bold">Still have concerns?</h2>
          <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
            Your safety and security is our bottom line. If you want to place your order with a pseudonym or have custom packaging requests, message us on WhatsApp.
          </p>
          <a
            href="https://wa.me/233266181581?text=Hello%20PleasureToysGH%2C%20I%20have%20questions%20regarding%20data%20privacy%20and%20confidential%20billing."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20"
          >
            Chat privately on WhatsApp
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
