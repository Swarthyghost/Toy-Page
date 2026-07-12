"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSEO } from "../../hooks/useSEO";

const deliveryFaq = [
  {
    q: "Do you deliver across Ghana?",
    a: "Yes. PleasureToysGH offers delivery services across Ghana, including Accra, Kumasi, Takoradi, Cape Coast, Tamale, and other regions."
  },
  {
    q: "How long does delivery take?",
    a: "Delivery times depend on your location. Accra orders are delivered same-day if ordered early, while deliveries outside Accra take 24 hours."
  },
  {
    q: "How much is delivery?",
    a: "Delivery fees range from GHS 30 within Accra to GHS 70 for northern regions. Exact delivery costs will be confirmed before dispatch."
  },
  {
    q: "Can I receive my order at a different location?",
    a: "Yes. You can provide any safe delivery address, including your workplace, home, or a designated pick-up station."
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once your order has been processed, we will provide SMS or WhatsApp updates with dispatcher details or bus tracking details."
  },
  {
    q: "Is the packaging discreet during shipping?",
    a: "Yes, 100%. All orders are double-wrapped in plain, unmarked packages. There is no mention of adult toys or our brand name on the external label. For more details on our data protection, see our Privacy Policy."
  }
];

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  const renderAnswerText = (text: string) => {
    if (text.includes("Privacy Policy")) {
      const parts = text.split("Privacy Policy");
      return (
        <span>
          {parts[0]}
          <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">
            Privacy Policy
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

export default function DeliveryInformationPage() {
  useSEO({
    title: "Delivery Information | PleasureToysGH discreet shipping",
    description: "Get reliable sex toy delivery in Ghana. PleasureToysGH provides fast and secure discreet delivery in Accra, Kumasi, Takoradi, Cape Coast and nationwide.",
    url: "/delivery-information"
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
    "mainEntity": deliveryFaq.map(item => ({
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
          <span className="text-white">Delivery Information</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Delivery Information
        </h1>

        <p className="text-white/60 text-lg leading-relaxed mb-12">
          Get reliable sex toy delivery in Ghana. PleasureToysGH provides safe, secure, and fast discreet delivery in Accra and nationwide. Learn about our delivery regions, transit times, and packaging specifications below.
        </p>

        {/* Pricing Zone Table */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 mb-12">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-primary">
            Delivery Zones &amp; Pricing
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/60">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Region / Location</th>
                  <th className="py-3 px-4">Delivery Window</th>
                  <th className="py-3 px-4">Estimated Fee</th>
                  <th className="py-3 px-4">Pay on Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Accra (Greater Accra)</td>
                  <td className="py-4 px-4">Same-day (orders before 8 PM)</td>
                  <td className="py-4 px-4">GHS 20 - GHS 60</td>
                  <td className="py-4 px-4 text-emerald-400">Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Kumasi &amp; Eastern Region</td>
                  <td className="py-4 px-4">Next-day 24 hours (via Courier/Bus)</td>
                  <td className="py-4 px-4">GHS 40 - GHS 50 </td>
                  <td className="py-4 px-4 text-red-500">No (Pre-pay)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Takoradi &amp; Cape Coast</td>
                  <td className="py-4 px-4">Next-day 24 hours (via Courier/Bus)</td>
                  <td className="py-4 px-4">GHS 40 - GHS 50</td>
                  <td className="py-4 px-4 text-red-500">No (Pre-pay)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Northern, Remote, or other regions</td>
                  <td className="py-4 px-4">Next-day 24 hours (via Courier/Bus)</td>
                  <td className="py-4 px-4">GHS 40 - GHS 50</td>
                  <td className="py-4 px-4 text-red-500">No (Pre-pay)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Collapsible Delivery FAQ */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-primary border-b border-white/10 pb-4">
            Delivery Questions &amp; Packaging
          </h2>
          <div className="space-y-2">
            {deliveryFaq.map((item, index) => (
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

        {/* CTA Block */}
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 text-center mt-16 space-y-6">
          <h2 className="text-2xl font-display font-bold">Still have questions?</h2>
          <p className="text-white/60 max-w-md mx-auto text-sm md:text-base">
            Would you like to customize your delivery details, pick-up times, or use anonymous details? Message our support team on WhatsApp.
          </p>
          <a
            href="https://wa.me/233266181581?text=Hello%20PleasureToysGH%2C%20I%20have%20questions%20about%20discreet%20delivery%20terms."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-[#25D366]/20"
          >
            Confirm Delivery on WhatsApp
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
