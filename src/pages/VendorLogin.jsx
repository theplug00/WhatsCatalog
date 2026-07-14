import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase"; // ✅ Changed from @/lib/supabase to @/api/supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Store, ArrowRight, Eye, EyeOff } from "lucide-react";
import VendorAuthLayout from "@/components/landing/VendorAuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // 2. Check if user is a vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (vendorError) {
        // User is not registered as vendor
        await supabase.auth.signOut();
        throw new Error('Account not found as vendor. Please register first.');
      }

      // 3. Check vendor status
      if (vendorData.status === 'pending') {
        await supabase.auth.signOut();
        throw new Error('Your vendor account is pending approval. Please wait for admin confirmation.');
      }

      if (vendorData.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('Your vendor account has been suspended. Please contact support.');
      }

      if (vendorData.status === 'rejected') {
        await supabase.auth.signOut();
        throw new Error('Your vendor application was rejected. Please contact support for more information.');
      }

      // 4. Successful login - redirect to vendor dashboard
      navigate("/vendor/admin");
      
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

  return (
    <VendorAuthLayout side="login">
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
        className="w-full h-12 text-sm font-medium mb-5 glass border-white/30 text-[#0B2E2A] hover:bg-white/40"
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
          <span className="bg-white/40 px-3 text-[#0B2E2A]/40 backdrop-blur-sm">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
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
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70"
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
              className="pl-10 pr-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70"
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
          className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-pulse"
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
    </VendorAuthLayout>
  );
}