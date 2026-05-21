import React from 'react';

export const flyToCart = (event: React.MouseEvent<Element>) => {
  // Find the cart icon in the navbar
  const cartIcon = document.getElementById('navbar-cart-icon');
  if (!cartIcon) return;

  // Try to find the image in the current card/container that was clicked
  const target = event.currentTarget as HTMLElement;
  let container = target.closest('.group, .max-w-7xl') as HTMLElement | null;
  
  // If the closest element is the button itself, find the parent container instead
  if (container?.tagName === 'BUTTON') {
    container = container.parentElement?.closest('.group, .max-w-7xl') as HTMLElement | null;
  }
  
  if (!container) return;
  
  const imgElement = container.querySelector('img');
  if (!imgElement) return;

  const startRect = imgElement.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  // Create flying image clone
  const clone = imgElement.cloneNode(true) as HTMLImageElement;
  
  // Set initial styles
  clone.style.position = 'fixed';
  clone.style.zIndex = '99999';
  clone.style.top = '0px';
  clone.style.left = '0px';
  clone.style.width = `${startRect.width}px`;
  clone.style.height = `${startRect.height}px`;
  clone.style.borderRadius = '50%';
  clone.style.objectFit = 'cover';
  clone.style.pointerEvents = 'none';
  clone.style.boxShadow = '0 10px 25px -5px rgba(239, 68, 68, 0.6)'; // Primary color glow
  
  // Start at original position
  clone.style.transform = `translate(${startRect.left}px, ${startRect.top}px) scale(1)`;
  
  document.body.appendChild(clone);

  // Calculate distances
  const deltaX = endRect.left - startRect.left;
  // Calculate a peak point for the arc (negative Y is up)
  const peakY = Math.min(startRect.top, endRect.top) - 150;

  // Trigger the animation using WAAPI
  const animation = clone.animate([
    { 
      transform: `translate(${startRect.left}px, ${startRect.top}px) scale(1)`,
      opacity: 0.9
    },
    { 
      transform: `translate(${startRect.left + deltaX * 0.6}px, ${peakY}px) scale(0.6)`,
      opacity: 0.8
    },
    { 
      transform: `translate(${endRect.left}px, ${endRect.top}px) scale(0.1)`,
      opacity: 0.2
    }
  ], {
    duration: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
  });

  animation.onfinish = () => {
    clone.remove();
    // Trigger the bounce animation on the cart icon
    cartIcon.classList.remove('animate-cart-bounce');
    // Force reflow to restart animation
    void cartIcon.offsetWidth;
    cartIcon.classList.add('animate-cart-bounce');
    
    // Also pulse the badge if we can find it
    const badge = cartIcon.querySelector('.cart-badge');
    if (badge) {
       badge.classList.remove('animate-pulse-fast');
       void badge.offsetWidth;
       badge.classList.add('animate-pulse-fast');
    }
  };
};
