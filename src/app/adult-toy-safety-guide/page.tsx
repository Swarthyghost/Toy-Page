import React from "react";
import SafetyGuideClient from "./SafetyGuideClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adult Toy Safety Guide | PleasureToys GH, Accra",
  description: "How to choose and use sex toys safely: materials, cleaning and storage tips from PleasureToys GH, Accra's discreet adult toy shop.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/adult-toy-safety-guide",
  },
};

export default function AdultToySafetyGuidePage() {
  return <SafetyGuideClient />;
}
