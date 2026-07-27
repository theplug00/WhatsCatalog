import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Menu, 
  X, 
  ClipboardList, 
  CreditCard, 
  User, 
  BarChart3,
  LifeBuoy
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { toast } from "@/components/ui/use-toast";

// ============================================
// NAVIGATION ITEMS
// ============================================
const NAV_ITEMS = [
  { label: "Dashboard", href: "/vendor/admin", icon: LayoutDashboard },
  { label: "Products", href: "/vendor/admin", icon: Package },
  { label: "Orders", href: "/vendor/admin/orders", icon: ClipboardList },
  { label: "Analytics", href: "/vendor/admin/analytics", icon: BarChart3 },
  { label: "Profile", href: "/vendor/admin/profile", icon: User },
  { label: "Subscription", href: "/vendor/admin/subscription", icon: CreditCard },
];

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================
export default function VendorAdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get current user and vendor
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          navigate('/vendor/login');
          return;
        }
        setUser(user);

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          navigate('/vendor/register');
          return;
        }
        setVendor(vendorData);
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/vendor/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/vendor/login');
    });
    return () => subscription?.unsubscribe();
  }, [navigate]);

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been signed out successfully.",
        duration: 2000,
      });
      navigate('/vendor/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ✅ Check if link is active
  const isActive = (href) => {
    if (href === "/vendor/admin") {
      return location.pathname === "/vendor/admin";
    }
    return location.pathname === href || location.pathname.startsWith(href);
  };

  // ✅ Get display name
  const displayName = vendor?.business_name || user?.email?.split('@')[0] || 'Vendor';
  const initial = vendor?.business_name?.charAt(0)?.toUpperCase() || 
                  user?.email?.charAt(0)?.toUpperCase() || 'V';

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F4] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F4] flex">
      {/* ============================================ */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================================ */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-[#0B2E2A]/5 fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-[#0B2E2A]/5">
          <Link to="/vendor" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0B2E2A] font-heading">
              Whats<span className="text-primary">Catalog</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-[#0B2E2A]/40 uppercase tracking-wider px-3 mb-3">
            Vendor Panel
          </p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-[#0B2E2A]/70 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#0B2E2A]/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#0B2E2A] flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0B2E2A] truncate">
                {displayName}
              </p>
              <p className="text-xs text-[#0B2E2A]/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ============================================ */}
      {/* MOBILE HEADER */}
      {/* ============================================ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#0B2E2A]/5 px-4 py-3 flex items-center justify-between">
        <Link to="/vendor" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#0B2E2A] font-heading">
            Whats<span className="text-primary">Catalog</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-[#F0F4F4] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5 text-[#0B2E2A]" /> : <Menu className="w-5 h-5 text-[#0B2E2A]" />}
        </button>
      </div>

      {/* ============================================ */}
      {/* MOBILE SIDEBAR */}
      {/* ============================================ */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-64 h-full bg-white p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Logo */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/vendor" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-[#0B2E2A] font-heading">
                  Whats<span className="text-primary">Catalog</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-[#F0F4F4]">
                <X className="w-5 h-5 text-[#0B2E2A]" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-[#0B2E2A]/70 hover:bg-primary/10"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile User & Logout */}
            <div className="pt-4 border-t border-[#0B2E2A]/5">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#0B2E2A] flex items-center justify-center text-white font-bold text-sm">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0B2E2A] truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-[#0B2E2A]/50 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}