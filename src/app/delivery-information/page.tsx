import React from "react";
import DeliveryClient from "./DeliveryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Information | PleasureToys GH",
  description: "Find out details about our 100% private, plain packaging and same-day delivery services within Accra and nationwide across Ghana.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/delivery-information",
  },
};

export default function DeliveryInformationPage() {
  return <DeliveryClient />;
}
