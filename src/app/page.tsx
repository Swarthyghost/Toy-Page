import React from "react";
import Hero from "../components/Hero";
import ProductListing from "../components/ProductListing";
import { Metadata } from "next";
import { fetchFeaturedProduct } from "../services/firebaseApi";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sex Toy Shop in Accra, Ghana | PleasureToys GH",
description: "Ghana's discreet online sex toy shop — vibrators, BDSM gear, lubricants & more. Body-safe products, 100% discreet packaging, same-day Accra delivery.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/",
  },
};

export default async function Home() {
  const featuredProduct = await fetchFeaturedProduct();

  // Only pass the plain, serializable fields Hero actually renders — the full
  // Product record carries Firestore Timestamp fields (createdAt/updatedAt)
  // that can't cross the Server -> Client Component boundary as-is.
  const initialFeaturedProduct = featuredProduct
    ? {
        id: featuredProduct.id,
        name: featuredProduct.name,
        slug: featuredProduct.slug,
        price: featuredProduct.price,
        image: featuredProduct.image,
        category: featuredProduct.category,
        description: featuredProduct.description,
      }
    : null;

  return (
    <>
      <Hero initialFeaturedProduct={initialFeaturedProduct} />
      <ProductListing />
    </>
  );
}
