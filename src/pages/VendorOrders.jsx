import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Search, Filter, Loader2, 
  CheckCircle, XCircle, Clock, Eye, 
  Truck, Smartphone, Banknote, AlertCircle,
  ChevronDown, ChevronUp, Calendar, Download,
  MessageCircle, Phone, MapPin, User, DollarSign,
  Check, X, RefreshCw, Package, Send,
  Printer, FileText, MoreVertical, Edit
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// ============================================
// STATUS CONFIGURATION
// ============================================
const ORDER_STATUS = {
  new: { 
    label: "New", 
    bg: "bg-blue-100", 
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: Clock,
    nextActions: ['confirm', 'reject']
  },
  confirmed: { 
    label: "Confirmed", 
    bg: "bg-amber-100", 
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: CheckCircle,
    nextActions: ['processing', 'reject']
  },
  processing: { 
    label: "Processing", 
    bg: "bg-purple-100", 
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
    icon: Package,
    nextActions: ['shipped']
  },
  shipped: { 
    label: "Shipped", 
    bg: "bg-cyan-100", 
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
    icon: Truck,
    nextActions: ['delivered']
  },
  delivered: { 
    label: "Delivered", 
    bg: "bg-emerald-100", 
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
    nextActions: []
  },
  rejected: { 
    label: "Rejected", 
    bg: "bg-red-100", 
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: XCircle,
    nextActions: []
  },
  cancelled: { 
    label: "Cancelled", 
    bg: "bg-gray-100", 
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-500",
    icon: XCircle,
    nextActions: []
  },
};

