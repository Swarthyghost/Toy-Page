import React from "react";
import CartClient from "./CartClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Intimate Collection | PleasureToys GH",
  description: "View and checkout items in your PleasureToys GH shopping cart. Secure payment, discreet packaging, and fast same-day delivery.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/cart",
  },
};

export default function CartPage() {
  return <CartClient />;
}
