import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductListing from "./components/ProductListing";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import About from "./components/About";
import Contact from "./components/Contact";
import Privacy from "./components/Privacy";
import Shipping from "./components/Shipping";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import TrustBand from "./components/TrustBand";
import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SiteSettingsProvider, useSiteSettings } from "./context/SiteSettingsContext";
import { motion, AnimatePresence } from "motion/react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin") || location.pathname === "/admin-login";
  const { siteSettings } = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      {!isAdminPage && siteSettings?.isSalesNotificationActive && (
        <div className="fixed top-0 left-0 right-0 bg-primary text-white text-center py-2 px-4 text-xs md:text-sm font-bold tracking-widest uppercase z-50 shadow-md h-8 md:h-9 flex items-center justify-center">
          <div className="animate-pulse w-full truncate">{siteSettings.salesNotificationText}</div>
        </div>
      )}
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <TrustBand />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Hero />
                <ProductListing />
              </motion.div>
            }
          />
          <Route path="/category/:categoryName" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
        </CartProvider>
      </AdminAuthProvider>
    </SiteSettingsProvider>
  );
}
