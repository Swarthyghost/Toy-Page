"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export default function WhatsAppFloating() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const [showBadge, setShowBadge] = useState(false);
  const [constraints, setConstraints] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const isDraggingRef = useRef(false);

  // Load saved position and badge state
  useEffect(() => {
    const savedPosition = localStorage.getItem("pt_wa_position");
    if (savedPosition) {
      try {
        const { x: savedX, y: savedY } = JSON.parse(savedPosition);
        x.set(savedX);
        y.set(savedY);
      } catch (e) {
        console.error("Failed to parse saved WhatsApp position", e);
      }
    }

    const isDismissed = localStorage.getItem("pt_wa_badge_dismissed");
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowBadge(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [x, y]);

  // Handle constraints calculation to prevent dragging off-screen
  useEffect(() => {
    const updateConstraints = () => {
      const margin = 24;
      const buttonSize = 56; // 14 * 4 = 56px
      setConstraints({
        top: -window.innerHeight + buttonSize + margin * 2,
        bottom: 0,
        left: -window.innerWidth + buttonSize + margin * 2,
        right: 0,
      });
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    localStorage.setItem(
      "pt_wa_position",
      JSON.stringify({ x: x.get(), y: y.get() })
    );
    // Short timeout to prevent immediate click event trigger
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.open("https://wa.me/233266181581", "_blank", "noopener,noreferrer");
  };

  const handleDismissBadge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBadge(false);
    localStorage.setItem("pt_wa_badge_dismissed", "true");
  };

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ x, y }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 cursor-grab active:cursor-grabbing select-none touched-none"
    >
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-zinc-900 border border-white/10 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 whitespace-nowrap pointer-events-auto"
            onClick={handleClick}
          >
            <span className="font-medium tracking-wide">Need help? Chat with us!</span>
            <button
              onClick={handleDismissBadge}
              className="text-white/40 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/5"
            >
              <X size={14} />
            </button>
            {/* Arrow Pointer */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-900 border-t border-r border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-all relative flex-shrink-0"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing ring micro-animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />
        
        {/* WhatsApp Icon */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.76.46 3.48 1.333 5l-1.35 4.925 5.056-1.32c1.472.8 3.12 1.22 4.8 1.22 5.506 0 9.988-4.47 9.988-9.953C22 6.47 17.518 2 12.012 2zm.006 18.22c-1.56 0-3.08-.42-4.41-1.2l-.32-.18-3.285.86.878-3.2-.21-.34c-.856-1.36-1.308-2.92-1.308-4.54.004-4.83 3.945-8.76 8.784-8.76 2.34 0 4.545.92 6.2 2.57a8.683 8.683 0 0 1 2.568 6.19c-.004 4.83-3.945 8.76-8.784 8.76zm4.815-6.58c-.264-.13-1.56-.77-1.802-.857-.243-.09-.42-.13-.597.13-.177.26-.685.857-.84 1.028-.154.17-.308.2-.572.07a7.22 7.22 0 0 1-2.124-1.31c-.815-.724-1.366-1.62-1.526-1.893-.16-.27-.017-.417.115-.55.12-.12.264-.31.396-.46.13-.15.177-.26.264-.43.088-.17.044-.32-.022-.45-.066-.13-.597-1.44-.818-1.97-.216-.52-.454-.45-.6-.46-.15-.01-.322-.01-.495-.01-.173 0-.455.06-.693.32-.24.26-.913.89-.913 2.17s.935 2.51 1.067 2.69c.13.17 1.84 2.81 4.457 3.94.62.27 1.107.43 1.484.55.626.2 1.195.17 1.644.1.5-.08 1.56-.64 1.78-1.25.22-.61.22-1.13.154-1.24-.066-.11-.242-.17-.506-.3z" />
        </svg>
      </button>
    </motion.div>
  );
}
