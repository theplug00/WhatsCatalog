import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, Lock, Loader2, Shield, ArrowRight, 
  Eye, EyeOff, CheckCircle, AlertCircle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.3 }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function SuperAdminLogin() {
  const [email, setEmail] = useState("admin@business.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      if (!adminData.is_active) {
        await supabase.auth.signOut();
        setError("Admin account is deactivated.");
        setLoading(false);
        return;
      }

      // ✅ Success - redirect
      window.location.href = '/super-admin/dashboard';

    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F0F4F4] overflow-hidden">
      {/* ============================================ */}
      {/* LEFT - LOGIN FORM */}
      {/* ============================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div 
          variants={fadeInLeft}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-heading text-[#0B2E2A]">
                Admin<span className="text-primary">Panel</span>
              </h1>
              <p className="text-sm text-[#0B2E2A]/50">Secure Access Only</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold font-heading text-[#0B2E2A] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-[#0B2E2A]/50 mt-1">
              Sign in to manage your platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-[#0B2E2A]">
                Email Address
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-white/60 border-[#0B2E2A]/10 focus:bg-white focus:border-primary/50 rounded-xl transition-all"
                  placeholder="admin@business.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#0B2E2A]">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-white/60 border-[#0B2E2A]/10 focus:bg-white focus:border-primary/50 rounded-xl transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-primary border-[#0B2E2A]/20"
              />
              <Label htmlFor="remember" className="text-sm text-[#0B2E2A]/60 cursor-pointer">
                Remember me
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-[#0B2E2A]/40 mt-6">
            Default: admin@business.com / Admin@123
          </p>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* RIGHT - ADMIN IMAGE PANEL */}
      {/* ============================================ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B2E2A] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-[#0B2E2A]" />
          <div className="absolute top-[-20%] right-[-10%] w-125 h-125 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-100 h-100 rounded-full bg-primary/5 blur-[80px]" />
          
          {/* Decorative Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(62, 207, 142, 0.05) 0%, transparent 50%)`,
          }} />
        </div>

        {/* Content */}
        <motion.div 
          variants={fadeInRight}
          initial="initial"
          animate="animate"
          className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-center"
        >
          {/* Admin Illustration - Using SVG instead of image */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] scale-75" />
            
            {/* Admin Shield Icon */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Shield className="w-20 h-20 text-primary" />
              </div>
              
              {/* Decorative rings */}
              <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse" />
              <div className="absolute -inset-8 rounded-full border border-white/5 animate-pulse delay-300" />
            </div>
          </div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-extrabold text-white font-heading">
              Admin Dashboard
            </h2>
            <p className="text-white/50 mt-2 max-w-sm">
              Manage vendors, orders, and platform settings from one place
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm"
          >
            {[
              { icon: Shield, label: "Secure Access" },
              { icon: Users, label: "Vendor Management" },
              { icon: ShoppingBag, label: "Order Tracking" },
              { icon: BarChart3, label: "Analytics" },
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                <feature.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-white/60">{feature.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-8 text-xs text-white/20"
          >
            Secured with Supabase Auth
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// MISSING IMPORTS
// ============================================
import { Users, ShoppingBag, BarChart3 } from "lucide-react";