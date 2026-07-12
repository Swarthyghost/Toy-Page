import React from "react";
import GuideDetailClient from "./GuideDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `https://pleasuretoysgh.com/guides/${slug}`,
    },
  };
}

export default function GuideDetailPage() {
  return <GuideDetailClient />;
}
