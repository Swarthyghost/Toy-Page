import React from "react";
import ProductListing from "../../../components/ProductListing";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ categoryName: string }> }): Promise<Metadata> {
  const { categoryName } = await params;
  return {
    alternates: {
      canonical: `https://pleasuretoysgh.com/category/${categoryName}`,
    },
  };
}

export default function CategoryPage() {
  return <ProductListing />;
}
