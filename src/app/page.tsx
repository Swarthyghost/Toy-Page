import React from "react";
import Hero from "../components/Hero";
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
      <ProductListing />
    </>
  );
}
