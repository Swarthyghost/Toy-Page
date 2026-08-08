import React from "react";
import ProductDetail from "../../../components/ProductDetail";
import { Metadata } from "next";
import { fetchProductBySlugOrId } from "../../../services/firebaseApi";
import { getProductMetadata, slugify } from "../../../utils/seoHelper";
import { permanentRedirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlugOrId(slug);
  
  if (!product) {
    return {
      title: "Product Not Found | PleasureToys GH",
      description: "This product could not be found.",
    };
  }

  const targetSlug = product.slug || slugify(product.name);
  const { title, description, keywords } = getProductMetadata(product);
  const imageUrl = product.image || "https://pleasuretoysgh.com/toy-og.png";
  const canonicalUrl = `https://pleasuretoysgh.com/product/${targetSlug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  const targetSlug = product.slug || slugify(product.name);

  // If the user accessed the page using a document ID or an old slug,
  // permanently redirect to the correct slug URL.
  if (slug !== targetSlug) {
    permanentRedirect(`/product/${targetSlug}`);
  }

  return <ProductDetail initialProduct={product} />;
}
