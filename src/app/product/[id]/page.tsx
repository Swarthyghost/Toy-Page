import React from "react";
import ProductDetail from "../../../components/ProductDetail";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: {
      canonical: `https://pleasuretoysgh.com/product/${id}`,
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
