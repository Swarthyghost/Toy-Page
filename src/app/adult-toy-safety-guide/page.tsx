import React from "react";
import SafetyGuideClient from "./SafetyGuideClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adult Toy Safety & Hygiene Guide | PleasureToys GH",
  description: "Learn how to use, wash, and store your adult toys safely. Tips on body-safe materials, body-safe lubricants, and intimate hygiene from PleasureToys GH.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/adult-toy-safety-guide",
  },
};

export default function AdultToySafetyGuidePage() {
  return <SafetyGuideClient />;
}
