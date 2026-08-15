import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import SplitAuthLayout from "@/components/SplitAuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

const VENDOR_IMAGE =
  "https://media.base44.com/images/public/6a383a8b348b95defff04d98/295601b35_generated_image.png";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // ✅ Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: vendorData } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (vendorData) {
            window.location.href = '/vendor/admin';
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // ✅ Check if user is a vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (vendorError || !vendorData) {
        await supabase.auth.signOut();
        setError("Vendor account not found. Please register first.");
        setLoading(false);
        return;
      }

      // ✅ Check vendor status
      if (vendorData.status === 'pending') {
        await supabase.auth.signOut();
        setError('Your vendor account is pending approval. Please wait for admin confirmation.');
        setLoading(false);
        return;
      }

      if (vendorData.status === 'suspended') {
        await supabase.auth.signOut();
        setError('Your vendor account has been suspended. Please contact support.');
        setLoading(false);
        return;
      }

      if (vendorData.status === 'rejected') {
        await supabase.auth.signOut();
        setError('Your vendor application was rejected. Please contact support.');
        setLoading(false);
        return;
      }

      // ✅ Success - redirect to vendor dashboard
      setRedirecting(true);
      window.location.href = '/vendor/admin';

    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/vendor/admin`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  // ✅ Show loading while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F4]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-[#0B2E2A]/60">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SplitAuthLayout
      image={VENDOR_IMAGE}
      badge="Vendor Portal"
      headline="Grow your business through conversations."
      subtitle="Join thousands of vendors selling directly to customers via WhatsApp. Manage your catalog, orders, and customers — all in one place."
      footerLink={
        <>
          New vendor?{" "}
          <Link to="/vendor/register" className="text-primary font-semibold hover:underline">
            Apply to sell
          </Link>
        </>
      }
    >
      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] tracking-tight">
          Welcome back, Vendor
        </h2>
        <p className="text-[#0B2E2A]/50 mt-2">
          Sign in to manage your catalog and orders
        </p>
      </div>

      {/* Google */}
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-5 rounded-xl border-[#0B2E2A]/15 hover:bg-[#0B2E2A]/5"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0B2E2A]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#F0F4F4] px-3 text-[#0B2E2A]/40">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#0B2E2A] font-medium">
            Business Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="vendor@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/60 border-[#0B2E2A]/10 focus:bg-white rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[#0B2E2A] font-medium">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white/60 border-[#0B2E2A]/10 focus:bg-white rounded-xl"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A]/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

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
              Sign in to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </SplitAuthLayout>
  );
}