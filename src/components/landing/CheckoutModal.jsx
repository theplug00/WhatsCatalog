import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Phone, User, MessageCircle, 
  ShoppingBag, Clock, CheckCircle, AlertCircle,
  Truck, Smartphone, Banknote, ChevronRight,
  Loader2, CreditCard, Send, Calendar,
  Mail, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/api/supabase";
import { toast } from "@/components/ui/use-toast";
import { MOMO_NETWORKS, detectMomoNetwork } from "@/lib/paymentTypes";

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
  const [step, setStep] = useState(1);
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
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    network: "",
    momoNumber: "",
    confirmNumber: "",
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Calculate total
  const totalPrice = (product?.price || 0) * form.quantity;

  // Default WhatsApp number
  const defaultWhatsApp = "233555140982";
  const vendorWhatsApp = whatsappNumber || defaultWhatsApp;

  // Reset form when product changes
  useEffect(() => {
    setStep(1);
    setPaymentMethod(null);
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

  // Validate step 1
  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (form.quantity < 1) errs.quantity = "Quantity must be at least 1";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Go to payment step
  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Validate payment
  const validatePayment = () => {
    if (paymentMethod === 'cod') return true;
    
    if (paymentMethod === 'momo') {
      const errs = {};
      if (!paymentDetails.momoNumber || paymentDetails.momoNumber.length < 10) {
        errs.momoNumber = "Valid phone number required";
      }
      if (!paymentDetails.network) {
        errs.network = "Please select your network";
      }
      if (paymentDetails.momoNumber !== paymentDetails.confirmNumber) {
        errs.confirmNumber = "Numbers do not match";
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return false;
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!validatePayment()) return;
    
    setLoading(true);
    try {
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
  status: 'new',  // ✅ Use 'new' for all orders
  payment_method: paymentMethod,
  payment_status: 'pending',
  created_date: new Date().toISOString(),
};

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      setOrderId(data.id);
      
      // Send WhatsApp message
      await sendWhatsAppMessage(data);

      setOrderComplete(true);
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed.",
        duration: 4000,
      });

      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      console.error('Order error:', err);
      toast({
        title: "Failed to place order",
        description: err.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = async (order) => {
    const message = 
      `📦 *New Order Received!*%0A%0A` +
      `*Customer:* ${order.customer_name}%0A` +
      `*Phone:* ${order.customer_phone}%0A` +
      `*Product:* ${order.product_name}%0A` +
      `*Quantity:* ${order.quantity}%0A` +
      `*Total:* GH₵${order.total_price.toFixed(2)}%0A` +
      `*Delivery:* ${order.delivery_address || 'Not specified'}%0A` +
      `*Payment Method:* ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Money'}%0A` +
      `*Order ID:* ${order.id.substring(0, 8)}%0A%0A` +
      `_Please confirm and process this order._`;

    const whatsappUrl = `https://wa.me/${vendorWhatsApp}?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Auto-detect mobile network
  const detectNetwork = (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const network = detectMomoNetwork(cleaned);
    if (network) {
      setPaymentDetails(prev => ({ ...prev, network }));
    }
  };

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
            Your order has been confirmed. Check your WhatsApp for confirmation.
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
  // MAIN CHECKOUT MODAL
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
                Checkout
              </h2>
              <p className="text-xs text-[#0B2E2A]/50">
                Step {step} of 2
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

          {/* ============================================ */}
          {/* STEP 1: CUSTOMER DETAILS */}
          {/* ============================================ */}
          {step === 1 && (
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
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
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
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
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

              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold"
              >
                Continue to Payment
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* STEP 2: PAYMENT */}
          {/* ============================================ */}
          {step === 2 && (
            <motion.div {...fadeInUp} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                <button
                  onClick={() => setStep(1)}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
                <span>•</span>
                <span>Payment</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#0B2E2A]">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: <Truck className="w-4 h-4" /> },
                    { id: 'momo', label: 'Mobile Money', icon: <Smartphone className="w-4 h-4" /> },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-[#0B2E2A]/10 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-sm font-semibold text-[#0B2E2A]">
                        {method.icon}
                        {method.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* COD Details */}
              {paymentMethod === 'cod' && (
                <motion.div {...fadeInUp} className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Truck className="w-5 h-5" />
                      <p className="text-sm font-medium">Cash on Delivery</p>
                    </div>
                    <p className="text-xs text-amber-600/80 mt-1">
                      Pay when your order arrives. Have the exact amount ready.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* MoMo Details */}
              {paymentMethod === 'momo' && (
                <motion.div {...fadeInUp} className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Smartphone className="w-5 h-5" />
                      <p className="text-sm font-medium">Mobile Money</p>
                    </div>
                    <p className="text-xs text-blue-600/80 mt-1">
                      We'll send a payment request to your phone
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#0B2E2A]">Select Network</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {MOMO_NETWORKS.map((network) => (
                        <button
                          key={network.id}
                          type="button"
                          onClick={() => setPaymentDetails(prev => ({ ...prev, network: network.id }))}
                          className={`p-2 rounded-xl text-xs font-medium transition-all ${
                            paymentDetails.network === network.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-[#F0F4F4] text-[#0B2E2A]/60 hover:bg-primary/10'
                          }`}
                        >
                          {network.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    {errors.network && <p className="text-xs text-red-500 mt-1">{errors.network}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#0B2E2A]">Mobile Money Number</Label>
                    <Input
                      type="tel"
                      value={paymentDetails.momoNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPaymentDetails(prev => ({ ...prev, momoNumber: val }));
                        detectNetwork(val);
                      }}
                      placeholder="024XXXXXXX"
                      className="rounded-xl mt-1"
                    />
                    {errors.momoNumber && <p className="text-xs text-red-500 mt-1">{errors.momoNumber}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#0B2E2A]">Confirm Number</Label>
                    <Input
                      type="tel"
                      value={paymentDetails.confirmNumber}
                      onChange={(e) => setPaymentDetails(prev => ({ 
                        ...prev, 
                        confirmNumber: e.target.value.replace(/[^0-9]/g, '') 
                      }))}
                      placeholder="Confirm number"
                      className="rounded-xl mt-1"
                    />
                    {errors.confirmNumber && <p className="text-xs text-red-500 mt-1">{errors.confirmNumber}</p>}
                  </div>

                  {paymentDetails.network && (
                    <div className="p-2 rounded-xl bg-green-50 text-green-700 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Network: {MOMO_NETWORKS.find(n => n.id === paymentDetails.network)?.name}
                    </div>
                  )}
                </motion.div>
              )}

              {!paymentMethod && (
                <p className="text-center text-sm text-[#0B2E2A]/40 py-4">
                  Please select a payment method to continue
                </p>
              )}

              {paymentMethod && (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-2" />
                      Place Order - GH₵{totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>
              )}

              <p className="text-xs text-center text-[#0B2E2A]/40">
                By placing your order, you agree to our terms and conditions
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}