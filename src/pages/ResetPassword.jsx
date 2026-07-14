import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Extract access token from URL hash (Supabase uses hash for tokens)
  useEffect(() => {
    // Check if we have a hash fragment with access_token
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
        // Clear the hash from URL
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Supabase handles password reset through the session
      // The user should already be authenticated via the magic link
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If no token and no access token, show invalid link message
  if (!resetToken && !accessToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid"
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            <ArrowLeft className="w-3 h-3 inline mr-1" />Request a new link
          </Link>
        }
      >
        <p className="text-sm text-[#0B2E2A]/70 text-center">
          The link you used appears to be incomplete. Please request a new password reset email.
        </p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        icon={CheckCircle}
        title="Password reset successful!"
        subtitle="Your password has been updated"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-sm text-[#0B2E2A]/70">
            Your password has been successfully reset.
          </p>
          <p className="text-xs text-[#0B2E2A]/40">
            Redirecting to login...
          </p>
          <Button
            className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="New password"
      subtitle="Enter your new password below"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#0B2E2A] font-medium">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-[#0B2E2A] font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="text-xs text-[#0B2E2A]/40 space-y-1">
          <p>Password must:</p>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            <li>Be at least 6 characters long</li>
            <li>Be different from your previous password</li>
          </ul>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-pulse" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}