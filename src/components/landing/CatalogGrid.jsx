import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Eye, Heart, Grid3X3, Search, X, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckoutModal from "@/components/landing/CheckoutModal";
import { supabase } from "@/api/supabase";

function ProductCard({ product, index, onOrder }) {
  const outOfStock = (product.stock || 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="glass-card rounded-3xl overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 group">
        {/* Image */}
        <div className="relative overflow-hidden h-48 md:h-56">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F0F4F4]">
              <Package className="w-12 h-12 text-[#0B2E2A]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action overlay */}
          {!outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex gap-2">
                <button className="w-11 h-11 rounded-full glass-heavy flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="w-11 h-11 rounded-full glass-heavy flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={onOrder}
                  className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-pulse"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.category && (
              <span className="glass-heavy text-[#0B2E2A] text-xs font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {outOfStock && (
              <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0B2E2A] font-heading text-base md:text-lg leading-tight">
              {product.name}
            </h3>
            <p className="text-primary font-bold text-sm whitespace-nowrap">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
          {product.description && (
            <p className="text-sm text-[#0B2E2A]/50 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
          <Button
            onClick={onOrder}
            disabled={outOfStock}
            size="sm"
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full h-9 px-4 text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            {outOfStock ? "Out of Stock" : "Order Now"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CatalogGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filter products
  const filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // If error, show error message
  if (error) {
    return (
      <section id="catalog" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2E2A] mb-2">Error Loading Products</h3>
            <p className="text-sm text-[#0B2E2A]/50">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="catalog" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4"
          >
            <Grid3X3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Our Collection
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
          >
            Explore the Catalog
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#0B2E2A]/50 mt-4 max-w-lg mx-auto text-lg"
          >
            Tap any product to start a conversation and place your order instantly.
          </motion.p>
        </div>

        {/* Search bar */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full h-12 pl-11 pr-10 rounded-full glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "glass-card hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">
              {search ? "No products found" : "No products available"}
            </h3>
            <p className="text-sm text-[#0B2E2A]/50 max-w-sm">
              {search ? "Try a different search term." : "Check back soon for new arrivals."}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onOrder={() => setCheckoutProduct(product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <CheckoutModal
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
      />
    </section>
  );
}