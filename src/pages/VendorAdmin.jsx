import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Package, Users, DollarSign, 
  TrendingUp, TrendingDown, Eye, Clock, 
  CheckCircle, XCircle, AlertCircle, 
  ArrowUp, ArrowDown, Calendar, Download,
  RefreshCw, Filter, Search, Plus,
  Star, Award, Truck, CreditCard,
  MessageCircle, Phone, MapPin, User,
  BarChart3, PieChart, LineChart,
  Loader2, ChevronRight, ChevronDown,
  Activity  // ✅ Added
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ icon: Icon, label, value, change, color, subtitle, delay }) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-[#0B2E2A] mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#0B2E2A]/40 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${
            isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-[#0B2E2A]/40">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================
function ActivityItem({ activity }) {
  const icons = {
    order: ShoppingBag,
    product: Package,
    customer: User,
    review: Star,
    payment: CreditCard,
  };
  const Icon = icons[activity.type] || ShoppingBag;
  
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#0B2E2A]/5 last:border-0">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0B2E2A]">{activity.title}</p>
        <p className="text-xs text-[#0B2E2A]/50">{activity.time}</p>
      </div>
      {activity.status && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          activity.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
          activity.status === 'pending' ? 'bg-amber-100 text-amber-600' :
          'bg-red-100 text-red-600'
        }`}>
          {activity.status}
        </span>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    growthRate: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please login", variant: "destructive" });
        return;
      }

      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!vendorData) {
        toast({ title: "Vendor not found", variant: "destructive" });
        return;
      }
      setVendor(vendorData);

      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id);

      setProducts(productData || []);

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_date', { ascending: false });

      setOrders(orderData || []);

      const totalRevenue = orderData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
      const totalOrders = orderData?.length || 0;
      const totalProducts = productData?.length || 0;
      const pendingOrders = orderData?.filter(o => o.status === 'new' || o.status === 'confirmed').length || 0;
      const lowStockItems = productData?.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalCustomers = new Set(orderData?.map(o => o.customer_phone)).size || 0;

      const activities = [];
      
      orderData?.slice(0, 3).forEach(o => {
        activities.push({
          type: 'order',
          title: `New order from ${o.customer_name}`,
          time: new Date(o.created_date).toLocaleDateString(),
          status: 'pending'
        });
      });

      productData?.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).slice(0, 2).forEach(p => {
        activities.push({
          type: 'product',
          title: `Low stock: ${p.name} (${p.stock} left)`,
          time: 'Just now',
          status: 'pending'
        });
      });

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        conversionRate: totalOrders > 0 ? (totalOrders / (totalOrders + 50)) * 100 : 0,
        averageOrderValue,
        growthRate: 12,
        pendingOrders,
        lowStockItems,
      });

      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({ title: "Failed to load dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VendorAdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </VendorAdminLayout>
    );
  }

  return (
    <VendorAdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Welcome back, {vendor?.business_name || 'Vendor'}! Here's your store overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-white rounded-xl border border-[#0B2E2A]/10">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  timeRange === range
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-[#0B2E2A]/60 hover:text-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            onClick={loadDashboardData}
            variant="outline"
            className="rounded-full px-4"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`GH₵${stats.totalRevenue.toFixed(2)}`}
          change={stats.growthRate}
          color="bg-emerald-100 text-emerald-600"
          delay={0}
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={stats.totalOrders}
          change={8}
          color="bg-blue-100 text-blue-600"
          delay={0.05}
          subtitle={`${stats.pendingOrders} pending`}
        />
        <StatCard
          icon={Package}
          label="Products"
          value={stats.totalProducts}
          change={-2}
          color="bg-purple-100 text-purple-600"
          delay={0.1}
          subtitle={`${stats.lowStockItems} low stock`}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.totalCustomers}
          change={15}
          color="bg-amber-100 text-amber-600"
          delay={0.15}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Avg Order Value", value: `GH₵${stats.averageOrderValue.toFixed(2)}`, icon: TrendingUp },
          { label: "Conversion Rate", value: `${stats.conversionRate.toFixed(1)}%`, icon: BarChart3 },
          { label: "Pending Orders", value: stats.pendingOrders, icon: Clock },
          { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertCircle },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="bg-white/50 rounded-xl p-3 border border-[#0B2E2A]/5 text-center"
          >
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-[#0B2E2A]">{stat.value}</p>
            <p className="text-xs text-[#0B2E2A]/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <Button
              variant="ghost"
              className="text-sm text-primary hover:text-primary/80"
              onClick={() => window.location.href = '/vendor/admin/orders'}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F0F4F4]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0B2E2A]">{order.product_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{order.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">GH₵{order.total_price?.toFixed(2) || '0.00'}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {order.status || 'pending'}
                  </span>
                </div>
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8 text-[#0B2E2A]/30">
                No orders yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, i) => (
                <ActivityItem key={i} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 text-[#0B2E2A]/30">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { label: "Add Product", icon: Plus, href: "#", color: "bg-primary text-white" },
          { label: "View Orders", icon: ShoppingBag, href: "/vendor/admin/orders", color: "bg-blue-500 text-white" },
          { label: "View Analytics", icon: BarChart3, href: "/vendor/admin/analytics", color: "bg-purple-500 text-white" },
          { label: "Manage Profile", icon: User, href: "/vendor/admin/profile", color: "bg-amber-500 text-white" },
        ].map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => window.location.href = action.href}
            className={`${action.color} rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs font-semibold">{action.label}</p>
          </motion.button>
        ))}
      </div>
    </VendorAdminLayout>
  );
}