 import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  HelpCircle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import SupportContact from "@/components/vendor/SupportContact";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/vendor/admin", icon: LayoutDashboard },
  { label: "Products", href: "/vendor/admin#products", icon: Package },
  { label: "Orders", href: "/vendor/admin/orders", icon: ClipboardList },
  { label: "Subscription", href: "/vendor/admin/subscription", icon: CreditCard },
];

export default function VendorAdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Get current user and vendor profile from Supabase
  useEffect(() => {
    const getUser = async () => {
      try {
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('No user found');
          navigate('/vendor/login');
          return;
        }

        setUser(user);

        // Get vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.error('Vendor not found:', vendorError);
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

    // ✅ Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/vendor/login');
        }
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/vendor/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ✅ Get display name
  const displayName = vendor?.business_name || user?.email?.split('@')[0] || 'Vendor';
  const initial = vendor?.business_name?.charAt(0)?.toUpperCase() || 
                  user?.email?.charAt(0)?.toUpperCase() || 'V';

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F4] flex">
      {/* ============================================ */}
      {/* DESKTOP SIDEBAR - hidden on mobile */}
      {/* ============================================ */}
      <aside className="hidden lg:flex w-64 flex-col glass-nav border-r border-white/30 fixed h-full z-40">
        {/* Logo */}
        <div className="p-6">
          <Link to="/vendor" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0B2E2A] font-heading">
              Whats<span className="text-primary">Catalog</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="text-xs font-semibold text-[#0B2E2A]/40 uppercase tracking-wider px-3 mb-2">
            Vendor Panel
          </p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0B2E2A]/70 hover:bg-primary/10 hover:text-primary transition-all mb-1"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <p className="text-xs font-semibold text-[#0B2E2A]/40 uppercase tracking-wider px-3 mb-2 mt-4">
            Help
          </p>
          <SupportContact />
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/30">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-[#0B2E2A] flex items-center justify-center text-white font-bold text-sm">
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
      {/* MOBILE TOP BAR - only visible on mobile */}
      {/* ============================================ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-nav border-b border-white/30">
        <div className="flex items-center justify-between px-5 h-16">
          <Link to="/vendor" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0B2E2A] font-heading">
              Whats<span className="text-primary">Catalog</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-card"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MOBILE SIDEBAR OVERLAY - slides in from left */}
      {/* ============================================ */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-64 h-full glass-heavy p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Logo */}
            <Link to="/vendor" className="flex items-center gap-2.5 mb-6" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-[#0B2E2A] font-heading">
                Whats<span className="text-primary">Catalog</span>
              </span>
            </Link>

            {/* Mobile Navigation */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0B2E2A]/70 hover:bg-primary/10 transition-all mb-1"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            
            <div className="mt-4">
              <SupportContact />
            </div>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}