import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, Package, MessageCircle, Phone, 
  MapPin, Star, Loader2, Copy, Check,
  ShoppingBag, ChevronRight, Heart, Share2,
  Instagram, Twitter, Facebook, Mail, Clock,
  Award, Shield, Truck, CreditCard, ArrowUp
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import CheckoutModal from "@/components/landing/CheckoutModal";
import Footer from "@/components/Footer";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export default function VendorStore() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // ✅ Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Load vendor data
  useEffect(() => {
    const loadVendorStore = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('is_approved', true)
          .eq('status', 'active')
          .single();

        if (vendorError || !vendorData) {
          setError("Store not found or not active.");
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
        console.error('Error loading vendor store:', err);
        setError("Failed to load store. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadVendorStore();
    }
  }, [slug]);

  // ✅ Get categories
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  // ✅ Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // ✅ Copy store link
  const copyStoreLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f0f4f4] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-[#0B2E2A]/60">Loading store...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#f0f4f4] to-white p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B2E2A] mb-2">Store Not Found</h1>
          <p className="text-[#0B2E2A]/50">{error || "This store doesn't exist or isn't active yet."}</p>
          <Link to="/">
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-white rounded-full px-8">
              Browse All Stores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Get WhatsApp number
  const whatsappNumber = vendor?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const phoneNumber = vendor?.business_phone?.replace(/[^0-9]/g, "") || "";

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0f4f4] to-white">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-[#0B2E2A]/5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/10 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-5 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl shadow-2xl overflow-hidden bg-white border-4 border-white flex items-center justify-center">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-14 h-14 text-[#0B2E2A]/20" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Verified
              </div>
            </motion.div>

            {/* Info */}
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="flex-1"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-[#0B2E2A]">
                  {vendor.business_name}
                </h1>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-500" />
                  <span className="font-bold text-[#0B2E2A]">4.9</span>
                  <span className="text-[#0B2E2A]/40 text-sm">(128 reviews)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {vendor.category && (
                  <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                    {vendor.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-[#0B2E2A]/50">
                  <Package className="w-4 h-4" />
                  {products.length} products
                </span>
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <Shield className="w-3.5 h-3.5" />
                  Trusted Store
                </span>
              </div>

              {vendor.business_description && (
                <p className="text-[#0B2E2A]/60 max-w-xl leading-relaxed">
                  {vendor.business_description}
                </p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 w-full md:w-auto"
            >
              <div className="flex gap-2">
                {whatsappNumber && (
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full px-6 py-6 gap-2 shadow-lg shadow-[#25D366]/20">
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                {phoneNumber && (
                  <a href={`tel:${phoneNumber}`}>
                    <Button variant="outline" className="rounded-full px-6 py-6 gap-2 border-[#0B2E2A]/20">
                      <Phone className="w-5 h-5" />
                      Call
                    </Button>
                  </a>
                )}
              </div>
              <Button 
                onClick={copyStoreLink}
                variant="ghost" 
                className="text-[#0B2E2A]/50 hover:text-primary gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Share Store"}
                <Share2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap gap-6 border-t border-[#0B2E2A]/5 pt-6"
          >
            {[
              { icon: Shield, label: "Secure Payments", sub: "100% safe" },
              { icon: Truck, label: "Fast Delivery", sub: "Same day dispatch" },
              { icon: CreditCard, label: "Easy Checkout", sub: "Pay on delivery" },
              { icon: Clock, label: "24/7 Support", sub: "Always available" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B2E2A]">{item.label}</p>
                  <p className="text-xs text-[#0B2E2A]/40">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ============================================ */}
      {/* PRODUCTS SECTION */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-primary" />
              Our Collection
            </h2>
            <p className="text-[#0B2E2A]/50 mt-1">
              {filteredProducts.length} products available
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 rounded-full border border-[#0B2E2A]/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all w-40 md:w-56"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full border border-[#0B2E2A]/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl">
            <Package className="w-16 h-16 text-[#0B2E2A]/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0B2E2A]">No products found</h3>
            <p className="text-[#0B2E2A]/40">Try adjusting your search or filter</p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  onOrder={() => setCheckoutProduct(product)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ============================================ */}
      {/* SCROLL TO TOP BUTTON */}
      {/* ============================================ */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* CHECKOUT MODAL */}
      {/* ============================================ */}
      <CheckoutModal
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        whatsappNumber={whatsappNumber || undefined}
      />

      <Footer />
    </div>
  );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
function ProductCard({ product, index, onOrder }) {
  const outOfStock = (product.stock || 0) <= 0;
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F0F4F4] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-[#0B2E2A]/20" />
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className={`absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <button
              onClick={onOrder}
              disabled={outOfStock}
              className="flex-1 bg-white text-[#0B2E2A] font-semibold text-sm py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of Stock' : 'Order Now'}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {outOfStock && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
          {!outOfStock && (product.stock || 0) <= 5 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Low Stock
            </span>
          )}
          {product.featured && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Featured
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#0B2E2A]/40'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#0B2E2A] text-sm line-clamp-1 flex-1">
            {product.name}
          </h3>
        </div>
        
        {product.category && (
          <span className="text-xs text-[#0B2E2A]/40">{product.category}</span>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0B2E2A]/5">
          <p className="font-bold text-primary text-lg">
            GH₵{Number(product.price).toFixed(2)}
          </p>
          <span className="text-xs text-[#0B2E2A]/40">
            {outOfStock ? 'Out of stock' : `${product.stock || 0} in stock`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}