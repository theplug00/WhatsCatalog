import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Package, Loader2, Search, AlertCircle, 
  DollarSign, TrendingUp, Boxes, AlertTriangle, 
  CheckSquare, Eye, Copy, Check, Store,
  X, ChevronDown, ChevronUp, Upload, Image
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import ProductCard from "@/components/vendor/ProductCard";
import ProductForm from "@/components/vendor/ProductForm";
import VendorSummary from "@/components/vendor/VendorSummary";
import VendorProfile from "@/components/vendor/VendorProfile";
import BulkEditBar from "@/components/vendor/BulkEditBar";
import BulkEditModal from "@/components/vendor/BulkEditModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { getPlanLimits, isUnlimited } from "@/lib/vendorPlans";

const LOW_STOCK_THRESHOLD = 5;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function VendorAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [vendor, setVendor] = useState(null);
  const [vendorPlan, setVendorPlan] = useState("free");
  const [productCount, setProductCount] = useState(0);
  const [showStoreLink, setShowStoreLink] = useState(true);
  const [copied, setCopied] = useState(false);

  // ✅ Load vendor data
  useEffect(() => {
    const getVendorData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.error('Vendor not found:', vendorError);
          return;
        }

        setVendor(vendorData);
        setVendorId(vendorData.id);
        setVendorPlan(vendorData.plan || 'free');
      } catch (err) {
        console.error('Error getting vendor data:', err);
      }
    };

    getVendorData();
  }, []);

  // ✅ Load products
  const loadProducts = useCallback(async () => {
    if (!vendorId) return;
    
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProducts(data || []);
      setProductCount(data?.length || 0);
    } catch (err) {
      console.error('Error loading products:', err);
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorId) {
      loadProducts();
    }
  }, [loadProducts, vendorId]);

  // ✅ Check product limits
  const planLimits = getPlanLimits(vendorPlan);
  const maxProducts = planLimits?.products || 25;
  const unlimited = isUnlimited(vendorPlan, 'products');
  const canAddMore = unlimited || productCount < maxProducts;
  const remaining = unlimited ? '∞' : Math.max(0, maxProducts - productCount);

  // ✅ Save product
  const handleSave = async (data) => {
    try {
      const productData = { 
        ...data, 
        vendor_id: vendorId 
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock,
            status: productData.status,
            image_url: productData.image_url,
            gallery_images: productData.gallery_images || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "✅ Product updated",
          description: `${productData.name} has been updated.`,
          duration: 3000,
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock,
            status: productData.status,
            image_url: productData.image_url || "",
            gallery_images: productData.gallery_images || [],
            vendor_id: productData.vendor_id
          }]);

        if (error) throw error;
        
        toast({
          title: "🎉 Product added",
          description: `${productData.name} has been added to your catalog.`,
          duration: 3000,
        });
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError("Failed to save product. Please try again.");
      toast({
        title: "❌ Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // ✅ Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // ✅ Delete product
  const handleDelete = async (product) => {
    setDeletingId(product.id);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setConfirmDelete(null);
      toast({
        title: "🗑️ Product deleted",
        description: `${product.name} has been removed.`,
        duration: 3000,
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError("Failed to delete product.");
      toast({
        title: "❌ Error",
        description: "Failed to delete product.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Bulk update
  const handleBulkApply = async (updates) => {
    try {
      const ids = Array.from(selectedIds);
      
      for (const id of ids) {
        const { error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
      }

      await loadProducts();
      setShowBulkEdit(false);
      exitSelectMode();
      toast({
        title: "✅ Bulk update complete",
        description: `${ids.length} products updated successfully.`,
        duration: 3000,
      });
    } catch (err) {
      console.error('Bulk update error:', err);
      setError("Failed to bulk update products. Please try again.");
      setShowBulkEdit(false);
      toast({
        title: "❌ Error",
        description: "Failed to bulk update products.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // ✅ Selection handlers
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  // ✅ Copy store link
  const copyStoreLink = () => {
    const url = `${window.location.origin}/store/${vendor?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "📋 Copied!",
      description: "Store URL copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Filter products
  const lowStockProducts = products.filter((p) => (Number(p.stock) || 0) <= LOW_STOCK_THRESHOLD);
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !showLowStock || (Number(p.stock) || 0) <= LOW_STOCK_THRESHOLD;
    return matchesSearch && matchesLowStock;
  });

  // ✅ Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  return (
    <VendorAdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.div {...fadeInUp}>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Products
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Manage your catalog, prices, and inventory
          </p>
        </motion.div>
        <motion.div 
          {...fadeInUp}
          className="flex items-center gap-3 w-fit"
        >
          <Button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            variant={selectMode ? "default" : "outline"}
            className="rounded-full px-5 font-semibold transition-all"
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            {selectMode ? "Done" : "Select"}
          </Button>
          <Button
            onClick={() => {
              if (!canAddMore) {
                toast({
                  title: "⚠️ Product Limit Reached",
                  description: `You've reached your limit of ${maxProducts} products. Upgrade to add more.`,
                  variant: "destructive",
                  duration: 4000,
                });
                return;
              }
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold glow-pulse transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {canAddMore ? "Add Product" : "Limit Reached"}
          </Button>
        </motion.div>
      </div>

      {/* Store Link Banner */}
      {vendor?.is_approved && vendor?.slug && showStoreLink && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-linear-to-r from-primary/10 to-[#0B2E2A]/5 rounded-xl border border-primary/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-[#0B2E2A]">Your Store is Live! 🎉</p>
                <p className="text-xs text-[#0B2E2A]/50">Share this link with your customers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/50 rounded-lg px-3 py-1.5 border border-[#0B2E2A]/10">
                <span className="text-xs text-[#0B2E2A]/60 truncate max-w-37.5 sm:max-w-62.5">
                  {window.location.origin}/store/{vendor.slug}
                </span>
              </div>
              <button
                onClick={copyStoreLink}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                title="Copy store link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowStoreLink(false)}
                className="p-1 rounded-lg text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Limit Banner */}
      {!unlimited && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-xl border ${
            productCount >= maxProducts 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-primary/5 border-primary/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0B2E2A]">
                Products: <span className="font-bold">{productCount}</span> / {maxProducts}
              </p>
              <div className="w-full max-w-xs h-1.5 bg-[#0B2E2A]/10 rounded-full mt-1">
                <motion.div 
                  className={`h-1.5 rounded-full transition-all ${
                    productCount >= maxProducts ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((productCount / maxProducts) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            {productCount >= maxProducts && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
                onClick={() => window.location.href = '/vendor/admin/subscription'}
              >
                Upgrade Plan
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Vendor Profile */}
      <VendorProfile />

      {/* Summary */}
      {!loading && <VendorSummary products={products} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, color: "primary" },
          { label: "Active", value: activeProducts, icon: TrendingUp, color: "primary" },
          { label: "In Stock", value: totalStock, icon: Boxes, color: "primary" },
          { label: "Inventory Value", value: `GH₵${totalValue.toFixed(0)}`, icon: DollarSign, color: "primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0B2E2A]">{stat.value}</p>
            <p className="text-xs text-[#0B2E2A]/50 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="rounded-full pl-10 transition-all focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {lowStockProducts.length > 0 && (
          <button
            onClick={() => setShowLowStock((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              showLowStock
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                : "glass-card text-amber-600 hover:bg-amber-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {showLowStock ? "Showing" : "Low Stock"}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${showLowStock ? "bg-white/20" : "bg-amber-100"}`}>
              {lowStockProducts.length}
            </span>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {search ? <Search className="w-10 h-10 text-primary" /> : <Package className="w-10 h-10 text-primary" />}
          </div>
          <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">
            {search ? "No products found" : "No products yet"}
          </h3>
          <p className="text-sm text-[#0B2E2A]/50 mb-6 max-w-sm">
            {search
              ? "Try a different search term."
              : "Add your first product to start selling on WhatsApp."}
          </p>
          {!search && canAddMore && (
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Your First Product
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <ProductCard
                  product={product}
                  onEdit={handleEdit}
                  onDelete={(p) => setConfirmDelete(p)}
                  selectMode={selectMode}
                  isSelected={selectedIds.has(product.id)}
                  onToggleSelect={toggleSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            initialData={editingProduct}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">Delete product?</h3>
              <p className="text-sm text-[#0B2E2A]/50 mb-6">
                "{confirmDelete.name}" will be permanently removed from your catalog.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl"
                  disabled={deletingId === confirmDelete.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                  disabled={deletingId === confirmDelete.id}
                >
                  {deletingId === confirmDelete.id ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : null}
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Bar */}
      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <BulkEditBar
            selectedCount={selectedIds.size}
            onEdit={() => setShowBulkEdit(true)}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {showBulkEdit && (
          <BulkEditModal
            selectedCount={selectedIds.size}
            onApply={handleBulkApply}
            onClose={() => setShowBulkEdit(false)}
          />
        )}
      </AnimatePresence>
    </VendorAdminLayout>
  );
}