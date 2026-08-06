import React from "react";
import ProductDetail from "../../../components/ProductDetail";
import { Metadata } from "next";
import { fetchProductById } from "../../../services/firebaseApi";
import { getProductMetadata } from "../../../utils/seoHelper";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  
  const { title, description, keywords } = getProductMetadata(product);
  const imageUrl = product?.image || "https://pleasuretoysgh.com/toy-og.png";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://pleasuretoysgh.com/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://pleasuretoysgh.com/product/${id}`,
      siteName: "PleasureToys GH",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
