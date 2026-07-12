import React from "react";
import { notFound } from "next/navigation";
import LocationPage from "../../components/LocationPage";
import { Metadata } from "next";

const CITIES = [
  "accra",
  "ablekuma",
  "east-legon",
  "madina",
  "spintex",
  "tema",
  "kumasi",
  "cape-coast",
  "koforidua",
  "ho",
];

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    city: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  return {
    alternates: {
      canonical: `https://pleasuretoysgh.com/${city}`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;

  if (!city || !CITIES.includes(city)) {
    notFound();
  }

  return <LocationPage city={city} />;
}
