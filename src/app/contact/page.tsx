import React from "react";
import Contact from "../../components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://pleasuretoysgh.com/contact",
  },
};

export default function ContactPage() {
  return <Contact />;
}
