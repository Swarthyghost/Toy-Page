import React from "react";
import { useSEO } from "../hooks/useSEO";

export default function Shipping() {
  useSEO({
    title: "Shipping & Returns",
    description:
      "PleasureToys GH Shipping & Returns - Fast discreet delivery across Ghana. Same-day delivery in Accra, 2-3 days nationwide. Learn about our return policy.",
    url: "/shipping",
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-display font-bold mb-12">
        Shipping & Returns
      </h1>

      <div className="prose prose-invert max-w-none space-y-8 text-white/60">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Shipping Methods
          </h2>
          <p>
            We offer delivery services across Accra and other major cities in
            Ghana. Deliveries are typically handled by our private couriers to
            ensure maximum discretion.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accra: Same day or next day delivery.</li>
            <li>Outside Accra: 2-3 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Delivery Costs</h2>
          <p>
            Delivery fees are calculated based on your location and will be
            confirmed during our WhatsApp conversation after you place your
            order.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Return Policy</h2>
          <p>
            Due to the intimate nature of our products and for health and safety
            reasons, we cannot accept returns or exchanges once the product
            packaging has been opened.
          </p>
          <p>
            If you receive a defective product, please contact us within 24
            hours of delivery with photos of the defect, and we will arrange for
            a replacement.
          </p>
        </section>
      </div>
    </div>
  );
}
