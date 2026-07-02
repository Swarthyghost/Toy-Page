import React from "react";
import { notFound } from "next/navigation";
import LocationPage from "../../components/LocationPage";

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
];

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    city: string;
  }>;
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;

  if (!city || !CITIES.includes(city)) {
    notFound();
  }

  return <LocationPage city={city} />;
}
