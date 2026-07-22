"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface PageConfig {
  time: number;
  scroll: number;
  title: string;
  body: string;
  matchType: "AND" | "OR";
}

const getPageConfig = (path: string): PageConfig => {
  const decodedPath = decodeURIComponent(path);

  if (decodedPath === "/" || decodedPath === "") {
    return {
      time: 10,
      scroll: 30,
      title: "Need help choosing?",
      body: "Private WhatsApp support available. We can recommend products discreetly.",
      matchType: "AND",
    };
  }
  if (decodedPath === "/category/Vibrators") {
    return {
      time: 8,
      scroll: 25,
      title: "Need help choosing the perfect vibrator?",
      body: "Chat privately with our team for discreet recommendations.",
      matchType: "AND",
    };
  }
  if (decodedPath === "/category/Mens Toy") {
    return {
      time: 8,
      scroll: 25,
      title: "Questions about men's toys?",
      body: "We're happy to help discreetly.",
      matchType: "AND",
    };
  }
  if (decodedPath === "/category/BDSM") {
    return {
      time: 6,
      scroll: 25,
      title: "Not sure where to start?",
      body: "Get private recommendations tailored to your preferences.",
      matchType: "AND",
    };
  }
  if (decodedPath.startsWith("/product/")) {
    return {
      time: 15,
      scroll: 60,
      title: "Have questions about this product?",
      body: "Chat with us privately before placing your order.",
      matchType: "OR",
    };
  }

  // Default
  return {
    time: 12,
    scroll: 30,
    title: "Need help choosing?",
    body: "Private WhatsApp support available. We can recommend products discreetly.",
    matchType: "AND",
  };
};

