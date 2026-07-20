import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Users, ShoppingBag, 
  DollarSign, Award, Eye, ArrowUpRight, Loader2 
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Link } from "react-router-dom";

export default function SuperAdminAnalytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalVendors: 0,
    totalProducts: 0,
    pendingVendors: 0,
    topVendors: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("week"); // week, month, year

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Get total vendors
      const { count: totalVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      const { count: pendingVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 2. Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // 3. Get orders with revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_date', { ascending: false });

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

      // 4. Get top vendors by revenue
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, business_name, status, business_email');

      // Calculate vendor revenue (simplified - in production you'd have vendor_id on orders)
      // For now, let's show pending vendors as top priority
      const topVendors = vendors
        ?.filter(v => v.status === 'active')
        .slice(0, 5)
        .map(v => ({
          ...v,
          revenue: Math.floor(Math.random() * 1000) + 100 // Placeholder - replace with actual
        })) || [];

      setStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalVendors: totalVendors || 0,
        totalProducts: totalProducts || 0,
        pendingVendors: pendingVendors || 0,
        topVendors,
        recentOrders: orders?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
            Platform Analytics
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Overview of your marketplace performance
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                timeframe === t
                  ? 'bg-primary text-white'
                  : 'bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { 
            label: 'Total Revenue', 
            value: `GH₵${stats.totalRevenue.toFixed(2)}`, 
            icon: DollarSign,
            color: 'bg-emerald-100 text-emerald-600'
          },
          { 
            label: 'Total Orders', 
            value: stats.totalOrders, 
            icon: ShoppingBag,
            color: 'bg-blue-100 text-blue-600'
          },
          { 
            label: 'Total Vendors', 
            value: stats.totalVendors, 
            icon: Users,
            color: 'bg-purple-100 text-purple-600'
          },
          { 
            label: 'Pending Approvals', 
            value: stats.pendingVendors, 
            icon: Award,
            color: 'bg-amber-100 text-amber-600'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-extrabold text-[#0B2E2A]">{stat.value}</p>
                <p className="text-xs text-[#0B2E2A]/50 mt-0.5">{stat.label}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Quick Actions */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <Link to="/super-admin/vendors" className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5 hover:border-primary/30 transition-colors text-center">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
      <Users className="w-5 h-5 text-primary" />
    </div>
    <p className="text-sm font-semibold text-[#0B2E2A]">Manage Vendors</p>
    <p className="text-xs text-[#0B2E2A]/40">{stats.pendingVendors} pending</p>
  </Link>
  {/* ... more quick action cards */}
</div>

      {/* Top Vendors & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-heading text-[#0B2E2A] flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Vendors
            </h2>
            <Link to="/super-admin/vendors" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          {stats.topVendors.length === 0 ? (
            <p className="text-sm text-[#0B2E2A]/40 py-6 text-center">No vendors yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topVendors.map((vendor, i) => (
                <div key={vendor.id} className="flex items-center justify-between py-2 border-b border-[#0B2E2A]/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-[#F0F4F4] text-[#0B2E2A]/40'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-[#0B2E2A]">{vendor.business_name}</p>
                      <p className="text-xs text-[#0B2E2A]/50">{vendor.business_email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">GH₵{vendor.revenue?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-heading text-[#0B2E2A] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Orders
            </h2>
            <Link to="/super-admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-[#0B2E2A]/40 py-6 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#0B2E2A]/5 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-[#0B2E2A]">{order.product_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">GH₵{order.total_price?.toFixed(2) || '0.00'}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}