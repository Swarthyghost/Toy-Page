import React from "react";
import ProductListing from "../../../components/ProductListing";
import { Metadata } from "next";
import { getCategoryMetadata } from "../../../utils/seoHelper";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ categoryName: string }> }): Promise<Metadata> {
  const { categoryName } = await params;
  const { title, description, keywords } = getCategoryMetadata(categoryName);
  
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://pleasuretoysgh.com/category/${categoryName}`,
    },
    openGraph: {
      title,
      description,
      url: `https://pleasuretoysgh.com/category/${categoryName}`,
      siteName: "PleasureToys GH",
      images: [
        {
          url: "https://pleasuretoysgh.com/toy-og.png",
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
      images: ["https://pleasuretoysgh.com/toy-og.png"],
    },
  };
}

export default function CategoryPage() {
  return <ProductListing />;
}
