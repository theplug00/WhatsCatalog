import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  PackageX,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { supabase } from "@/api/supabase";

const LOW_STOCK_THRESHOLD = 5;

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function VendorSummary({ products }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Load orders from Supabase
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_date', { ascending: false })
          .limit(200);

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders');
        // Silent fail - summary degrades gracefully
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // ✅ Calculate today's stats
  const todaysOrders = orders.filter((o) => isToday(o.created_date));
  const itemsSoldToday = todaysOrders.reduce(
    (sum, o) => sum + (Number(o.quantity) || 1),
    0
  );
  const revenueToday = todaysOrders.reduce(
    (sum, o) => sum + (Number(o.total_price) || 0),
    0
  );

  // ✅ Calculate inventory stats
  const totalStock = products.reduce(
    (sum, p) => sum + (Number(p.stock) || 0),
    0
  );
  const outOfStock = products.filter((p) => (Number(p.stock) || 0) <= 0);
  const lowStock = products.filter((p) => {
    const s = Number(p.stock) || 0;
    return s > 0 && s <= LOW_STOCK_THRESHOLD;
  });

  // ✅ Tiles configuration
  const tiles = [
    {
      label: "Items Sold Today",
      value: loading ? "—" : itemsSoldToday,
      sub: loading ? "Loading…" : `${todaysOrders.length} orders`,
      icon: ShoppingBag,
      accent: "primary",
    },
    {
      label: "Revenue Today",
      value: loading ? "—" : `$${revenueToday.toFixed(0)}`,
      sub: loading ? "Loading…" : "From today's orders",
      icon: TrendingUp,
      accent: "primary",
    },
    {
      label: "Total Inventory",
      value: totalStock,
      sub: `${products.length} products`,
      icon: Package,
      accent: "primary",
    },
    {
      label: "Out of Stock",
      value: outOfStock.length,
      sub: `${lowStock.length} low stock`,
      icon: PackageX,
      accent: outOfStock.length > 0 ? "red" : "primary",
    },
  ];

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-5 md:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#0B2E2A]">
              Today's Summary
            </h2>
            <p className="text-xs text-[#0B2E2A]/50 mt-0.5">
              Sales and inventory at a glance
            </p>
          </div>
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-2xl bg-white/50 border border-white/40 p-4"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  tile.accent === "red"
                    ? "bg-red-100"
                    : "bg-primary/10"
                }`}
              >
                <tile.icon
                  className={`w-4 h-4 ${
                    tile.accent === "red" ? "text-red-500" : "text-primary"
                  }`}
                />
              </div>
              <p className="text-2xl font-bold text-[#0B2E2A] leading-none">
                {tile.value}
              </p>
              <p className="text-xs font-semibold text-[#0B2E2A]/70 mt-1.5">
                {tile.label}
              </p>
              <p className="text-[11px] text-[#0B2E2A]/40 mt-0.5">
                {tile.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Low stock alerts */}
        {!loading && (outOfStock.length > 0 || lowStock.length > 0) && (
          <div className="mt-5 pt-5 border-t border-[#0B2E2A]/8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-[#0B2E2A]">
                Inventory Alerts
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {outOfStock.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100"
                >
                  <PackageX className="w-3 h-3" />
                  {p.name} — Out of stock
                </span>
              ))}
              {lowStock.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {p.name} — {p.stock} left
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error message (silent fallback) */}
        {error && !loading && (
          <div className="mt-4 text-xs text-[#0B2E2A]/40 text-center">
            <span>Unable to load order data. Summary may be incomplete.</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}