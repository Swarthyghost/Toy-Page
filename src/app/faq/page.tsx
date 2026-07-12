import React from "react";
import FAQClient from "./FAQClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | PleasureToys GH",
  description: "Find answers about placing orders, Paystack secure payment, and private sex toy shopping in Ghana with fast discreet delivery in Accra and nationwide.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/faq",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
