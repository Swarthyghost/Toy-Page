"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, X, CreditCard } from "lucide-react";
import { useCart } from "../context/CartContext";
import { usePaystackPayment } from "react-paystack";
import Link from "next/link";
import { useSEO } from "../hooks/useSEO";
import { validatePromoCode, usePromoCode, saveOrder } from "../services/firebaseApi";

export default function Cart() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    totalItems,
    discount,
    finalPrice,
    appliedPromo,
    applyPromo,
    removePromo,
    clearCart
  } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEO optimization for cart page
  useSEO({
    title: "Shopping Cart",
    description: `Your shopping cart with ${totalItems} items. Total: GHS ${totalPrice.toFixed(2)}. Complete your order with discreet delivery across Ghana.`,
    url: "/cart",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setIsValidating(true);
    setPromoError("");
    
    try {
      const promo = await validatePromoCode(promoInput.toUpperCase());
      if (promo) {
        if (promo.minAmount && totalPrice < promo.minAmount) {
          setPromoError(`Minimum order amount for this code is GHS ${promo.minAmount}`);
        } else {
          applyPromo(promo);
          setPromoInput("");
        }
      } else {
        setPromoError("Invalid or expired promo code");
      }
    } catch (error) {
      setPromoError("Error validating promo code");
    } finally {
      setIsValidating(false);
    }
  };

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderList = cart
      .map(
        (item, index) =>
          `*${index + 1}. ${item.name}* (x${item.quantity})\nPrice: GHS ${(item.price * item.quantity).toFixed(2)}\nView Product: ${window.location.origin}/product/${item.id}`,
      )
      .join("\n\n");

    const promoDetails = appliedPromo 
      ? `\n*Promo Code:* ${appliedPromo.code} (-GHS ${discount.toFixed(2)})`
      : "";

    const message = `Hello, I would like to place an order.

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Location: ${formData.location}

*Order Summary:*
${orderList}
${promoDetails}

*Subtotal: GHS ${totalPrice.toFixed(2)}*
*Discount: GHS ${discount.toFixed(2)}*
*Total Payable: GHS ${finalPrice.toFixed(2)}*

Please confirm my order. Thank you!`;

    // Pre-open the tab synchronously to bypass browser popup blockers
    const whatsappWindow = window.open("", "_blank");

    try {
      // Save order details to Firestore
      await saveOrder({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: finalPrice,
        paymentMethod: "WhatsApp"
      });
    } catch (error) {
      console.error("Error saving WhatsApp order to Firestore:", error);
      alert("Note: There was a system error saving your contact details, but we are opening WhatsApp to place your order now.");
    }

    // Increment promo usage if applicable (Fire and forget to avoid blocking UI)
    if (appliedPromo) {
      usePromoCode(appliedPromo.id).catch((error) => {
        console.error("Error updating promo use:", error);
      });
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233266181581?text=${encodedMessage}`;

    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl;
    } else {
      // Fallback if window creation failed completely
      window.location.href = whatsappUrl;
    }
    clearCart();
    setIsSubmitting(false);
    setIsCheckoutOpen(false);
  };

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email || "customer@toy-page.com",
    amount: Math.round(finalPrice * 100), // amount in pesewas
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccessAction = (reference: any) => {
    console.log("Payment successful", reference);
    saveOrder({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: finalPrice,
      paymentMethod: "Paystack"
    }).then(() => {
      alert("Payment successful! Your order has been placed.");
      setIsCheckoutOpen(false);
      clearCart();
    }).catch(error => {
      console.error("Error saving Paystack order to Firestore:", error);
      alert("Payment successful! Your order has been placed.");
      setIsCheckoutOpen(false);
      clearCart();
    });
  };

  const handlePaystackCloseAction = () => {
    console.log("Payment modal closed");
  };

  const handleDebitCardClick = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      alert("Please fill in all details before paying with card.");
      return;
    }
    initializePayment({ onSuccess: handlePaystackSuccessAction, onClose: handlePaystackCloseAction });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={40} className="text-white/20" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-white/40 mb-8 text-center max-w-xs">
          Looks like you haven't added anything to your pleasure collection yet.
        </p>
        <Link
          href="/"
          className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-display font-bold mb-12">Your Collection</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-3xl group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-2">{item.category}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-black/40 rounded-full px-3 py-1 border border-white/10">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display font-bold">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-white/20 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-8 bg-white/5 border border-white/10 rounded-[2rem]">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-white/60">
                <span>Subtotal ({totalItems} items)</span>
                <span>GHS {totalPrice.toFixed(2)}</span>
              </div>
              
              {appliedPromo ? (
                <div className="flex justify-between text-emerald-500 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <span>Discount ({appliedPromo.code})</span>
                    <button onClick={removePromo} className="p-1 hover:text-primary transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <span>- GHS {discount.toFixed(2)}</span>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isValidating || !promoInput}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      {isValidating ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-2 text-[10px] text-primary font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                      {promoError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between text-white/60">
                <span>Delivery</span>
                <span className="text-emerald-500">Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="font-bold">Total</span>
                <span className="text-3xl font-display font-bold text-primary">
                  GHS {finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Proceed to Order
              <ArrowRight size={20} />
            </button>

            <p className="mt-4 text-[10px] text-center text-white/30 uppercase tracking-widest">
              Secure Checkout via WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-display font-bold mb-2">Checkout</h2>
              <p className="text-white/40 mb-8">
                Please provide your details to complete the order via WhatsApp.
              </p>

              <form onSubmit={handleWhatsAppOrder} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="024 000 0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    Delivery Location
                  </label>
                  <textarea
                    required
                    placeholder="Accra, East Legon..."
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors min-h-[80px] sm:min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Order via WhatsApp"}
                    <ArrowRight size={20} />
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-white/40 text-xs font-bold uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDebitCardClick}
                    className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Pay with Debit Card
                    <CreditCard size={20} />
                  </button>

                  <div className="pt-6 mt-2 border-t border-white/10 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
                      Secured Payments &amp; Accepted Methods
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                      {/* Visa - card style matching provided image */}
                      <div className="h-8 rounded-md overflow-hidden flex items-center justify-center" title="Visa">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 54" className="h-8 w-auto" aria-label="Visa">
                          <rect width="86" height="54" rx="4" fill="white" stroke="#1A1F71" strokeWidth="2"/>
                          <rect x="0" y="8" width="86" height="12" fill="#1A1F71"/>
                          <rect x="0" y="42" width="86" height="10" rx="0" fill="#F7A800"/>
                          <text x="43" y="37" textAnchor="middle" fill="#1A1F71" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="18" letterSpacing="1">VISA</text>
                        </svg>
                      </div>
                      {/* Mastercard - overlapping circles with text matching provided image */}
                      <div className="h-8 rounded-md overflow-hidden flex items-center justify-center bg-white px-1" title="Mastercard">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 54" className="h-8 w-auto" aria-label="Mastercard">
                          <circle cx="32" cy="27" r="22" fill="#CC0000"/>
                          <circle cx="58" cy="27" r="22" fill="#FF9900"/>
                          <path d="M45 10.2a22 22 0 010 33.6A22 22 0 0145 10.2z" fill="#FF6600"/>
                          {/* Stripes in overlap */}
                          <clipPath id="mc-overlap">
                            <path d="M45 10.2a22 22 0 010 33.6A22 22 0 0145 10.2z"/>
                          </clipPath>
                          <g clipPath="url(#mc-overlap)">
                            {[12,16,20,24,28,32,36,40].map((y, i) => (
                              <rect key={i} x="34" y={y} width="12" height="2" fill={i % 2 === 0 ? "#FF6600" : "#FF8800"} opacity="0.6"/>
                            ))}
                          </g>
                          <text x="45" y="30" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" letterSpacing="0.3">MasterCard</text>
                        </svg>
                      </div>
                      {/* MTN MoMo - local image */}
                      <div className="h-8 bg-[#ffcc00] rounded-md px-2 flex items-center justify-center" title="MTN MoMo">
                        <img src="/mtn.jpg" alt="MTN MoMo" className="h-6 w-auto object-contain rounded" />
                      </div>
                      <div className="h-8 bg-[#e60000] rounded-md px-3 flex items-center justify-center shadow-inner" title="Telecel Cash">
                        <span className="text-white text-[11px] font-black whitespace-nowrap tracking-tighter">Telecel Cash</span>
                      </div>
                      {/* AirtelTigo Money - using actual logo image */}
                      <div className="h-8 bg-white rounded-md px-2 flex items-center justify-center" title="AirtelTigo Money">
                        <img src="/airteltigo.jpg" alt="AirtelTigo Money" className="h-7 w-auto object-contain" />
                      </div>
                      <div className="h-8 bg-[#09A5DB] rounded-md px-3 flex items-center justify-center shadow-inner" title="Paystack">
                        <span className="text-white text-[11px] font-black whitespace-nowrap tracking-tighter">Paystack Secured</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
