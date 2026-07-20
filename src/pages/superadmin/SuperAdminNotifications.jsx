import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Users, ShoppingBag, CreditCard, AlertTriangle, 
  CheckCircle, XCircle, Clock, Store, Package, Eye,
  Loader2, Check, X, ChevronRight
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NOTIFICATION_TYPES = {
  vendor_registered: { 
    icon: Users, 
    color: "text-blue-500", 
    bg: "bg-blue-50",
    label: "New Vendor" 
  },
  vendor_approved: { 
    icon: CheckCircle, 
    color: "text-emerald-500", 
    bg: "bg-emerald-50",
    label: "Vendor Approved" 
  },
  vendor_rejected: { 
    icon: XCircle, 
    color: "text-red-500", 
    bg: "bg-red-50",
    label: "Vendor Rejected" 
  },
  new_order: { 
    icon: ShoppingBag, 
    color: "text-primary", 
    bg: "bg-primary/10",
    label: "New Order" 
  },
  subscription_expiring: { 
    icon: Clock, 
    color: "text-amber-500", 
    bg: "bg-amber-50",
    label: "Subscription Expiring" 
  },
  subscription_expired: { 
    icon: AlertTriangle, 
    color: "text-red-500", 
    bg: "bg-red-50",
    label: "Subscription Expired" 
  },
  low_stock: { 
    icon: Package, 
    color: "text-amber-500", 
    bg: "bg-amber-50",
    label: "Low Stock Alert" 
  },
};

export default function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch from a notifications table
      // For now, let's generate notifications from existing data
      const notifications = await generateNotifications();
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = async () => {
    const notifications = [];

    // 1. Get pending vendors
    const { data: pendingVendors } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    pendingVendors?.forEach(v => {
      notifications.push({
        id: `vendor_${v.id}`,
        type: 'vendor_registered',
        title: `New vendor registration`,
        description: `${v.business_name} is awaiting approval`,
        time: v.created_at,
        read: false,
        data: { vendorId: v.id, vendorName: v.business_name },
        action: { label: 'Review', link: `/super-admin/vendors` }
      });
    });

    // 2. Get expiring subscriptions (7 days before end)
    const { data: expiringVendors } = await supabase
      .from('vendors')
      .select('*')
      .not('subscription_end', 'is', null)
      .eq('status', 'active');

    expiringVendors?.forEach(v => {
      const endDate = new Date(v.subscription_end);
      const daysUntil = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= 7) {
        notifications.push({
          id: `sub_${v.id}`,
          type: 'subscription_expiring',
          title: `Subscription expiring soon`,
          description: `${v.business_name}'s plan expires in ${daysUntil} days`,
          time: v.subscription_end,
          read: false,
          data: { vendorId: v.id, vendorName: v.business_name, daysUntil },
          action: { label: 'Renew', link: `/super-admin/subscriptions` }
        });
      } else if (daysUntil < 0) {
        notifications.push({
          id: `sub_exp_${v.id}`,
          type: 'subscription_expired',
          title: `Subscription expired`,
          description: `${v.business_name}'s plan has expired`,
          time: v.subscription_end,
          read: false,
          data: { vendorId: v.id, vendorName: v.business_name },
          action: { label: 'Review', link: `/super-admin/subscriptions` }
        });
      }
    });

    // 3. Get recent orders (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_date', yesterday.toISOString())
      .order('created_date', { ascending: false })
      .limit(10);

    recentOrders?.forEach(o => {
      notifications.push({
        id: `order_${o.id}`,
        type: 'new_order',
        title: `New order placed`,
        description: `${o.customer_name} ordered ${o.product_name}`,
        time: o.created_date,
        read: false,
        data: { orderId: o.id, customer: o.customer_name },
        action: { label: 'View', link: `/super-admin/orders` }
      });
    });

    // 4. Check low stock products
    const { data: products } = await supabase
      .from('products')
      .select('*, vendors(business_name)')
      .lt('stock', 5)
      .gt('stock', 0)
      .limit(5);

    products?.forEach(p => {
      notifications.push({
        id: `stock_${p.id}`,
        type: 'low_stock',
        title: `Low stock alert`,
        description: `${p.name} has only ${p.stock} items left (${p.vendors?.business_name})`,
        time: p.updated_at,
        read: false,
        data: { productId: p.id, productName: p.name, stock: p.stock },
        action: { label: 'View', link: `/super-admin/vendors` }
      });
    });

    // Sort by time (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    return notifications;
  };

  const markAsRead = async (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setTimeout(() => setMarkingAll(false), 500);
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getFilters = () => {
    const filters = [
      { value: 'all', label: 'All', count: notifications.length },
      { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    ];
    // Add type filters
    const types = [...new Set(notifications.map(n => n.type))];
    types.forEach(type => {
      const label = NOTIFICATION_TYPES[type]?.label || type;
      filters.push({ 
        value: type, 
        label, 
        count: notifications.filter(n => n.type === type).length 
      });
    });
    return filters;
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-semibold bg-primary text-white px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Stay updated on platform activity
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={markingAll}
              variant="outline"
              className="rounded-full px-4"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {getFilters().map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`ml-1.5 text-xs ${
                filter === f.value ? 'text-white/70' : 'text-[#0B2E2A]/40'
              }`}>
                ({f.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#0B2E2A]/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2E2A] mb-2">No notifications</h3>
          <p className="text-sm text-[#0B2E2A]/50">
            {filter === 'all' 
              ? "You're all caught up!" 
              : filter === 'unread' 
              ? "You have no unread notifications" 
              : `No ${NOTIFICATION_TYPES[filter]?.label?.toLowerCase() || filter} notifications`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((notification, index) => {
              const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.vendor_registered;
              const Icon = type.icon || Bell;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                    notification.read 
                      ? 'border-[#0B2E2A]/5' 
                      : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${type.bg}`}>
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#0B2E2A] text-sm">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            <span className="text-xs text-[#0B2E2A]/40 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.time)}
                            </span>
                          </div>
                          <p className="text-sm text-[#0B2E2A]/60 mt-1">
                            {notification.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {notification.action && (
                            <Link
                              to={notification.action.link}
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                            >
                              {notification.action.label}
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-[#F0F4F4] transition-colors text-[#0B2E2A]/40 hover:text-[#0B2E2A]"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[#0B2E2A]/40 hover:text-red-500"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Helper function to format time
function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000 / 60; // minutes
  
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}