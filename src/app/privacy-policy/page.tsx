import React from "react";
import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PleasureToys GH",
  description: "Read our Privacy Policy to understand how we protect your personal information and ensure 100% discreet packaging and delivery.",
  alternates: {
    canonical: "https://pleasuretoysgh.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
