import React from "react";
import GuideDetailClient from "./GuideDetailClient";
import { Metadata } from "next";
import { fetchGuideBySlug } from "../../../services/firebaseApi";
import { getGuideMetadata } from "../../../utils/seoHelper";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchGuideBySlug(slug);
  const { title, description, keywords } = getGuideMetadata(guide);
  const imageUrl = guide?.featuredImage || "https://pleasuretoysgh.com/toy-og.png";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://pleasuretoysgh.com/guides/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://pleasuretoysgh.com/guides/${slug}`,
      siteName: "PleasureToys GH",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: guide?.featuredImageAlt || title,
        },
      ],
      type: "article",
      publishedTime: guide?.publishDate ? toISODateString(guide.publishDate) : undefined,
      modifiedTime: guide?.updatedAt ? toISODateString(guide.updatedAt) : (guide?.publishDate ? toISODateString(guide.publishDate) : undefined),
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

export default function GuideDetailPage() {
  return <GuideDetailClient />;
}
