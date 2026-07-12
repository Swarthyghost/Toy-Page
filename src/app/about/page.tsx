import React from "react";
import About from "../../components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://pleasuretoysgh.com/about",
  },
};

export default function AboutPage() {
  return <About />;
}
