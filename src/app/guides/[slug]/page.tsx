import React from "react";
import GuideDetailClient from "./GuideDetailClient";
import { Metadata } from "next";
import { fetchGuideBySlug } from "../../../services/firebaseApi";
import { getGuideMetadata } from "../../../utils/seoHelper";
import { permanentRedirect, notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchGuideBySlug(slug);
  
  if (!guide) {
    return {
      title: "Guide Not Found | PleasureToys GH",
      description: "This guide could not be found.",
    };
  }

  const { title, description, keywords } = getGuideMetadata(guide);
  const imageUrl = guide.featuredImage || "https://pleasuretoysgh.com/toy-og.png";
  const canonicalUrl = `https://pleasuretoysgh.com/guides/${guide.slug}`;

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
          width: 1200,
          height: 630,
          alt: guide.featuredImageAlt || title,
        },
      ],
      type: "article",
      publishedTime: guide.publishDate ? toISODateString(guide.publishDate) : undefined,
      modifiedTime: guide.updatedAt ? toISODateString(guide.updatedAt) : (guide.publishDate ? toISODateString(guide.publishDate) : undefined),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

function toISODateString(timestamp: any): string | undefined {
  try {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    if (timestamp) {
      return new Date(timestamp).toISOString();
    }
  } catch (e) {
    // Ignore invalid timestamps
  }
  return undefined;
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await fetchGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Redirect to exact canonical lowercase slug if mismatch
  if (slug !== guide.slug) {
    permanentRedirect(`/guides/${guide.slug}`);
  }

  return <GuideDetailClient initialGuide={guide} />;
}
