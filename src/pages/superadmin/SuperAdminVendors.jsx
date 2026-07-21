import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle, XCircle, Ban, Eye, X, 
  Phone, Mail, MapPin, MessageCircle, CreditCard, 
  TrendingUp, Store, Users, Clock, ChevronRight,
  Loader2, Shield, UserCheck, UserX, AlertTriangle,
  Copy, Check, ExternalLink, Package
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// ✅ Status styles
const STATUS_STYLES = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Rejected" },
  suspended: { bg: "bg-slate-200", text: "text-slate-700", dot: "bg-slate-500", label: "Suspended" },
};

// ✅ Plans configuration
const PLANS = [
  { id: "free", label: "Starter", productLimit: 25, price: "Free", color: "bg-slate-100 text-slate-700" },
  { id: "basic", label: "Growth", productLimit: 100, price: "GH₵29/mo", color: "bg-blue-100 text-blue-700" },
  { id: "pro", label: "Pro", productLimit: -1, price: "GH₵79/mo", color: "bg-purple-100 text-purple-700" },
  { id: "enterprise", label: "Enterprise", productLimit: -1, price: "GH₵199/mo", color: "bg-emerald-100 text-emerald-700" },
];

// ✅ Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function SuperAdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [impersonating, setImpersonating] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // ✅ Load vendors
  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorError) throw vendorError;

      // Get product counts
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, vendor_id');

      if (productError) throw productError;

      // Count products per vendor
      const productCounts = {};
      productData?.forEach(p => {
        productCounts[p.vendor_id] = (productCounts[p.vendor_id] || 0) + 1;
      });

      // Combine data
      const vendorsWithCounts = vendorData?.map(v => ({
        ...v,
        productCount: productCounts[v.id] || 0
      })) || [];

      setVendors(vendorsWithCounts);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  // ✅ Update vendor plan
  const updateVendorPlan = async (vendorId, plan) => {
    setUpdating(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ plan })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: "Plan updated",
        description: `Vendor plan changed to ${PLANS.find(p => p.id === plan)?.label}`,
        duration: 3000,
      });

      await loadVendors();
      if (selected?.id === vendorId) {
        setSelected(prev => ({ ...prev, plan }));
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      toast({
        title: "Error",
        description: "Failed to update vendor plan",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Update vendor status
  const updateStatus = async (vendor, status) => {
    setUpdating(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', vendor.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `${vendor.business_name} is now ${status}`,
        duration: 3000,
      });

      await loadVendors();
      if (selected?.id === vendor.id) {
        setSelected(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Vendor impersonation
  const impersonateVendor = async (vendorId) => {
    try {
      setImpersonating(true);
      
      // Store impersonation state
      sessionStorage.setItem('impersonating', 'true');
      sessionStorage.setItem('impersonatedVendorId', vendorId);
      
      const vendor = vendors.find(v => v.id === vendorId);
      
      toast({
        title: "Impersonating vendor",
        description: `You are now viewing as ${vendor?.business_name}`,
        duration: 3000,
      });

      // Redirect to vendor dashboard
      window.location.href = '/vendor/admin';
    } catch (error) {
      console.error('Impersonation error:', error);
      toast({
        title: "Error",
        description: "Unable to impersonate vendor",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setImpersonating(false);
    }
  };

  // ✅ Get plan info
  const getPlanInfo = (planId) => {
    const plan = PLANS.find(p => p.id === planId) || PLANS[0];
    const limit = plan.productLimit === -1 ? '∞' : plan.productLimit;
    return { ...plan, limitDisplay: limit };
  };

  // ✅ Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return '—';
    }
  };

  // ✅ Copy store link
  const copyStoreLink = (slug) => {
    if (!slug) return;
    const url = `${window.location.origin}/store/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Store URL copied to clipboard",
      duration: 2000,
    });
  };

  // ✅ Get status display
  const getStatusDisplay = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return {
      ...style,
      label: style.label || status || 'Pending'
    };
  };

  // ✅ Filter vendors
  const filtered = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      v.business_name?.toLowerCase().includes(q) ||
      v.business_email?.toLowerCase().includes(q) ||
      v.owner_name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ✅ Stats
  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => v.status === 'pending').length,
    active: vendors.filter(v => v.status === 'active' || v.status === 'approved').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
    products: vendors.reduce((sum, v) => sum + (v.productCount || 0), 0),
  };

  // ✅ Loading state
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
        <motion.div {...fadeInUp}>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Vendors
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Review, approve, and manage vendor accounts
          </p>
        </motion.div>
        <Button
          onClick={loadVendors}
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Stats Overview */}
      {showStats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          {[
            { label: "Total Vendors", value: stats.total, icon: Store, color: "text-primary" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500" },
            { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-500" },
            { label: "Suspended", value: stats.suspended, icon: Ban, color: "text-red-500" },
            { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 border border-[#0B2E2A]/5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[#0B2E2A]">{stat.value}</p>
                  <p className="text-xs text-[#0B2E2A]/50">{stat.label}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color} opacity-50`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-sm font-semibold hover:underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or owner..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "active", "approved", "rejected", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-11 rounded-xl text-sm font-semibold capitalize transition-all ${
                filterStatus === s
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30"
              }`}
            >
              {s}
              {s !== "all" && (
                <span className="ml-1 text-xs opacity-60">
                  ({vendors.filter(v => v.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="bg-white rounded-2xl shadow-sm border border-[#0B2E2A]/5 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4F4]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Business</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Products</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#0B2E2A]/60 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((v, index) => {
                  const planInfo = getPlanInfo(v.plan || "free");
                  const statusDisplay = getStatusDisplay(v.status);
                  const isAtLimit = planInfo.productLimit !== -1 && v.productCount >= planInfo.productLimit;
                  
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-t border-[#0B2E2A]/5 hover:bg-[#F0F4F4]/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {v.business_name?.charAt(0)?.toUpperCase() || 'V'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#0B2E2A]">{v.business_name}</p>
                            <p className="text-xs text-[#0B2E2A]/50">{v.business_email}</p>
                            {v.slug && (
                              <button
                                onClick={() => copyStoreLink(v.slug)}
                                className="text-xs text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <Copy className="w-3 h-3" />
                                View Store
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${planInfo.color}`}>
                            {planInfo.label}
                          </span>
                          <span className="text-xs text-[#0B2E2A]/40 mt-1">{planInfo.price}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#0B2E2A]">{v.productCount || 0}</span>
                          <span className="text-xs text-[#0B2E2A]/40">
                            Limit: {planInfo.limitDisplay}
                            {isAtLimit && (
                              <span className="ml-1 text-amber-500">⚠️</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusDisplay.bg} ${statusDisplay.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dot}`} />
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelected(v)}
                            className="w-8 h-8 rounded-lg bg-[#F0F4F4] flex items-center justify-center text-[#0B2E2A]/60 hover:bg-primary/10 hover:text-primary transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(v.status === "pending" || v.status === "suspended") && (
                            <button
                              disabled={updating}
                              onClick={() => updateStatus(v, "active")}
                              className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {v.status !== "rejected" && v.status !== "suspended" && v.status !== "pending" && (
                            <button
                              disabled={updating}
                              onClick={() => updateStatus(v, "suspended")}
                              className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-600 hover:text-white transition-colors disabled:opacity-50"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {(v.status === "active" || v.status === "approved") && (
                            <button
                              disabled={impersonating}
                              onClick={() => impersonateVendor(v.id)}
                              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                              title="Login as vendor"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-sm text-[#0B2E2A]/40">No vendors found</p>
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="text-xs text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-[#0B2E2A]/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading text-[#0B2E2A]">Vendor Details</h2>
                <button 
                  onClick={() => setSelected(null)} 
                  className="w-8 h-8 rounded-full hover:bg-[#F0F4F4] flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-[#0B2E2A]/40 hover:text-[#0B2E2A]" />
                </button>
              </div>

              {/* Vendor Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {selected.business_name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B2E2A]">{selected.business_name}</h3>
                    <p className="text-sm text-[#0B2E2A]/50">{selected.business_email}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusDisplay(selected.status).bg} ${getStatusDisplay(selected.status).text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDisplay(selected.status).dot}`} />
                    {getStatusDisplay(selected.status).label}
                  </span>
                  {selected.is_approved && (
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                      ✅ Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-[#0B2E2A]/10">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#0B2E2A]/40" />
                    {selected.business_email || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#0B2E2A]/40" />
                    {selected.business_phone || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#0B2E2A]/40" />
                    {selected.business_address || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    {selected.whatsapp_number || selected.business_phone || '—'}
                  </div>
                </div>

                {/* Plan Management */}
                <div className="pt-4 border-t border-[#0B2E2A]/10">
                  <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Plan & Limits
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#0B2E2A]/60">Current Plan</span>
                      <select
                        value={selected.plan || "free"}
                        onChange={(e) => updateVendorPlan(selected.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[#0B2E2A]/10 text-sm font-semibold bg-white focus:ring-2 focus:ring-primary/30 transition-all"
                        disabled={updating}
                      >
                        {PLANS.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label} ({plan.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#0B2E2A]/60">Products Used</span>
                      <span className="text-sm font-semibold text-[#0B2E2A]">
                        {selected.productCount || 0}
                        {getPlanInfo(selected.plan || "free").productLimit !== -1 && (
                          <span className="text-xs text-[#0B2E2A]/40 ml-1">
                            / {getPlanInfo(selected.plan || "free").limitDisplay}
                          </span>
                        )}
                      </span>
                    </div>
                    {getPlanInfo(selected.plan || "free").productLimit !== -1 && (
                      <div className="w-full h-2 bg-[#0B2E2A]/10 rounded-full">
                        <motion.div 
                          className={`h-2 rounded-full transition-all ${
                            (selected.productCount || 0) >= getPlanInfo(selected.plan || "free").productLimit 
                              ? 'bg-amber-500' 
                              : 'bg-primary'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((selected.productCount || 0) / getPlanInfo(selected.plan || "free").productLimit) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#0B2E2A]/10 space-y-2">
                  {(selected.status === "active" || selected.status === "approved") && (
                    <button
                      onClick={() => impersonateVendor(selected.id)}
                      disabled={impersonating}
                      className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {impersonating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Login as Vendor
                    </button>
                  )}
                  
                  {selected.slug && (
                    <button
                      onClick={() => {
                        window.open(`/store/${selected.slug}`, '_blank');
                      }}
                      className="w-full h-10 rounded-xl border border-[#0B2E2A]/10 text-[#0B2E2A] text-sm font-semibold hover:bg-[#F0F4F4] transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Store
                    </button>
                  )}

                  <div className="flex gap-2">
                    {selected.status !== "active" && selected.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(selected, "active")}
                        disabled={updating}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    {selected.status !== "suspended" && selected.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(selected, "suspended")}
                        disabled={updating}
                        className="flex-1 h-10 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Suspend
                      </button>
                    )}
                    {selected.status !== "rejected" && selected.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(selected, "rejected")}
                        disabled={updating}
                        className="flex-1 h-10 rounded-xl bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t border-[#0B2E2A]/10 space-y-1 text-xs text-[#0B2E2A]/40">
                  <p>Created: {formatDate(selected.created_at)}</p>
                  {selected.updated_at && selected.updated_at !== selected.created_at && (
                    <p>Updated: {formatDate(selected.updated_at)}</p>
                  )}
                  {selected.approved_at && <p>Approved: {formatDate(selected.approved_at)}</p>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}