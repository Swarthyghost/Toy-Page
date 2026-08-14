import React from "react";
import Contact from "../../components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PleasureToys GH | Sex Toy Shop, Accra",
  description: "Contact PleasureToys GH in Ablekuma, Accra for questions about orders, delivery or products. Reach us by phone, WhatsApp or email.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/contact",
  },
};

export default function ContactPage() {
  return <Contact />;
}
