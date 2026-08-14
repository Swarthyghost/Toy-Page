import React from "react";
import GuidesClient from "./GuidesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sex Toy Guides & Tips | PleasureToys GH, Ghana",
  description: "Guides on choosing, using and caring for sex toys in Ghana — safety, materials, cleaning and more, from PleasureToys GH in Accra.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/guides",
  },
};

export default function GuidesListPage() {
  return <GuidesClient />;
}
