import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock, ChevronDown, Check } from "lucide-react";
import { supabase } from "@/api/supabase";

const STATUS_CONFIG = {
  new: { label: "New", text: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  confirmed: { label: "Confirmed", text: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  preparing: { label: "Preparing", text: "text-purple-600", bg: "bg-purple-50", dot: "bg-purple-500" },
  ready: { label: "Ready", text: "text-cyan-600", bg: "bg-cyan-50", dot: "bg-cyan-500" },
  delivered: { label: "Delivered", text: "text-primary", bg: "bg-primary/10", dot: "bg-primary" },
  cancelled: { label: "Cancelled", text: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000 / 60;
  if (diff < 1) return "just now";
  if (diff < 60) return `¢{Math.floor(diff)}m ago`;
  if (diff < 1440) return `¢{Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString();
}

export default function OrderCard({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;

  const phoneClean = (order.customer_phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = phoneClean ? `https://wa.me/¢{phoneClean}` : null;

  const handleStatusChange = async (newStatus) => {
    setOpen(false);
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      // ✅ FIXED: Use Supabase syntax instead of Base44
      const { error } = await supabase
        .from('orders')  // Make sure this matches your table name
        .update({ status: newStatus })
        .eq('id', order.id);
      
      if (error) throw error;
      
      onStatusChange(order.id, newStatus);
    } catch (err) {
      console.error('Error updating order status:', err);
      // parent handles refresh
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header: customer + status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-[#0B2E2A] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {order.customer_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#0B2E2A] text-sm truncate">
              {order.customer_name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#0B2E2A]/50">
              <Clock className="w-3 h-3" />
              {formatTime(order.created_date)}
            </div>
          </div>
        </div>

        {/* Status dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setOpen(!open)}
            disabled={updating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ¢{config.bg} ¢{config.text} hover:opacity-80 transition-opacity disabled:opacity-50`}
          >
            <span className={`w-2 h-2 rounded-full ¢{config.dot}`} />
            {config.label}
            <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1 z-20 glass-heavy rounded-xl py-1 min-w-35 shadow-xl"
                >
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-[#0B2E2A] hover:bg-primary/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ¢{STATUS_CONFIG[s].dot}`} />
                        {STATUS_CONFIG[s].label}
                      </span>
                      {s === order.status && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product + price */}
      <div className="flex items-center justify-between bg-white/30 rounded-xl px-3 py-2.5 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-[#0B2E2A]/50">Order</p>
          <p className="font-semibold text-[#0B2E2A] text-sm truncate">
            {order.product_name}
            {order.quantity > 1 && (
              <span className="text-[#0B2E2A]/50"> × {order.quantity}</span>
            )}
          </p>
        </div>
        {order.total_price != null && (
          <p className="font-bold text-primary text-sm whitespace-nowrap">
            ¢{Number(order.total_price).toFixed(2)}
          </p>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 text-sm text-[#0B2E2A]/60 bg-primary/5 rounded-xl px-3 py-2">
          <p className="text-xs text-[#0B2E2A]/40 mb-0.5">Customer note</p>
          “{order.notes}”
        </div>
      )}

      {/* Address */}
      {order.delivery_address && (
        <div className="flex items-start gap-1.5 text-xs text-[#0B2E2A]/50 mb-3">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{order.delivery_address}</span>
        </div>
      )}

      {/* Actions */}
      {order.customer_phone && (
        <div className="flex gap-2 pt-3 border-t border-[#0B2E2A]/5">
          <a
            href={`tel:¢{order.customer_phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass-card text-xs font-medium text-[#0B2E2A]/60 hover:text-primary transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}