import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGallery from "@/components/landing/ProductGallery";

// ✅ Default WhatsApp number (fallback if none provided)
export const DEFAULT_WHATSAPP = "233555140982";

export function buildOrderLink(product, details = {}, whatsappNumber) {
  // ✅ Use provided number or fallback
  const number = whatsappNumber || DEFAULT_WHATSAPP;
  
  const message =
    `Hello! I'd like to place an order:%0A%0A` +
    `*Product:* ${product.name}%0A` +
    `*Category:* ${product.category || "N/A"}%0A` +
    `*Price:* $${Number(product.price).toFixed(2)}%0A%0A` +
    `*My name:* ${details.name || ""}%0A` +
    `*My phone:* ${details.phone || ""}%0A` +
    `*Quantity:* ${details.quantity || 1}%0A` +
    `*Delivery address:* ${details.address || ""}%0A` +
    `*Notes:* ${details.notes || ""}`;
  
  return `https://wa.me/${number}?text=${message}`;
}

export default function CheckoutModal({ product, onClose, whatsappNumber }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your name";
    if (!phone.trim()) errs.phone = "Please enter your phone number";
    if (!address.trim()) errs.address = "Please enter your delivery address";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // ✅ Build and open WhatsApp link
    const link = buildOrderLink(
      product, 
      { name, phone, address, quantity, notes }, 
      whatsappNumber
    );
    
    window.open(link, "_blank", "noopener,noreferrer");
    onClose();
  };

  // Don't render if no product
  if (!product) return null;

  // ✅ Get gallery images
  const gallery = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2E2A]/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-heavy rounded-3xl w-full max-w-md p-6 md:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h3 className="font-bold text-[#0B2E2A] font-heading text-lg leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold text-sm">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  {product.stock !== undefined && (
                    <p className="text-xs text-[#0B2E2A]/40">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery */}
            {gallery.length > 1 && (
              <div className="mb-5 -mx-1">
                <ProductGallery
                  images={gallery}
                  alt={product.name}
                  aspect="h-44"
                  className="rounded-2xl"
                />
              </div>
            )}

            {/* WhatsApp number display */}
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <p className="text-xs text-[#0B2E2A]/50">
                📱 Order via WhatsApp
              </p>
              <p className="text-sm font-semibold text-primary">
                +{whatsappNumber || DEFAULT_WHATSAPP}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 px-4 rounded-xl glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555 123 4567"
                  className="w-full h-11 px-4 rounded-xl glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, any delivery instructions..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 999}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full h-11 px-4 rounded-xl glass-card text-sm text-[#0B2E2A] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">
                    Total Price
                  </label>
                  <div className="w-full h-11 px-4 rounded-xl glass-card text-sm font-bold text-primary flex items-center">
                    ${(Number(product.price) * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests..."
                  className="w-full h-11 px-4 rounded-xl glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 glow-pulse"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Order via WhatsApp
              </Button>

              <p className="text-[10px] text-center text-[#0B2E2A]/30">
                Your order will be sent via WhatsApp to the store owner
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}