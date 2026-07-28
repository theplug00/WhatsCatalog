import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Phone, User, MessageCircle, 
  ShoppingBag, Clock, CheckCircle, AlertCircle,
  Truck, Smartphone, Banknote, ChevronRight,
  Loader2, CreditCard, Send, Calendar,
  Mail, ArrowLeft, Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/api/supabase";
import { toast } from "@/components/ui/use-toast";
import { PAYMENT_METHODS, MOMO_NETWORKS, detectMomoNetwork } from "@/lib/paymentTypes";

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function CheckoutModal({ product, onClose, onSuccess, whatsappNumber }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    quantity: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Calculate total
  const totalPrice = (product?.price || 0) * form.quantity;

  // Default WhatsApp number
  const defaultWhatsApp = "233555140982";
  const vendorWhatsApp = whatsappNumber || defaultWhatsApp;

  // Reset form when product changes
  useEffect(() => {
    setOrderComplete(false);
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      quantity: 1,
    });
  }, [product]);

  // Handle form changes
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (form.quantity < 1) errs.quantity = "Quantity must be at least 1";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Place order - Send WhatsApp message
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Save order to Supabase
      const orderData = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || "",
        product_name: product.name,
        product_id: product.id,
        vendor_id: product.vendor_id,
        quantity: form.quantity,
        total_price: totalPrice,
        delivery_address: form.address,
        notes: form.notes || "",
        status: 'new',
        created_date: new Date().toISOString(),
        // ⏳ Payment fields commented out for now
        // payment_method: null,
        // payment_status: null,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      setOrderId(data.id);
      
      // Send WhatsApp message to vendor
      await sendWhatsAppMessage(data);

      setOrderComplete(true);
      toast({
        title: "✅ Order placed successfully!",
        description: "Check your WhatsApp for confirmation.",
        duration: 4000,
      });

      if (onSuccess) {
        onSuccess(data);
      }

      // Close after delay
      setTimeout(() => {
        onClose();
      }, 4000);

    } catch (err) {
      console.error('Order error:', err);
      toast({
        title: "❌ Failed to place order",
        description: err.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp message to vendor with all details
  const sendWhatsAppMessage = async (order) => {
    const message = 
      `🛍️ *New Order Received!*%0A%0A` +
      `*Customer:* ${order.customer_name}%0A` +
      `*Phone:* ${order.customer_phone}%0A` +
      `*Email:* ${order.customer_email || 'Not provided'}%0A` +
      `*Product:* ${order.product_name}%0A` +
      `*Quantity:* ${order.quantity}%0A` +
      `*Total:* GH₵${order.total_price.toFixed(2)}%0A` +
      `*Delivery Address:* ${order.delivery_address || 'Not specified'}%0A` +
      `*Notes:* ${order.notes || 'None'}%0A` +
      `*Order ID:* ${order.id.substring(0, 8)}%0A%0A` +
      `_Please contact the customer to confirm payment and delivery._`;

    const whatsappUrl = `https://wa.me/${vendorWhatsApp}?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };
  // In sendWhatsAppMessage function
const trackingLink = `${window.location.origin}/track-order/${order.id}`;

const message = 
  `🛍️ *New Order Received!*%0A%0A` +
  `*Customer:* ${order.customer_name}%0A` +
  `*Phone:* ${order.customer_phone}%0A` +
  `*Product:* ${order.product_name}%0A` +
  `*Total:* GH₵${order.total_price.toFixed(2)}%0A` +
  `*Delivery Address:* ${order.delivery_address || 'Not specified'}%0A%0A` +
  `🔗 *Track Order:* ${trackingLink}%0A%0A` +
  `_Please contact the customer to confirm payment and delivery._`;

  // If no product, return null
  if (!product) return null;

  // ============================================
  // ORDER COMPLETE SCREEN
  // ============================================
  if (orderComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B2E2A]">Order Placed! 🎉</h2>
          <p className="text-[#0B2E2A]/60 mt-2">
            Your order has been sent to the vendor. 
            Check your WhatsApp for confirmation.
          </p>
          <div className="mt-4 p-4 bg-primary/5 rounded-xl">
            <p className="text-sm font-semibold text-[#0B2E2A]">Order ID</p>
            <p className="text-xs text-[#0B2E2A]/40 font-mono">{orderId?.substring(0, 8) || 'N/A'}</p>
          </div>
          <Button
            onClick={onClose}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            Done
          </Button>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // MAIN CHECKOUT MODAL (Simplified)
  // ============================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-[#0B2E2A]/5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0B2E2A] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Details
              </h2>
              <p className="text-xs text-[#0B2E2A]/50">
                Fill in your details to place your order
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#F0F4F4] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#0B2E2A]" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Product Summary */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl mb-4">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0B2E2A] text-sm truncate">{product.name}</p>
              <p className="text-xs text-[#0B2E2A]/50">
                GH₵{product.price.toFixed(2)} × {form.quantity}
              </p>
            </div>
            <p className="font-bold text-primary text-sm">
              GH₵{totalPrice.toFixed(2)}
            </p>
          </div>

          {/* ✅ SIMPLIFIED FORM - NO PAYMENT OPTIONS */}
          <motion.div {...fadeInUp} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-[#0B2E2A]">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 rounded-xl"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-[#0B2E2A]">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="024XXXXXXX"
                  className="pl-10 rounded-xl"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#0B2E2A]">
                Email (optional)
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-[#0B2E2A]">
                Delivery Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#0B2E2A]/40" />
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street, city, landmark..."
                  className="pl-10 rounded-xl min-h-15"
                />
              </div>
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            {/* Quantity & Total */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity" className="text-sm font-medium text-[#0B2E2A]">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock || 999}
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#0B2E2A]">Total</Label>
                <div className="h-10 rounded-xl bg-primary/5 flex items-center px-3 text-sm font-bold text-primary">
                  GH₵{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-[#0B2E2A]">
                Order Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Special instructions..."
                className="rounded-xl min-h-12.5"
              />
            </div>

            {/* ✅ Simple Place Order Button - WhatsApp Only */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Order via WhatsApp
                </>
              )}
            </Button>

            {/* Info Message */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600/80 text-center">
              <p>
                Your order details will be sent to the vendor via WhatsApp. 
                The vendor will contact you to confirm payment and delivery.
              </p>
            </div>

            <p className="text-xs text-center text-[#0B2E2A]/40">
              By placing your order, you agree to our terms and conditions
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}