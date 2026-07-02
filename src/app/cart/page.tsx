"use client";

import React from "react";
import dynamic from "next/dynamic";

const Cart = dynamic(() => import("../../components/Cart"), { ssr: false });

export default function CartPage() {
  return <Cart />;
}
