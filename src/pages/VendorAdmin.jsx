import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Package, Loader2, Search, AlertCircle, DollarSign, TrendingUp, Boxes, AlertTriangle, CheckSquare } from "lucide-react";
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
  const [user, setUser] = useState(null);

  // ✅ Get current user and vendor ID
  useEffect(() => {
    const getVendorData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          console.error('No user found');
          return;
        }
        setUser(user);

        // Get vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id, business_name')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.error('Vendor not found:', vendorError);
          return;
        }

        if (vendorData) {
          setVendorId(vendorData.id);
          
          // ✅ Backfill: Update products that don't have vendor_id
          const { data: untaggedProducts, error: untaggedError } = await supabase
            .from('products')
            .select('id')
            .is('vendor_id', null);

          if (!untaggedError && untaggedProducts && untaggedProducts.length > 0) {
            const untaggedIds = untaggedProducts.map(p => p.id);
            for (const id of untaggedIds) {
              await supabase
                .from('products')
                .update({ vendor_id: vendorData.id })
                .eq('id', id);
            }
            if (untaggedIds.length > 0) {
              toast({
                title: "Products updated",
                description: `${untaggedIds.length} products linked to your store.`,
              });
              await loadProducts(); // Reload to show updated data
            }
          }
        }
      } catch (err) {
        console.error('Error getting vendor data:', err);
      }
    };

    getVendorData();
  }, []);

  // ✅ Load products from Supabase
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError("Failed to load products. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ✅ Save product (create or update)
  const handleSave = async (data) => {
    try {
      const productData = { 
        ...data, 
        vendor_id: vendorId || null 
      };

      if (editingProduct) {
        // Update existing product
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
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              category: productData.category,
              stock: productData.stock,
              status: productData.status,
              image_url: productData.image_url || "",
              gallery_images: productData.gallery_images || [],
              vendor_id: productData.vendor_id
            }
          ]);

        if (error) throw error;
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: editingProduct ? "Product updated successfully." : "Product added successfully.",
      });
    } catch (err) {
      console.error('Error saving product:', err);
      setError("Failed to save product. Please try again.");
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
        title: "Deleted",
        description: `${product.name} has been removed.`,
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Bulk update products
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
        title: "Bulk update complete",
        description: `${ids.length} products updated successfully.`,
      });
    } catch (err) {
      console.error('Bulk update error:', err);
      setError("Failed to bulk update products. Please try again.");
      setShowBulkEdit(false);
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

  // ✅ Filter products
  const LOW_STOCK_THRESHOLD = 5;
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
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
            Products
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Manage your catalog, prices, and inventory
          </p>
        </div>
        <div className="flex items-center gap-3 w-fit">
          <Button
            onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
            variant={selectMode ? "default" : "outline"}
            className="rounded-full px-5 font-semibold"
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            {selectMode ? "Done" : "Select"}
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold glow-pulse"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

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
          { label: "Inventory Value", value: `$${totalValue.toFixed(0)}`, icon: DollarSign, color: "primary" },
        ].map((stat) => (
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

      {/* Search bar + low stock filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="rounded-full pl-10"
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
        <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">
            {search ? "No products found" : "No products yet"}
          </h3>
          <p className="text-sm text-[#0B2E2A]/50 mb-6 max-w-sm">
            {search
              ? "Try a different search term."
              : "Add your first product to start selling on WhatsApp."}
          </p>
          {!search && (
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
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={(p) => setConfirmDelete(p)}
                selectMode={selectMode}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Product form modal */}
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

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
                disabled={deletingId === confirmDelete.id}
              >
                {deletingId === confirmDelete.id ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk edit bar */}
      {selectMode && selectedIds.size > 0 && (
        <BulkEditBar
          selectedCount={selectedIds.size}
          onEdit={() => setShowBulkEdit(true)}
          onClear={clearSelection}
        />
      )}

      {/* Bulk edit modal */}
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