const PAYMENT_STATUS = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOrderId, setRejectOrderId] = useState(null);

  // Load orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please login", variant: "destructive" });
        return;
      }

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!vendor) {
        toast({ title: "Vendor not found", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({ title: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_date: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      const statusLabel = ORDER_STATUS[newStatus]?.label || newStatus;
      toast({
        title: "Order updated",
        description: `Order status changed to ${statusLabel}`,
        duration: 3000,
      });

      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ 
        title: "Failed to update order", 
        variant: "destructive" 
      });
    } finally {
      setProcessing(false);
    }
  };

  // Approve order
  const approveOrder = async (orderId) => {
    await updateOrderStatus(orderId, 'confirmed');
  };

  // Reject order with reason
  const rejectOrder = async (orderId) => {
    if (!rejectReason.trim()) {
      toast({ title: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'rejected',
          notes: rejectReason,
          updated_date: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order rejected",
        description: "Order has been rejected with reason provided.",
        duration: 3000,
      });

      await loadOrders();
      setSelectedOrder(null);
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({ 
        title: "Failed to reject order", 
        variant: "destructive" 
      });
    } finally {
      setProcessing(false);
    }
  };

  // Send WhatsApp message to customer
  const sendWhatsAppMessage = (order, status) => {
    const message = 
      `📦 *Order Update*%0A%0A` +
      `Order #${order.id.substring(0, 8)}%0A` +
      `Status: ${ORDER_STATUS[status]?.label || status}%0A` +
      `Product: ${order.product_name}%0A` +
      `Total: GH₵${order.total_price.toFixed(2)}%0A%0A` +
      `Thank you for shopping with us!`;

    window.open(`https://wa.me/${order.customer_phone}?text=${message}`, '_blank');
  };

  // Get counts
  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
  };

  // Filter orders
  const filtered = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone?.includes(search);
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status tabs
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'new', label: 'New', count: counts.new },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'processing', label: 'Processing', count: counts.processing },
    { id: 'shipped', label: 'Shipped', count: counts.shipped },
    { id: 'delivered', label: 'Delivered', count: counts.delivered },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Orders
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button
          onClick={loadOrders}
          variant="outline"
          className="rounded-full"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "New Orders", value: counts.new, color: "text-blue-500" },
          { label: "Confirmed", value: counts.confirmed, color: "text-amber-500" },
          { label: "Processing", value: counts.processing, color: "text-purple-500" },
          { label: "Delivered", value: counts.delivered, color: "text-emerald-500" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-[#0B2E2A]/5 shadow-sm"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#0B2E2A]/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filterStatus === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 text-xs ${
                filterStatus === tab.id ? 'text-white/70' : 'text-[#0B2E2A]/40'
              }`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, product, or phone..."
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#0B2E2A]/5">
          <ShoppingBag className="w-16 h-16 text-[#0B2E2A]/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#0B2E2A]">No orders found</h3>
          <p className="text-[#0B2E2A]/40">
            {search ? "Try a different search term" : "Orders will appear here once customers start ordering"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = ORDER_STATUS[order.status] || ORDER_STATUS.new;
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-5 shadow-sm border ${status.border} hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-[#0B2E2A]">{order.product_name}</h3>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#0B2E2A]/60">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {order.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {order.customer_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-primary">
                        <DollarSign className="w-3.5 h-3.5" />
                        GH₵{order.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {status.nextActions?.includes('confirm') && (
                      <Button
                        onClick={() => approveOrder(order.id)}
                        disabled={processing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm h-9 px-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {status.nextActions?.includes('reject') && (
                      <Button
                        onClick={() => {
                          setRejectOrderId(order.id);
                          setShowRejectModal(true);
                        }}
                        disabled={processing}
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl text-sm h-9 px-4"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    {status.nextActions?.includes('processing') && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={processing}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm h-9 px-4"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Process
                      </Button>
                    )}
                    {status.nextActions?.includes('shipped') && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        disabled={processing}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm h-9 px-4"
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Ship
                      </Button>
                    )}
                    {status.nextActions?.includes('delivered') && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={processing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm h-9 px-4"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Deliver
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      className="rounded-xl text-sm h-9 px-4"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => sendWhatsAppMessage(order, order.status)}
                      variant="outline"
                      className="rounded-xl text-sm h-9 px-4 text-[#25D366] border-[#25D366]/30"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ============================================ */}
      {/* ORDER DETAIL MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0B2E2A]/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#0B2E2A]">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#F0F4F4] rounded-full">
                  <X className="w-5 h-5 text-[#0B2E2A]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F0F4F4] rounded-xl">
                    <p className="text-xs text-[#0B2E2A]/40">Customer</p>
                    <p className="font-semibold text-[#0B2E2A]">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="p-3 bg-[#F0F4F4] rounded-xl">
                    <p className="text-xs text-[#0B2E2A]/40">Total</p>
                    <p className="font-bold text-primary text-lg">GH₵{selectedOrder.total_price.toFixed(2)}</p>
                    <p className="text-xs text-[#0B2E2A]/50">Qty: {selectedOrder.quantity}</p>
                  </div>
                </div>

                {/* Product */}
                <div className="p-3 bg-[#F0F4F4] rounded-xl">
                  <p className="text-xs text-[#0B2E2A]/40">Product</p>
                  <p className="font-semibold text-[#0B2E2A]">{selectedOrder.product_name}</p>
                </div>

                {/* Address */}
                <div className="p-3 bg-[#F0F4F4] rounded-xl">
                  <p className="text-xs text-[#0B2E2A]/40">Delivery Address</p>
                  <p className="text-sm text-[#0B2E2A]">{selectedOrder.delivery_address || "Not specified"}</p>
                </div>

                {/* Status Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F0F4F4] rounded-xl">
                    <p className="text-xs text-[#0B2E2A]/40">Order Status</p>
                    <p className={`font-semibold ${ORDER_STATUS[selectedOrder.status]?.text || 'text-[#0B2E2A]'}`}>
                      {ORDER_STATUS[selectedOrder.status]?.label || selectedOrder.status}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F0F4F4] rounded-xl">
                    <p className="text-xs text-[#0B2E2A]/40">Order ID</p>
                    <p className="font-mono text-xs text-[#0B2E2A]/60">{selectedOrder.id.substring(0, 12)}</p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="p-3 bg-[#F0F4F4] rounded-xl">
                    <p className="text-xs text-[#0B2E2A]/40">Notes</p>
                    <p className="text-sm text-[#0B2E2A]">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    onClick={() => sendWhatsAppMessage(selectedOrder, selectedOrder.status)}
                    className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xl"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Chat Customer
                  </Button>
                  <Button
                    onClick={() => {
                      const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];
                      const currentIndex = statuses.indexOf(selectedOrder.status);
                      const nextStatus = statuses[currentIndex + 1];
                      if (nextStatus) {
                        updateOrderStatus(selectedOrder.id, nextStatus);
                      } else {
                        toast({ title: "Order already completed" });
                      }
                    }}
                    className={`flex-1 rounded-xl ${
                      selectedOrder.status === 'delivered' 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                    disabled={selectedOrder.status === 'delivered'}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Next Step
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* REJECT MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0B2E2A]/40 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-[#0B2E2A]">Reject Order</h2>
              </div>

              <p className="text-sm text-[#0B2E2A]/60 mb-4">
                Please provide a reason for rejecting this order.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full px-4 py-3 rounded-xl border border-[#0B2E2A]/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-25"
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => rejectOrder(rejectOrderId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                  disabled={!rejectReason.trim() || processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject Order"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </VendorAdminLayout>
  );
}