import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } =
    useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // SEO optimization for cart page
  useSEO({
    title: "Shopping Cart",
    description: `Your shopping cart with ${totalItems} items. Total: GHS ${totalPrice.toFixed(2)}. Complete your order with discreet delivery across Ghana.`,
    url: "/cart",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderList = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x${item.quantity} - GHS ${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n");

    const message = `Hello, I would like to place an order.

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Location: ${formData.location}

*Order Summary:*
${orderList}

*Total: GHS ${totalPrice.toFixed(2)}*

Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233266181581?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
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
          to="/"
          className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-transform"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
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
              <div className="flex justify-between text-white/60">
                <span>Delivery</span>
                <span className="text-emerald-500">Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="font-bold">Total</span>
                <span className="text-3xl font-display font-bold text-primary">
                  GHS {totalPrice.toFixed(2)}
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
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
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

              <form onSubmit={handleWhatsAppOrder} className="space-y-6">
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
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
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
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
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
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors min-h-[100px] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Order via WhatsApp
                  <ArrowRight size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
