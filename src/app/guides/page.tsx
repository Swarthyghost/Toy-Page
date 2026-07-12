import React from "react";
import GuidesClient from "./GuidesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pleasure & Intimacy Guides | PleasureToys GH",
  description: "Read expert articles on sexual wellness, adult toy guides, intimacy tips for couples, and body safety from the specialists at PleasureToys GH.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/guides",
  },
};

export default function GuidesListPage() {
  return <GuidesClient />;
}
