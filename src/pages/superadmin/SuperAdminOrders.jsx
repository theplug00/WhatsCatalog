import React, { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/api/supabase";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_FLOW = ["new", "confirmed", "preparing", "ready", "delivered", "cancelled"];

export default function SuperAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Error loading orders:', e);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (order, status) => {
    setUpdating(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order.id);

      if (error) throw error;
      
      // Refresh orders after update
      await loadOrders();
    } catch (e) {
      console.error('Error updating order status:', e);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.product_name?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Orders
        </h1>
        <p className="text-[#0B2E2A]/50 mt-1">Review, approve, and track all customer orders</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-3 text-sm font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, customer, or phone..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_FLOW].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-11 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#0B2E2A]/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4F4]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Qty</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#0B2E2A]/60 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-[#0B2E2A]/5 hover:bg-[#F0F4F4]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-[#0B2E2A]">{o.customer_name || "Unknown"}</p>
                    {o.delivery_address && (
                      <p className="text-xs text-[#0B2E2A]/50 truncate max-w-50">{o.delivery_address}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#0B2E2A]">{o.customer_phone || "—"}</td>
                  <td className="px-5 py-4 text-sm text-[#0B2E2A]">{o.product_name || "Product"}</td>
                  <td className="px-5 py-4 text-sm text-[#0B2E2A]">{o.quantity || 1}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#0B2E2A]">
                    ${(o.total_price || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-700"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* New -> Preparing */}
                      {(o.status === "new" || o.status === "confirmed") && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(o, "preparing")}
                          className="px-3 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      
                      {/* Cancel order */}
                      {(o.status === "new" || o.status === "confirmed" || o.status === "preparing") && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(o, "cancelled")}
                          className="px-3 h-8 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                      )}
                      
                      {/* Preparing -> Ready */}
                      {o.status === "preparing" && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(o, "ready")}
                          className="px-3 h-8 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Clock className="w-3.5 h-3.5" /> Ready
                        </button>
                      )}
                      
                      {/* Ready -> Delivered */}
                      {o.status === "ready" && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(o, "delivered")}
                          className="px-3 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Delivered
                        </button>
                      )}
                      
                      {/* Show order ID for reference */}
                      <span className="text-xs text-[#0B2E2A]/30 hidden lg:inline">
                        #{o.id?.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-[#0B2E2A]/40">No orders found</p>
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="text-xs text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Total Orders</p>
          <p className="text-lg font-bold text-[#0B2E2A]">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Pending</p>
          <p className="text-lg font-bold text-amber-600">
            {orders.filter(o => o.status === "new" || o.status === "confirmed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Preparing</p>
          <p className="text-lg font-bold text-purple-600">
            {orders.filter(o => o.status === "preparing").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Delivered</p>
          <p className="text-lg font-bold text-primary">
            {orders.filter(o => o.status === "delivered").length}
          </p>
        </div>
      </div>
    </div>
  );
}