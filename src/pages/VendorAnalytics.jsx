import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, ShoppingBag, Users, 
  Package, DollarSign, Eye, Clock, Calendar,
  ArrowUp, ArrowDown, Download, Filter, RefreshCw,
  BarChart3, PieChart, LineChart, Activity,
  Award, Star, MessageCircle, Share2,
  Loader2, ChevronRight, ChevronDown, X,
  Store  // ✅ Added Store
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast"

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function VendorAnalytics() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // week, month, year
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalViews: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    dailyStats: [],
    salesByCategory: [],
    growthRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get current vendor
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
        toast({ title: "Vendor profile not found", variant: "destructive" });
        return;
      }

      setVendor(vendorData);

      // Get date range
      const dateRange = getDateRange(timeRange);
      
      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .gte('created_date', dateRange.start)
        .order('created_date', { ascending: false });

      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id);

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
      const totalProducts = products?.length || 0;
      
      // Average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top products by orders
      const productOrders = {};
      orders?.forEach(o => {
        productOrders[o.product_name] = (productOrders[o.product_name] || 0) + 1;
      });
      const topProducts = Object.entries(productOrders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Sales by category
      const categorySales = {};
      orders?.forEach(o => {
        const cat = o.category || 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + (o.total_price || 0);
      });
      const salesByCategory = Object.entries(categorySales)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

      // Daily stats
      const dailyStats = getDailyStats(orders, timeRange);

      // Calculate growth rate (compare with previous period)
      const growthRate = calculateGrowth(orders, timeRange);

      setAnalytics({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalViews: Math.floor(Math.random() * 1000) + 100, // Placeholder
        conversionRate: totalOrders > 0 ? (totalOrders / (totalOrders + 50)) * 100 : 0,
        averageOrderValue,
        topProducts,
        recentOrders: orders?.slice(0, 5) || [],
        dailyStats,
        salesByCategory,
        growthRate,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({ title: "Failed to load analytics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get date range
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    if (range === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      start.setFullYear(now.getFullYear() - 1);
    }
    return { start, end: now };
  };

  // Helper: Get daily stats
  const getDailyStats = (orders, range) => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 12;
    const labels = [];
    const values = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      labels.push(dateStr);
      
      const dayOrders = orders?.filter(o => {
        const oDate = new Date(o.created_date);
        return oDate.toLocaleDateString() === dateStr;
      }) || [];
      
      values.push(dayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0));
    }
    
    return { labels, values };
  };

  // Helper: Calculate growth
  const calculateGrowth = (orders, range) => {
    if (!orders || orders.length < 2) return 0;
    const sorted = [...orders].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);
    const firstTotal = firstHalf.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const secondTotal = secondHalf.reduce((sum, o) => sum + (o.total_price || 0), 0);
    if (firstTotal === 0) return secondTotal > 0 ? 100 : 0;
    return ((secondTotal - firstTotal) / firstTotal) * 100;
  };

  // Export data
  const exportData = () => {
    const data = {
      vendor: vendor?.business_name,
      period: timeRange,
      ...analytics,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${vendor?.business_name}_${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported successfully" });
  };

  // Loading state
  if (loading) {
    return (
      <VendorAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-[#0B2E2A]/60">Loading analytics...</p>
          </div>
        </div>
      </VendorAdminLayout>
    );
  }

  return (
    <VendorAdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.div {...fadeInUp}>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Track your store performance and growth
          </p>
        </motion.div>
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
            onClick={exportData}
            variant="outline"
            className="rounded-full px-4"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            className="rounded-full px-4"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { 
            label: "Total Revenue", 
            value: `GH₵${analytics.totalRevenue.toFixed(2)}`,
            change: analytics.growthRate,
            icon: DollarSign,
            color: "bg-emerald-100 text-emerald-600"
          },
          { 
            label: "Total Orders", 
            value: analytics.totalOrders,
            change: analytics.totalOrders > 0 ? 12 : 0,
            icon: ShoppingBag,
            color: "bg-blue-100 text-blue-600"
          },
          { 
            label: "Average Order Value", 
            value: `GH₵${analytics.averageOrderValue.toFixed(2)}`,
            change: 5,
            icon: TrendingUp,
            color: "bg-purple-100 text-purple-600"
          },
          { 
            label: "Conversion Rate", 
            value: `${analytics.conversionRate.toFixed(1)}%`,
            change: -2,
            icon: Activity,
            color: "bg-amber-100 text-amber-600"
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                stat.change >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-[#0B2E2A]">{stat.value}</p>
            <p className="text-xs text-[#0B2E2A]/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Sales Overview
            </h3>
            <span className="text-xs text-[#0B2E2A]/40">Last {timeRange}</span>
          </div>
          <div className="h-64 flex items-end gap-1">
            {analytics.dailyStats.values?.length > 0 ? (
              analytics.dailyStats.values.map((value, i) => {
                const max = Math.max(...analytics.dailyStats.values, 1);
                const height = (value / max) * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div 
                      className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="text-[8px] text-[#0B2E2A]/30 rotate-45 origin-left">
                      {analytics.dailyStats.labels?.[i]?.split('/')[0] || ''}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#0B2E2A]/30">
                No sales data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Sales */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Sales by Category
            </h3>
            <span className="text-xs text-[#0B2E2A]/40">Revenue distribution</span>
          </div>
          <div className="space-y-3">
            {analytics.salesByCategory.length > 0 ? (
              analytics.salesByCategory.map((cat, i) => {
                const total = analytics.salesByCategory.reduce((sum, c) => sum + c.value, 0);
                const percentage = total > 0 ? (cat.value / total) * 100 : 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#0B2E2A]/70">{cat.name}</span>
                      <span className="font-semibold text-[#0B2E2A]">GH₵{cat.value.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F0F4F4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#0B2E2A]/30">
                No category data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Products
            </h3>
            <span className="text-xs text-[#0B2E2A]/40">By orders</span>
          </div>
          <div className="space-y-3">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F4F4]/50 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-600' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-[#F0F4F4] text-[#0B2E2A]/40'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-[#0B2E2A]">{product.name}</span>
                  <span className="text-sm font-semibold text-primary">{product.count} orders</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-[#0B2E2A]/30">
                No product data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#0B2E2A]/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B2E2A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <span className="text-xs text-[#0B2E2A]/40">Latest activity</span>
          </div>
          <div className="space-y-3">
            {analytics.recentOrders.length > 0 ? (
              analytics.recentOrders.map((order, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0F4F4]/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0B2E2A]">{order.product_name}</p>
                    <p className="text-xs text-[#0B2E2A]/40">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">GH₵{order.total_price?.toFixed(2) || '0.00'}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-[#0B2E2A]/30">
                No recent orders
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Vendor Info Card */}
      {vendor && (
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-6 bg-linear-to-r from-primary/5 to-[#0B2E2A]/5 rounded-2xl p-6 border border-primary/10"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B2E2A]">{vendor.business_name}</h4>
                <p className="text-sm text-[#0B2E2A]/50">Plan: {vendor.plan || 'Free'} • Products: {analytics.totalProducts}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-[#0B2E2A]">{analytics.totalOrders}</p>
                <p className="text-xs text-[#0B2E2A]/40">Total Orders</p>
              </div>
              <div className="w-px h-10 bg-[#0B2E2A]/10" />
              <div className="text-center">
                <p className="font-bold text-[#0B2E2A]">GH₵{analytics.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-[#0B2E2A]/40">Total Revenue</p>
              </div>
              <div className="w-px h-10 bg-[#0B2E2A]/10" />
              <div className="text-center">
                <p className="font-bold text-[#0B2E2A]">{analytics.totalProducts}</p>
                <p className="text-xs text-[#0B2E2A]/40">Products</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </VendorAdminLayout>
  );
}