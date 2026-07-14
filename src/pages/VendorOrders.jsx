import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Loader2,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import OrderCard from "@/components/vendor/OrderCard";
import { Input } from "@/components/ui/input";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError("Failed to load orders. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError("Failed to update order status. Please try again.");
    }
  };

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(q) ||
      o.product_name?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    {
      label: "New Requests",
      value: orders.filter((o) => o.status === "new").length,
      icon: Clock,
    },
    {
      label: "In Progress",
      value: orders.filter((o) => ["confirmed", "preparing", "ready"].includes(o.status)).length,
      icon: Loader,
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle2,
    },
  ];

  return (
    <VendorAdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Orders
        </h1>
        <p className="text-sm text-[#0B2E2A]/50 mt-1">
          Track and manage incoming customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B2E2A]">{stat.value}</p>
            <p className="text-xs text-[#0B2E2A]/50 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "glass-card text-[#0B2E2A]/60 hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative md:max-w-xs md:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="rounded-full pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Orders grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">
            {search || activeTab !== "all" ? "No orders found" : "No orders yet"}
          </h3>
          <p className="text-sm text-[#0B2E2A]/50 max-w-sm">
            {search || activeTab !== "all"
              ? "Try a different filter or search term."
              : "Incoming customer orders will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </VendorAdminLayout>
  );
}