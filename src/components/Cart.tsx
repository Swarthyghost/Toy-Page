"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, X, CreditCard, User, Mail, Phone, MapPin, Check, ShieldCheck } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"WhatsApp" | "Paystack">("WhatsApp");

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
                className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl group"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg group-hover:text-primary transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-white/40 text-[10px] sm:text-sm mb-1.5 sm:mb-2">{item.category}</p>
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2.5 sm:gap-3 bg-black/40 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 border border-white/10">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="text-xs sm:text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                    <span className="font-display font-bold text-sm sm:text-base">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 sm:p-3 text-white/20 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-6 right-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-full grid grid-cols-1 md:grid-cols-12">
                {/* Left Side: Checkout Form & Payment (7/12 cols) */}
                <div className="md:col-span-7 p-6 sm:p-8 space-y-6 border-b md:border-b-0 border-white/10">
                  <div>
                    <h2 className="text-3xl font-display font-bold mb-1">Checkout</h2>
                    <p className="text-white/40 text-sm">
                      Complete your order with 100% discreet packaging.
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (paymentMethod === "WhatsApp") {
                        handleWhatsAppOrder(e);
                      } else {
                        handleDebitCardClick();
                      }
                    }} 
                    className="space-y-5"
                  >
                    {/* Customer Details Form */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                          Full Name
                        </label>
                        <div className="relative flex items-center">
                          <User size={18} className="absolute left-4 text-white/30" />
                          <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm placeholder:text-white/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                            Email Address
                          </label>
                          <div className="relative flex items-center">
                            <Mail size={18} className="absolute left-4 text-white/30" />
                            <input
                              required
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm placeholder:text-white/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                            Phone Number
                          </label>
                          <div className="relative flex items-center">
                            <Phone size={18} className="absolute left-4 text-white/30" />
                            <input
                              required
                              type="tel"
                              placeholder="024 000 0000"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm placeholder:text-white/20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                          Delivery Location
                        </label>
                        <div className="relative flex items-start">
                          <MapPin size={18} className="absolute left-4 top-3.5 text-white/30" />
                          <textarea
                            required
                            placeholder="Accra, East Legon..."
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-colors text-sm min-h-[70px] resize-none placeholder:text-white/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("WhatsApp")}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 relative ${
                            paymentMethod === "WhatsApp"
                              ? "bg-emerald-600/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.48 4.908 1.482 5.286 0 9.554-4.261 9.556-9.54.001-2.558-.993-4.962-2.799-6.77-1.804-1.807-4.204-2.802-6.756-2.803-5.291 0-9.56 4.262-9.563 9.542-.001 1.81.488 3.462 1.464 4.888l-.993 3.629 3.733-.979zm11.168-6.195c-.3-.15-1.774-.875-2.046-.975-.272-.1-.471-.15-.669.15-.198.3-.765.975-.939 1.175-.173.2-.347.225-.648.075-.3-.15-1.266-.466-2.41-1.487-.89-.794-1.492-1.775-1.666-2.075-.173-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.725 2.02-1.425.247-.7.247-1.3 0-1.425a.44.44 0 00-.223-.15z"/>
                              </svg>
                            </span>
                            {paymentMethod === "WhatsApp" && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">WhatsApp</h4>
                            <p className="text-[9px] text-white/40 mt-0.5">Quick order placement</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Paystack")}
                          className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 relative ${
                            paymentMethod === "Paystack"
                              ? "bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                              <CreditCard className="w-4 h-4" />
                            </span>
                            {paymentMethod === "Paystack" && <Check className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">Card / MoMo</h4>
                            <p className="text-[9px] text-white/40 mt-0.5">Pay via Paystack</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {paymentMethod === "WhatsApp" ? (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 text-sm"
                        >
                          {isSubmitting ? "Processing..." : "Order via WhatsApp"}
                          <ArrowRight size={18} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 text-sm"
                        >
                          Pay Securely with Paystack
                          <CreditCard size={18} />
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right Side: Order Summary Review (5/12 cols) */}
                <div className="md:col-span-5 p-6 sm:p-8 bg-white/[0.02] flex flex-col justify-between">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b border-white/5 pb-3">Review Items</h3>
                    
                    {/* Item list */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded-lg" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-grow min-w-0">
                            <h4 className="text-xs font-bold truncate text-white">{item.name}</h4>
                            <p className="text-[10px] text-white/40">GHS {item.price.toFixed(2)} × {item.quantity}</p>
                          </div>
                          <span className="text-xs font-bold text-white">GHS {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <div className="flex justify-between text-xs text-white/40">
                        <span>Subtotal</span>
                        <span>GHS {totalPrice.toFixed(2)}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-xs text-emerald-400">
                          <span>Discount ({appliedPromo.code})</span>
                          <span>- GHS {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-white/40">
                        <span>Discreet Delivery</span>
                        <span className="text-emerald-400">Free</span>
                      </div>
                      <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                        <span className="text-xs font-bold">Total payable</span>
                        <span className="text-xl font-display font-bold text-primary">
                          GHS {finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust details */}
                  <div className="pt-6 mt-6 border-t border-white/5 text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Guaranteed Safe &amp; Discreet Packaging</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 opacity-60 hover:opacity-85 transition-opacity">
                      {/* Visa */}
                      <div className="h-6 rounded bg-white px-1 flex items-center justify-center" title="Visa">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 54" className="h-4 w-auto" aria-label="Visa">
                          <rect width="86" height="54" rx="4" fill="white" stroke="#1A1F71" strokeWidth="2"/>
                          <rect x="0" y="8" width="86" height="12" fill="#1A1F71"/>
                          <rect x="0" y="42" width="86" height="10" fill="#F7A800"/>
                          <text x="43" y="37" textAnchor="middle" fill="#1A1F71" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="18" letterSpacing="1">VISA</text>
                        </svg>
                      </div>
                      {/* Mastercard */}
                      <div className="h-6 rounded bg-white px-1 flex items-center justify-center" title="Mastercard">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 54" className="h-4 w-auto" aria-label="Mastercard">
                          <circle cx="32" cy="27" r="22" fill="#CC0000"/>
                          <circle cx="58" cy="27" r="22" fill="#FF9900"/>
                          <path d="M45 10.2a22 22 0 010 33.6A22 22 0 0145 10.2z" fill="#FF6600"/>
                          <text x="45" y="30" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" letterSpacing="0.3">MasterCard</text>
                        </svg>
                      </div>
                      {/* MTN */}
                      <div className="h-6 bg-[#ffcc00] rounded px-1.5 flex items-center justify-center" title="MTN MoMo">
                        <img src="/mtn.jpg" alt="MTN MoMo" className="h-4 w-auto object-contain rounded-sm" />
                      </div>
                      {/* Telecel */}
                      <div className="h-6 bg-[#e60000] rounded px-2 flex items-center justify-center" title="Telecel Cash">
                        <span className="text-white text-[8px] font-black whitespace-nowrap tracking-tighter">Telecel</span>
                      </div>
                      {/* AirtelTigo */}
                      <div className="h-6 bg-white rounded px-1 flex items-center justify-center" title="AirtelTigo Money">
                        <img src="/airteltigo.jpg" alt="AirtelTigo Money" className="h-4 w-auto object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