const getWhatsAppUrl = (path: string, currentTitle: string) => {
  const baseNumber = "233266181581";
  let message = "Hello Pleasure Toys GH, I am interested in your products.";

  const decodedPath = decodeURIComponent(path);
  if (decodedPath === "/" || decodedPath === "") {
    message = "Hello Pleasure Toys GH, I'm on your homepage and would like some help choosing a product.";
  } else if (decodedPath === "/category/Vibrators") {
    message = "Hello Pleasure Toys GH, I'm browsing your vibrators and would like some discreet recommendations.";
  } else if (decodedPath === "/category/Mens Toy") {
    message = "Hello Pleasure Toys GH, I have some questions about your men's toys collection.";
  } else if (decodedPath === "/category/BDSM") {
    message = "Hello Pleasure Toys GH, I'm looking for some BDSM recommendations tailored to my preferences.";
  } else if (decodedPath.startsWith("/product/")) {
    let productName = "this product";
    if (currentTitle) {
      productName = currentTitle.split(" Ghana")[0].split(" — ")[0];
    }
    const currentUrl = typeof window !== "undefined" ? window.location.href : `https://pleasuretoysgh.com${path}`;
    message = `Hello Pleasure Toys GH, I have questions about ${productName} (${currentUrl}).`;
  } else if (decodedPath.includes("faq")) {
    message = "Hello Pleasure Toys GH, I'm checking your FAQ and have a question.";
  } else if (decodedPath.includes("delivery") || decodedPath.includes("shipping")) {
    message = "Hello Pleasure Toys GH, I have questions about delivery and shipping.";
  }

  return `https://wa.me/${baseNumber}?text=${encodeURIComponent(message)}`;
};

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [docTitle, setDocTitle] = useState("");

  // Check if component is hydrated/mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update document title reference on client side
  useEffect(() => {
    if (typeof document !== "undefined") {
      setDocTitle(document.title);
      // Observe title updates (e.g. from react-helmet or next.js SEO)
      const observer = new MutationObserver(() => {
        setDocTitle(document.title);
      });
      const titleEl = document.querySelector("title");
      if (titleEl) {
        observer.observe(titleEl, { childList: true });
      }
      return () => observer.disconnect();
    }
  }, [pathname]);

  // Handle device width detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset page-level timer & scroll check on pathname changes
  useEffect(() => {
    setShowWidget(false);
    setSecondsElapsed(0);
  }, [pathname]);

  // Check dismissed state from localStorage
  useEffect(() => {
    const checkDismissed = () => {
      const closedUntil = localStorage.getItem("pt_wa_closed_until");
      if (closedUntil && Date.now() < parseInt(closedUntil, 10)) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    };
    checkDismissed();
  }, [pathname]);

  // Track unique product page visits
  useEffect(() => {
    if (typeof window === "undefined" || !pathname?.startsWith("/product/")) return;

    const productId = pathname.split("/").pop();
    if (!productId) return;

    try {
      const visited = JSON.parse(sessionStorage.getItem("pt_visited_products") || "[]") as string[];
      if (!visited.includes(productId)) {
        visited.push(productId);
        sessionStorage.setItem("pt_visited_products", JSON.stringify(visited));
      }
    } catch (e) {
      console.error("Error writing sessionStorage: ", e);
    }
  }, [pathname]);

  // Tick timer every second
  useEffect(() => {
    if (showWidget || isDismissed || isAdminPage) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showWidget, isDismissed, isAdminPage, pathname]);

  // Track scroll percentage
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const limit = scrollHeight - clientHeight;
      const percent = limit > 0 ? (scrollTop / limit) * 100 : 0;
      setScrollPercent(percent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // IntersectionObserver for FAQ section
  useEffect(() => {
    if (showWidget || isDismissed || isAdminPage) return;

    const faqElement = document.getElementById("faq");
    if (!faqElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowWidget(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(faqElement);
    return () => observer.disconnect();
  }, [pathname, showWidget, isDismissed, isAdminPage]);

  // Immediate triggers: visits of high-intent pages
  useEffect(() => {
    if (showWidget || isDismissed || isAdminPage) return;

    const decodedPath = decodeURIComponent(pathname || "");

    // 1. FAQ route
    if (decodedPath.includes("faq")) {
      setShowWidget(true);
      return;
    }

    // 2. Shipping or Delivery routes
    if (decodedPath.includes("delivery") || decodedPath.includes("shipping")) {
      setShowWidget(true);
      return;
    }

    // 3. More than 2 product page visits
    try {
      const visited = JSON.parse(sessionStorage.getItem("pt_visited_products") || "[]") as string[];
      if (visited.length > 2) {
        setShowWidget(true);
        return;
      }
    } catch (e) {}
  }, [pathname, showWidget, isDismissed, isAdminPage]);

  // Desktop Exit Intent trigger
  useEffect(() => {
    if (isMobile || showWidget || isDismissed || isAdminPage) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 15) {
        setShowWidget(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isMobile, showWidget, isDismissed, isAdminPage]);

  // Mobile Inactivity trigger (7 seconds)
  useEffect(() => {
    if (!isMobile || showWidget || isDismissed || isAdminPage) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setShowWidget(true);
      }, 7000);
    };

    const resetEvents = ["touchstart", "touchmove", "scroll", "click", "keypress"];
    resetEvents.forEach((event) => {
      window.addEventListener(event, resetInactivity, { passive: true });
    });

    resetInactivity();

    return () => {
      clearTimeout(inactivityTimer);
      resetEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivity);
      });
    };
  }, [isMobile, showWidget, isDismissed, isAdminPage, pathname]);

  // Time & scroll behavior triggers (runs every second or on scroll change)
  useEffect(() => {
    if (showWidget || isDismissed || isAdminPage) return;

    const decodedPath = decodeURIComponent(pathname || "");
    const isProductDetail = pathname?.startsWith("/product/");

    // 1. High Intent: Remains on a product page > 20s
    if (isProductDetail && secondsElapsed > 20) {
      setShowWidget(true);
      return;
    }

    // Get trigger parameters
    const config = getPageConfig(pathname || "");
    const isDefault =
      !["/", "/category/Vibrators", "/category/Mens Toy", "/category/BDSM"].includes(decodedPath) &&
      !isProductDetail;

    let targetTime = config.time;
    let targetScroll = config.scroll;
    let matchType = config.matchType;

    // Apply default page overrides for desktop/mobile
    if (isDefault) {
      if (isMobile) {
        targetTime = 8; // mobile range 8-10s
        targetScroll = 25; // mobile range 25-30%
      } else {
        targetTime = 12; // desktop range 12s
        targetScroll = 30; // desktop range 30-35%
      }
    }

    const timeMet = secondsElapsed >= targetTime;
    const scrollMet = scrollPercent >= targetScroll;

    if (matchType === "AND") {
      if (timeMet && scrollMet) {
        setShowWidget(true);
      }
    } else {
      if (timeMet || scrollMet) {
        setShowWidget(true);
      }
    }
  }, [secondsElapsed, scrollPercent, pathname, isMobile, showWidget, isDismissed, isAdminPage]);

  // Dismiss widget for 12 hours
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWidget(false);
    setIsDismissed(true);
    localStorage.setItem(
      "pt_wa_closed_until",
      (Date.now() + 12 * 60 * 60 * 1000).toString()
    );
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl(pathname || "", docTitle);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Do not render anything on Admin panel, if not mounted, or if dismissed
  if (isAdminPage || !isMounted || isDismissed || !showWidget) return null;

  const currentConfig = getPageConfig(pathname || "");
  const whatsappUrl = getWhatsAppUrl(pathname || "", docTitle);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99999] flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Small Expandable Message Bubble */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-black/95 backdrop-blur-md border border-white/10 text-white rounded-2xl p-4 shadow-2xl relative w-72 max-w-[calc(100vw-48px)] pointer-events-auto flex flex-col"
        >
          {/* Close button for entire widget dismissal */}
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 p-1 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer focus:outline-none"
            aria-label="Dismiss chat options"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon & Message content */}
          <div className="flex flex-col gap-1 pr-5">
            <span className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
              {currentConfig.title}
            </span>
            <span className="text-xs text-white/70 leading-relaxed font-sans mt-0.5">
              {currentConfig.body}
            </span>
          </div>

          {/* Primary CTA Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenWhatsApp}
            className="mt-3.5 w-full bg-[#25D366] hover:bg-[#20ba59] text-white hover:text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs shadow-lg shadow-[#25D366]/20 active:scale-98 cursor-pointer text-center"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.76.46 3.48 1.333 5l-1.35 4.925 5.056-1.32c1.472.8 3.12 1.22 4.8 1.22 5.506 0 9.988-4.47 9.988-9.953C22 6.47 17.518 2 12.012 2zm.006 18.22c-1.56 0-3.08-.42-4.41-1.2l-.32-.18-3.285.86.878-3.2-.21-.34c-.856-1.36-1.308-2.92-1.308-4.54.004-4.83 3.945-8.76 8.784-8.76 2.34 0 4.545.92 6.2 2.57a8.683 8.683 0 0 1 2.568 6.19c-.004 4.83-3.945 8.76-8.784 8.76zm4.815-6.58c-.264-.13-1.56-.77-1.802-.857-.243-.09-.42-.13-.597.13-.177.26-.685.857-.84 1.028-.154.17-.308.2-.572.07a7.22 7.22 0 0 1-2.124-1.31c-.815-.724-1.366-1.62-1.526-1.893-.16-.27-.017-.417.115-.55.12-.12.264-.31.396-.46.13-.15.177-.26.264-.43.088-.17.044-.32-.022-.45-.066-.13-.597-1.44-.818-1.97-.216-.52-.454-.45-.6-.46-.15-.01-.322-.01-.495-.01-.173 0-.455.06-.693.32-.24.26-.913.89-.913 2.17s.935 2.51 1.067 2.69c.13.17 1.84 2.81 4.457 3.94.62.27 1.107.43 1.484.55.626.2 1.195.17 1.644.1.5-.08 1.56-.64 1.78-1.25.22-.61.22-1.13.154-1.24-.066-.11-.242-.17-.506-.3z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>

          {/* Secondary Text */}
          <span className="text-white/40 text-[10px] text-center mt-2.5 block font-sans">
            Private & discreet support available.
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto shadow-2xl shadow-[#25D366]/20 rounded-full"
      >
        <button
          onClick={handleOpenWhatsApp}
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] focus:ring-offset-black transition-all hover:scale-108 active:scale-95 group relative cursor-pointer"
          aria-label="Open chat on WhatsApp"
        >
          {/* Pulsing ring indicator */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none group-hover:hidden" />

          {/* Official WhatsApp Logo SVG */}
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.76.46 3.48 1.333 5l-1.35 4.925 5.056-1.32c1.472.8 3.12 1.22 4.8 1.22 5.506 0 9.988-4.47 9.988-9.953C22 6.47 17.518 2 12.012 2zm.006 18.22c-1.56 0-3.08-.42-4.41-1.2l-.32-.18-3.285.86.878-3.2-.21-.34c-.856-1.36-1.308-2.92-1.308-4.54.004-4.83 3.945-8.76 8.784-8.76 2.34 0 4.545.92 6.2 2.57a8.683 8.683 0 0 1 2.568 6.19c-.004 4.83-3.945 8.76-8.784 8.76zm4.815-6.58c-.264-.13-1.56-.77-1.802-.857-.243-.09-.42-.13-.597.13-.177.26-.685.857-.84 1.028-.154.17-.308.2-.572.07a7.22 7.22 0 0 1-2.124-1.31c-.815-.724-1.366-1.62-1.526-1.893-.16-.27-.017-.417.115-.55.12-.12.264-.31.396-.46.13-.15.177-.26.264-.43.088-.17.044-.32-.022-.45-.066-.13-.597-1.44-.818-1.97-.216-.52-.454-.45-.6-.46-.15-.01-.322-.01-.495-.01-.173 0-.455.06-.693.32-.24.26-.913.89-.913 2.17s.935 2.51 1.067 2.69c.13.17 1.84 2.81 4.457 3.94.62.27 1.107.43 1.484.55.626.2 1.195.17 1.644.1.5-.08 1.56-.64 1.78-1.25.22-.61.22-1.13.154-1.24-.066-.11-.242-.17-.506-.3z" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
