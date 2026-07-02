"use client";

import React from "react";
import { useSEO } from "../hooks/useSEO";

export default function Privacy() {
  useSEO({
    title: "Privacy Policy",
    description:
      "PleasureToys GH Privacy Policy - Learn how we protect your privacy with 100% discreet packaging, secure data handling, and encrypted WhatsApp communication in Ghana.",
    url: "/privacy",
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-display font-bold mb-12">Privacy Policy</h1>

      <div className="prose prose-invert max-w-none space-y-8 text-white/60">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            1. Discretion Guaranteed
          </h2>
          <p>
            At PleasureToys GH, we understand the sensitive nature of our
            products. We guarantee 100% discretion in all our dealings. Your
            order will arrive in plain, unmarked packaging with no mention of
            the contents or our brand name on the outside.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            2. Data Collection
          </h2>
          <p>
            We only collect the information necessary to process your order:
            your name, phone number, and delivery address. This information is
            used solely for delivery purposes and is never shared with third
            parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            3. WhatsApp Communication
          </h2>
          <p>
            Our primary mode of communication is WhatsApp. This ensures
            end-to-end encrypted messaging between you and our team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
          <p>
            We use local storage to keep track of your shopping cart items for
            your convenience. No tracking cookies are used for advertising
            purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
