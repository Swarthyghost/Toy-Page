import React from "react";
import About from "../../components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PleasureToys GH | Sex Toy Shop in Accra",
  description: "PleasureToys GH is a discreet, trusted online sex toy shop based in Accra, Ghana, offering body-safe products and fast delivery nationwide.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/about",
  },
};

export default function AboutPage() {
  return <About />;
}
