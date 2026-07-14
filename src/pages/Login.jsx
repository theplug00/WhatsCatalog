import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If user is an admin, redirect to admin dashboard
      if (!adminError && adminData) {
        if (!adminData.is_active) {
          await supabase.auth.signOut();
          setError('Admin account is deactivated. Please contact support.');
          setLoading(false);
          return;
        }
        navigate("/admin/dashboard");
        return;
      }

      // Check if user is a vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!vendorError && vendorData) {
        // Check vendor status
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

        // Vendor is active - redirect to vendor dashboard
        navigate("/vendor/admin");
        return;
      }

      // Regular user - redirect to home
      navigate("/");
      
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
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6 rounded-xl border-[#0B2E2A]/10 hover:bg-primary/5"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0B2E2A]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/40 px-3 text-[#0B2E2A]/40 backdrop-blur-sm">
            or
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#0B2E2A] font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[#0B2E2A] font-medium">
              Password
            </Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
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
              className="pl-10 pr-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
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
              Logging in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Log in
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}