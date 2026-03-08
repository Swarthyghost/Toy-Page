import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductListing from './components/ProductListing';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Shipping from './components/Shipping';
import BDSMPage from './components/BDSMPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { motion, AnimatePresence } from 'motion/react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <ProductListing />
    </motion.div>
  );
}

function Layout({ children, showNavbar = true }: { children: React.ReactNode; showNavbar?: boolean }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      {!isAdminPage && showNavbar && <Navbar />}
      <main className={`flex-grow ${isAdminPage ? '' : ''}`}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/category/:categoryName" element={<ProductListing />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/bdsm" element={<BDSMPage />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            } />
            <Route 
              path="/admin" 
              element={
                <Layout showNavbar={false}>
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </Layout>
              } 
            />
          </Routes>
        </Router>
      </CartProvider>
    </AdminAuthProvider>
  );
}
