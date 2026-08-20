"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSiteSettings } from '../context/SiteSettingsContext';
import SearchOverlay from './SearchOverlay';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const categories = [
  { name: 'Vibrators', path: '/category/Vibrators' },
  { name: 'BDSM', path: '/category/BDSM' },
  { name: 'Lubricants', path: '/category/Lubricants' },
  { name: 'Mens Toy', path: '/category/Mens Toy' },
  { name: 'Accessories', path: '/category/Accessories' },
  { name: 'Guides', path: '/guides' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { siteSettings } = useSiteSettings();
  const { totalItems } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll while the full-screen mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hasBanner = siteSettings?.isSalesNotificationActive;

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-[40] transition-all duration-300 px-4 sm:px-6 py-4',
        hasBanner ? 'top-8 md:top-9' : 'top-0',
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent'
      )}
    >
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/10 group-hover:rotate-12 transition-transform flex-shrink-0">
            <Image
              src="/toy.webp"
              alt="Logo"
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <span className="text-base sm:text-xl font-display font-bold tracking-tight whitespace-nowrap">
            PleasureToys <span className="text-primary">GH</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === cat.path ? "text-primary" : "text-white/70"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search products"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Search size={22} />
          </button>
          <Link href="/cart" id="navbar-cart-icon" className="relative p-2 hover:bg-white/10 rounded-full transition-colors origin-center">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="cart-badge absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black origin-center"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 h-[100dvh] w-full bg-black backdrop-blur-md p-6 pt-28 overflow-y-auto md:hidden"
          >
            <div className="flex flex-col gap-6">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="font-medium">Search Products</span>
                <Search size={20} />
              </button>

              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className="font-medium">View Cart</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/50">{totalItems} items</span>
                  <ShoppingCart size={20} />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
