import React from "react";
import Shipping from "../../components/Shipping";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://pleasuretoysgh.com/shipping",
  },
};

export default function ShippingPage() {
  return <Shipping />;
}
