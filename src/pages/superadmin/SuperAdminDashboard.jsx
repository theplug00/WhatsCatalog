import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, ShoppingBag, Users, CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/api/supabase";

function StatCard({ icon: Icon, label, value, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-extrabold font-heading text-[#0B2E2A] mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function SuperAdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendors and orders in parallel
        const [vendorsResult, ordersResult] = await Promise.all([
          supabase.from('vendors').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_date', { ascending: false })
        ]);

        if (vendorsResult.error) throw vendorsResult.error;
        if (ordersResult.error) throw ordersResult.error;

        setVendors(vendorsResult.data || []);
        setOrders(ordersResult.data || []);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Calculate statistics
  const pendingVendors = vendors.filter((v) => v.status === "pending");
  const approvedVendors = vendors.filter((v) => v.status === "active");
  const pendingOrders = orders.filter((o) => o.status === "new" || o.status === "confirmed");
  
  // Unique customers
  const uniqueCustomers = new Map();
  orders.forEach((o) => {
    if (o.customer_phone) uniqueCustomers.set(o.customer_phone, o);
  });

  // Recent vendors (last 5)
  const recentVendors = vendors.slice(0, 5);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Admin Dashboard
        </h1>
        <p className="text-[#0B2E2A]/50 mt-1">Overview of your platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Store} 
          label="Total Vendors" 
          value={vendors.length} 
          accent="bg-primary/10 text-primary" 
          delay={0} 
        />
        <StatCard 
          icon={Clock} 
          label="Pending Approvals" 
          value={pendingVendors.length} 
          accent="bg-amber-100 text-amber-600" 
          delay={0.05} 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={orders.length} 
          accent="bg-blue-100 text-blue-600" 
          delay={0.1} 
        />
        <StatCard 
          icon={Users} 
          label="Total Customers" 
          value={uniqueCustomers.size} 
          accent="bg-purple-100 text-purple-600" 
          delay={0.15} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending vendors */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-heading text-[#0B2E2A]">Vendors Awaiting Approval</h2>
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
              {pendingVendors.length} pending
            </span>
          </div>
          {pendingVendors.length === 0 ? (
            <p className="text-sm text-[#0B2E2A]/40 py-6 text-center">No vendors awaiting approval</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pendingVendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#0B2E2A]/5 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-[#0B2E2A]">{v.business_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{v.business_email}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 capitalize">{v.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-heading text-[#0B2E2A]">Recent Orders</h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
              {orders.length} total
            </span>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-[#0B2E2A]/40 py-6 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#0B2E2A]/5 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-[#0B2E2A]">{o.product_name || 'Product'}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{o.customer_name}</p>
                  </div>
                  <span className={`text-xs font-semibold capitalize ${
                    o.status === 'delivered' ? 'text-primary' :
                    o.status === 'cancelled' ? 'text-red-500' :
                    'text-[#0B2E2A]/60'
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription summary */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="font-bold font-heading text-[#0B2E2A]">Subscription Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["free", "basic", "pro", "enterprise"].map((plan) => {
            const count = vendors.filter((v) => v.plan === plan).length;
            return (
              <div key={plan} className="text-center py-4 rounded-xl bg-[#F0F4F4]">
                <p className="text-2xl font-extrabold font-heading text-[#0B2E2A]">{count}</p>
                <p className="text-xs font-semibold text-[#0B2E2A]/50 capitalize mt-1">{plan} plan</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}