import React from "react";
import Hero from "../components/Hero";
import FeaturedSection from "../components/FeaturedSection";
import ProductListing from "../components/ProductListing";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://pleasuretoysgh.com/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <ProductListing />
    </>
  );
}
