import React from "react";
import Hero from "../components/Hero";
import ProductListing from "../components/ProductListing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sex Toys in Accra, Ghana | PleasureToys GH",
  description: "Shop sex toys in Accra, Ghana: vibrators, BDSM gear, lubricants & more. Body-safe products, 100% discreet packaging, same-day Accra delivery.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <ProductListing />
    </>
  );
}
