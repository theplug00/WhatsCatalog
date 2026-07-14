import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      // Success - show confirmation
      setSent(true);
    } catch (err) {
      // Always show success regardless of error (for security)
      // This prevents email enumeration attacks
      console.error('Password reset error:', err);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-[#0B2E2A]/70">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
          <p className="text-xs text-[#0B2E2A]/40">
            Please check your spam folder if you don't see the email.
          </p>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => setSent(false)}
          >
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0B2E2A] font-medium">
              Email address
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
          
          <Button 
            type="submit" 
            className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-pulse" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
          
          <p className="text-xs text-[#0B2E2A]/40 text-center">
            We'll send a password reset link to your email
          </p>
        </form>
      )}
    </AuthLayout>
  );
}