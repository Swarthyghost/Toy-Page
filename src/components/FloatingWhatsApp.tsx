"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "motion/react";

// Snapping and placement constants
const BUTTON_SIZE = 56; // 14 * 4px = 56px size
const SAFE_MARGIN = 16;
const DEFAULT_BOTTOM_OFFSET = 24;
const WHATSAPP_URL = "https://wa.me/233266181581?text=Hello%20pleasure%20Toys%20GH%20I%20am%20interested%20in%20your%20products";

export default function FloatingWhatsApp() {
  const controls = useAnimation();
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);
  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const isDraggingRef = useRef(false);

  // Initialize position and constraints on mount
  useEffect(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Load persisted side (left/right) and vertical (Y) coordinates from localStorage
    const savedSide = localStorage.getItem("pt_wa_side") as "left" | "right" | null;
    const savedYStr = localStorage.getItem("pt_wa_y");

    const side = savedSide || "right";
    const xVal = side === "left" ? SAFE_MARGIN : (screenWidth - BUTTON_SIZE - SAFE_MARGIN);

    let yVal = screenHeight - BUTTON_SIZE - DEFAULT_BOTTOM_OFFSET;
    if (savedYStr) {
      const parsedY = parseFloat(savedYStr);
      if (!isNaN(parsedY)) {
        // Clamp loaded vertical offset to stay inside safe margins
        yVal = Math.max(SAFE_MARGIN, Math.min(parsedY, screenHeight - BUTTON_SIZE - SAFE_MARGIN));
      }
    }

    setInitialPos({ x: xVal, y: yVal });
    controls.set({ x: xVal, y: yVal });

    // Set bounds constraints for active dragging area
    setDragConstraints({
      left: SAFE_MARGIN,
      right: screenWidth - BUTTON_SIZE - SAFE_MARGIN,
      top: SAFE_MARGIN,
      bottom: screenHeight - BUTTON_SIZE - SAFE_MARGIN,
    });
  }, [controls]);

  // Adjust coordinates and active boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const savedSide = localStorage.getItem("pt_wa_side") as "left" | "right" | null;
      const savedYStr = localStorage.getItem("pt_wa_y");

      const side = savedSide || "right";
      const xVal = side === "left" ? SAFE_MARGIN : (screenWidth - BUTTON_SIZE - SAFE_MARGIN);

      let yVal = screenHeight - BUTTON_SIZE - DEFAULT_BOTTOM_OFFSET;
      if (savedYStr) {
        const parsedY = parseFloat(savedYStr);
        if (!isNaN(parsedY)) {
          yVal = Math.max(SAFE_MARGIN, Math.min(parsedY, screenHeight - BUTTON_SIZE - SAFE_MARGIN));
        }
      }

      setDragConstraints({
        left: SAFE_MARGIN,
        right: screenWidth - BUTTON_SIZE - SAFE_MARGIN,
        top: SAFE_MARGIN,
        bottom: screenHeight - BUTTON_SIZE - SAFE_MARGIN,
      });

      controls.start({
        x: xVal,
        y: yVal,
        transition: { type: "spring", stiffness: 200, damping: 20 }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [controls]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    if (!buttonRef.current) return;

    // Retrieve final pixel boundaries relative to viewport
    const rect = buttonRef.current.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const leftBound = SAFE_MARGIN;
    const rightBound = screenWidth - BUTTON_SIZE - SAFE_MARGIN;
    const midPoint = screenWidth / 2;

    // Snapping logic: determine nearest horizontal edge (left vs right half of screen)
    const targetX = (currentX + BUTTON_SIZE / 2) < midPoint ? leftBound : rightBound;
    const targetSide = targetX === leftBound ? "left" : "right";

    // Clamps Y coordinate to prevent button leaving screen
    const topBound = SAFE_MARGIN;
    const bottomBound = screenHeight - BUTTON_SIZE - SAFE_MARGIN;
    const targetY = Math.max(topBound, Math.min(currentY, bottomBound));

    // Persist final snapped side and clamped Y position to localStorage
    localStorage.setItem("pt_wa_side", targetSide);
    localStorage.setItem("pt_wa_y", String(targetY));

    // Animate snap to edge using spring transitions
    controls.start({
      x: targetX,
      y: targetY,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    });

    // Timeout allows distinguishing normal click tap events from drag releases
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
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    }
  };

  if (!initialPos) return null;

  return (
    <motion.div
      ref={buttonRef}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99999,
      }}
      className="fixed z-[99999] cursor-grab active:cursor-grabbing select-none touch-none focus-within:outline-none"
    >
      {/* Nested motion div prevents floating animations interfering with drag coordinate updates */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label="Chat with us on WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] focus:ring-offset-black transition-shadow group relative"
        >
          {/* Pulsing ring visual indicator */}
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
    </motion.div>
  );
}
