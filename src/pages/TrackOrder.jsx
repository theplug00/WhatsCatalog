import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Package, CheckCircle, XCircle, Clock, 
  Truck, MapPin, Phone, MessageCircle, User, 
  Calendar, ChevronRight, Home, AlertCircle,
  ShoppingBag, DollarSign, Send, ArrowLeft,
  Store
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";

// ============================================
// STATUS CONFIGURATION
// ============================================
const ORDER_STATUS = {
  new: { 
    label: "Order Placed", 
    icon: Clock, 
    color: "text-blue-500",
    bg: "bg-blue-100",
    border: "border-blue-200",
    step: 1,
    description: "Your order has been received and is being reviewed."
  },
  confirmed: { 
    label: "Confirmed", 
    icon: CheckCircle, 
    color: "text-amber-500",
    bg: "bg-amber-100",
    border: "border-amber-200",
    step: 2,
    description: "Your order has been confirmed by the vendor."
  },
  processing: { 
    label: "Processing", 
    icon: Package, 
    color: "text-purple-500",
    bg: "bg-purple-100",
    border: "border-purple-200",
    step: 3,
    description: "Your order is being prepared for shipping."
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    color: "text-cyan-500",
    bg: "bg-cyan-100",
    border: "border-cyan-200",
    step: 4,
    description: "Your order has been shipped and is on its way."
  },
  delivered: { 
    label: "Delivered", 
    icon: CheckCircle, 
    color: "text-emerald-500",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    step: 5,
    description: "Your order has been delivered. Enjoy your purchase!"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle, 
    color: "text-red-500",
    bg: "bg-red-100",
    border: "border-red-200",
    step: 0,
    description: "This order has been cancelled."
  },
  rejected: { 
    label: "Rejected", 
    icon: XCircle, 
    color: "text-red-500",
    bg: "bg-red-100",
    border: "border-red-200",
    step: 0,
    description: "This order has been rejected by the vendor."
  },
};

const STATUS_ORDER = ['new', 'confirmed', 'processing', 'shipped', 'delivered'];

// ============================================
// MAIN COMPONENT
// ============================================
export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);  // ✅ This is the key!
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        setError('Order not found. Please check your tracking link.');
        setLoading(false);
        return;
      }

      setOrder(orderData);  // ✅ Set the order data

      if (orderData.vendor_id) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', orderData.vendor_id)
          .single();

        if (vendorData) {
          setVendor(vendorData);
        }
      }

      const statusIndex = STATUS_ORDER.indexOf(orderData.status);
      setCurrentStep(statusIndex + 1);

    } catch (err) {
      console.error('Error loading order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status info
  const statusInfo = ORDER_STATUS[order?.status] || ORDER_STATUS.new;
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const whatsappNumber = vendor?.whatsapp_number || vendor?.business_phone || '';
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const steps = STATUS_ORDER.map((status) => ({
    status,
    label: ORDER_STATUS[status].label,
    isComplete: STATUS_ORDER.indexOf(status) < currentStep,
    isCurrent: order?.status === status,
    step: STATUS_ORDER.indexOf(status) + 1,
  }));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f0f4f4] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-[#0B2E2A]/60 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f0f4f4] to-white p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2E2A] mb-2">Order Not Found</h1>
          <p className="text-[#0B2E2A]/50">{error || "We couldn't find this order."}</p>
          <Link to="/">
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-white rounded-full px-8">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main render - only runs if order exists
  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0f4f4] to-white">
      {/* Header */}
      <div className="bg-white border-b border-[#0B2E2A]/5 px-5 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-[#0B2E2A]/60 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-[#0B2E2A]">Track Order</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </span>
                <span className="text-xs text-[#0B2E2A]/40">Order #{order.id?.substring(0, 8)}</span>
              </div>
              <h2 className="text-lg font-bold text-[#0B2E2A]">Order Details</h2>
            </div>
            <div className="text-sm text-[#0B2E2A]/50">
              <span className="block">Placed on {formatDate(order.created_date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#0B2E2A]/5">
            <div>
              <p className="text-xs text-[#0B2E2A]/40">Product</p>
              <p className="font-semibold text-[#0B2E2A]">{order.product_name}</p>
              <p className="text-sm text-[#0B2E2A]/50">Qty: {order.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-[#0B2E2A]/40">Total</p>
              <p className="font-bold text-primary text-lg">GH₵{order.total_price?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-xs text-[#0B2E2A]/40">Delivery Address</p>
              <p className="text-sm text-[#0B2E2A]">{order.delivery_address || 'Not specified'}</p>
            </div>
          </div>
        </motion.div>

        {/* Tracking Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5 mb-6"
        >
          <h3 className="font-bold text-[#0B2E2A] mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Order Timeline
          </h3>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#0B2E2A]/10" />

            {steps.map((step, index) => {
              const isCompleted = step.isComplete;
              const isCurrent = step.isCurrent;

              return (
                <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                  <div className="relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white' 
                        : isCurrent 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white border-[#0B2E2A]/20 text-[#0B2E2A]/40'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{step.step}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className={`flex items-center gap-2 ${
                      isCompleted ? 'text-[#0B2E2A]' : isCurrent ? 'text-[#0B2E2A]' : 'text-[#0B2E2A]/40'
                    }`}>
                      <p className="font-semibold">{step.label}</p>
                      {isCurrent && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      {isCompleted && !isCurrent && (
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    {isCurrent && statusInfo.description && (
                      <p className="text-sm text-[#0B2E2A]/60 mt-1">
                        {statusInfo.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Vendor Contact */}
        {vendor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5"
          >
            <h3 className="font-bold text-[#0B2E2A] mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Vendor Information
            </h3>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.business_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#0B2E2A]">{vendor.business_name}</p>
                  <p className="text-xs text-[#0B2E2A]/50">{vendor.category || 'Vendor'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {cleanNumber && (
                  <a href={`https://wa.me/${cleanNumber}`} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full px-5 gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                )}
                {order.customer_phone && (
                  <a href={`tel:${order.customer_phone}`}>
                    <Button variant="outline" className="rounded-full px-5 gap-2">
                      <Phone className="w-4 h-4" />
                      Call Vendor
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-[#0B2E2A]/40">
            Need help?{" "}
            <Link to="/" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto px-5 py-6 border-t border-[#0B2E2A]/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0B2E2A]/40">
          <p>© {new Date().getFullYear()} WhatsCatalog. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}