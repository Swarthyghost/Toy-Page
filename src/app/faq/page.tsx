"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSEO } from "../../hooks/useSEO";

const faqData = {
  "Ordering & Shopping": [
    {
      q: "How do I place an order on PleasureToysGH?",
      a: "You can easily place an order by browsing our products, adding your preferred items to your cart, and completing checkout. You can also contact us directly through WhatsApp for private assistance with your order."
    },
    {
      q: "Do I need an account to buy from PleasureToysGH?",
      a: "No. You can shop and place an order without creating an account. However, creating an account makes it track orders easily and enjoy a smoother shopping experience."
    },
    {
      q: "Are your products available for immediate delivery?",
      a: "Yes. Products marked as available are ready for dispatch. Once your order is confirmed, we process it quickly. For more details on dispatch times and pricing by region, see our dedicated Delivery Information page."
    },
    {
      q: "Can I order discreetly?",
      a: "Absolutely. We understand the importance of privacy. All orders are packaged discreetly without revealing product names or details on the package. You can learn more about our commitment to confidentiality on our Privacy Policy page."
    }
  ],
  "Payment Questions": [
    {
      q: "What payment methods do you accept?",
      a: "We accept secure payment options available during checkout through Paystack, which includes MasterCard, Visa Card, Bank Transfers, and MoMo (Mobile Money). You can also contact our support team for alternative methods."
    },
    {
      q: "Is online payment secure?",
      a: "Yes. We use Paystack's secure payment gateway designed to encrypt and protect your transaction details."
    },
    {
      q: "Can I pay when my order arrives?",
      a: "Payment on delivery is available for orders within Accra Only. For orders outside Accra, we require payment before dispatching your items. Please check our Delivery Information page for region-specific guidelines."
    }
  ],
  "Brand Trust FAQ": [
    {
      q: "Why choose PleasureToysGH?",
      a: "PleasureToysGH provides a private, convenient, and trusted way to explore adult wellness products in Ghana with discreet delivery and customer-focused support."
    },
    {
      q: "Is PleasureToysGH a Ghanaian company?",
      a: "Yes. We serve customers in Ghana with products, delivery options, and support designed for the local market."
    },
    {
      q: "Do you offer customer support before buying?",
      a: "Yes. Our team is available to help answer questions and guide you toward products that match your needs."
    },
    {
      q: "Can I ask questions about a product before ordering?",
      a: "Yes. We encourage customers to ask questions before purchasing so they can choose the right product with confidence."
    }
  ],
  "Returns & Support": [
    {
      q: "Can I return an adult toy after purchase?",
      a: "Due to hygiene and personal wellness standards, returns are limited once products have been opened or used. Please refer to our Adult Toy Safety Guide for cleaning and storage tips to maximize product lifespan."
    },
    {
      q: "What happens if I receive a damaged product?",
      a: "Contact our support team immediately with your order details and photos of the issue. We will help resolve the problem."
    },
    {
      q: "What if I order the wrong product?",
      a: "Contact us as soon as possible before your order is shipped so we can adjust it."
    }
  ]
};

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  // Check if answer contains links to delivery or privacy policy to render them as anchor tags
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
    if (text.includes("Privacy Policy page")) {
      const parts = text.split("Privacy Policy page");
      return (
        <span>
          {parts[0]}
          <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">
            Privacy Policy page
          </Link>
          {parts[1]}
        </span>
      );
    }
    if (text.includes("Adult Toy Safety Guide")) {
      const parts = text.split("Adult Toy Safety Guide");
      return (
        <span>
          {parts[0]}
          <Link href="/adult-toy-safety-guide" className="text-primary hover:underline font-semibold">
            Adult Toy Safety Guide
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
        <h2>{question}</h2>
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

export default function FAQPage() {
  useSEO({
    title: "Frequently Asked Questions | PleasureToysGH FAQ",
    description: "Find answers about placing orders, Paystack secure payment, and private sex toy shopping in Ghana with fast discreet delivery in Accra and nationwide.",
    url: "/faq"
  });

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Build JSON-LD FAQ Schema
  const allQuestions = Object.values(faqData).flat();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allQuestions.map(item => ({
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
          <span className="text-white">FAQ</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Frequently Asked Questions
        </h1>

        <p className="text-white/60 text-lg leading-relaxed mb-12">
          Welcome to PleasureToysGH. If you are looking to buy vibrators online in Ghana or seeking private sex toy shopping, check out our frequently asked questions below regarding ordering, payment, and trust. We prioritize complete confidentiality with pleasure products delivery in Accra and nationwide.
        </p>

        <div className="space-y-12">
          {Object.entries(faqData).map(([sectionTitle, questions]) => (
            <div key={sectionTitle} className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-display font-bold mb-6 text-primary border-b border-white/10 pb-4">
                {sectionTitle}
              </h3>
              <div className="space-y-2">
                {questions.map((item, index) => {
                  const uniqueKey = `${sectionTitle}-${index}`;
                  return (
                    <AccordionItem
                      key={index}
                      question={item.q}
                      answer={item.a}
                      isOpen={!!openItems[uniqueKey]}
                      onClick={() => toggleItem(uniqueKey)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Block */}
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 text-center mt-16 space-y-6">
          <h3 className="text-2xl font-display font-bold">Still have questions?</h3>
          <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
            Our customer care team is available 24/7 for 100% confidential and private counseling. Chat with us directly on WhatsApp.
          </p>
          <a
            href="https://wa.me/233266181581?text=Hello%20PleasureToysGH%2C%20I%20have%20some%20questions%20about%20your%20products."
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
            <h4 className="font-bold text-lg mb-2">Want to learn more?</h4>
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
