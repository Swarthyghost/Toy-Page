"use client";

import React from "react";
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("../../components/AdminDashboard"), { ssr: false });
const ProtectedRoute = dynamic(() => import("../../components/ProtectedRoute"), { ssr: false });

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
