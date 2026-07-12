"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SiteSettingsProvider, useSiteSettings } from "../context/SiteSettingsContext";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import { CartProvider } from "../context/CartContext";
import { ProductProvider } from "../context/ProductContext";
import Navbar from "../components/Navbar";
import TrustBand from "../components/TrustBand";
import Footer from "../components/Footer";
import { motion } from "motion/react";

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin") || pathname === "/admin-login";
  const { siteSettings } = useSiteSettings();

  const text = siteSettings?.salesNotificationText || "";
  const itemWidth = text.length * 8 + 32;
  const halfN = Math.max(10, Math.ceil(3000 / Math.max(itemWidth, 55)));
  const totalN = halfN * 2;
  const marqueeDuration = (halfN * itemWidth) / 40;

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      {!isAdminPage && siteSettings?.isSalesNotificationActive && (
        <div className="fixed top-0 left-0 right-0 bg-primary text-white py-2 text-xs md:text-sm font-bold tracking-widest uppercase z-50 shadow-md h-8 md:h-9 overflow-hidden flex items-center">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: marqueeDuration, ease: "linear" }}
          >
            {[...Array(totalN)].map((_, i) => (
              <span key={i} className="inline-flex items-center gap-8">
                {text}
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
              </span>
            ))}
          </motion.div>
        </div>
      )}
      {!isAdminPage && <Navbar />}
      <main className={`flex-grow ${pathname !== "/" && !isAdminPage ? "pt-24 md:pt-28" : ""}`}>
        {children}
      </main>
      {!isAdminPage && <TrustBand />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <AdminAuthProvider>
        <ProductProvider>
          <CartProvider>
            <ClientLayout>{children}</ClientLayout>
          </CartProvider>
        </ProductProvider>
      </AdminAuthProvider>
    </SiteSettingsProvider>
  );
}
