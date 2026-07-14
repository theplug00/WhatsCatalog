import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  MessageCircle,
  MapPin,
  Tag,
  Loader2,
  Package,
  Search,
  X,
  ArrowLeft,
  Star,
  Phone,
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import StoreProductCard from "@/components/store/StoreProductCard";
import CheckoutModal from "@/components/landing/CheckoutModal";
// ✅ Remove Footer import if it doesn't exist

export default function StorePage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  // ✅ Load vendor and products from Supabase
  useEffect(() => {
    const loadStore = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('is_approved', true)
          .eq('status', 'active')
          .single();

        if (vendorError || !vendorData) {
          console.error('Vendor not found:', vendorError);
          setNotFound(true);
          setLoading(false);
          return;
        }

        setVendor(vendorData);

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (productError) throw productError;
        setProducts(productData || []);

      } catch (err) {
        console.error('Error loading store:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadStore();
    }
  }, [slug]);

  // ✅ Get whatsapp number (clean)
  const whatsappNumber = vendor?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const phoneNumber = vendor?.business_phone?.replace(/[^0-9]/g, "") || "";

  // ✅ Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  // ✅ Filter products
  const filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F4]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found state
  if (notFound || !vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F4] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-[#0B2E2A] mb-2">Store Not Found</h1>
        <p className="text-sm text-[#0B2E2A]/50 max-w-sm mb-6">
          This store may not exist, is not approved, or isn't available yet.
        </p>
        <Link to="/">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F4]">
      {/* Store Header */}
      <div className="relative">
        <div className="h-32 md:h-40 bg-gradient-to-r from-primary/80 to-[#0B2E2A]/70" />
        
        {/* Back button */}
        <div className="absolute top-4 left-5 z-10">
          <Link to="/">
            <button className="glass-heavy rounded-full px-4 py-2 text-xs font-semibold text-[#0B2E2A] flex items-center gap-1.5 hover:bg-primary hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
          </Link>
        </div>

        {/* Vendor info */}
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 md:-mt-14 pb-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-12 h-12 text-[#0B2E2A]/25" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
                {vendor.business_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {vendor.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {vendor.category}
                  </span>
                )}
                {vendor.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-600" />
                    {vendor.rating}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0B2E2A]/50 bg-[#0B2E2A]/5 px-2.5 py-1 rounded-full">
                  {products.length} products
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                  ✅ Verified Store
                </span>
              </div>
              {vendor.business_description && (
                <p className="text-sm text-[#0B2E2A]/60 mt-2 max-w-lg">
                  {vendor.business_description}
                </p>
              )}
            </div>

            {/* Contact buttons */}
            <div className="flex flex-wrap gap-2 sm:pb-2">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold glow-pulse">
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    WhatsApp
                  </Button>
                </a>
              )}
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="glass-card rounded-full px-5 py-2 text-sm font-semibold text-[#0B2E2A] hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
            >
              Our Products
            </motion.h2>
            <p className="text-[#0B2E2A]/50 mt-2">
              {products.length} {products.length === 1 ? "item" : "items"} available
            </p>
          </div>

          {/* Search */}
          {products.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 pl-11 pr-10 rounded-full glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "glass-card text-[#0B2E2A]/60 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-[#0B2E2A] mb-1">
                {search ? "No products found" : "No products yet"}
              </h3>
              <p className="text-sm text-[#0B2E2A]/50 max-w-sm">
                {search ? "Try a different search term." : "Check back soon for new arrivals."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((product, i) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onOrder={() => setCheckoutProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        whatsappNumber={whatsappNumber || undefined}
      />

      {/* ✅ Simple Footer */}
      <footer className="bg-white/50 border-t border-[#0B2E2A]/10 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p className="text-xs text-[#0B2E2A]/40">
            © {new Date().getFullYear()} WhatsCatalog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}