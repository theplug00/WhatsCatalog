import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Store, ArrowRight, Eye, EyeOff, CheckCircle2, Phone, MapPin } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import VendorAuthLayout from "@/components/landing/VendorAuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function VendorRegister() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    businessDescription: "",
    category: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const categories = ["Fashion", "Electronics", "Home", "Beauty", "Food", "Sports", "Other"];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Register user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.businessName.trim()) {
      setError("Business name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.businessPhone.trim()) {
      setError("Business phone is required");
      return;
    }

    setLoading(true);
    try {
      // ✅ Register with Supabase Auth - this sends a confirmation email with OTP
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          // ✅ This tells Supabase to send OTP instead of magic link
          emailRedirectTo: `${window.location.origin}/vendor/register`,
          data: {
            business_name: form.businessName,
            business_phone: form.businessPhone,
            role: 'vendor'
          }
        }
      });

      console.log('SignUp Response:', { data, error });

      if (error) {
        console.error('SignUp Error:', error);
        throw error;
      }

      if (data.user) {
        setUserId(data.user.id);
        
        // Check if user already exists
        if (data.user.identities && data.user.identities.length === 0) {
          setError("An account with this email already exists. Please login.");
          setLoading(false);
          return;
        }

        // ✅ Show OTP verification screen
        setShowOtp(true);
        toast({
          title: "Verification code sent",
          description: `We sent a 6-digit code to ${form.email}`,
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      // ✅ Verify the OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        email: form.email,
        token: otpCode,
        type: 'email'
      });

      console.log('Verify OTP Response:', { data, error });

      if (error) {
        console.error('Verify OTP Error:', error);
        throw error;
      }

      // ✅ Create vendor profile
      if (data.user) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert([
            {
              id: data.user.id,
              business_name: form.businessName,
              business_email: form.email,
              business_phone: form.businessPhone,
              business_address: form.businessAddress,
              business_description: form.businessDescription,
              category: form.category || 'General',
              status: 'pending'
            }
          ]);

        console.log('Vendor Creation Response:', { vendorError });

        if (vendorError) {
          console.error('Vendor creation error:', vendorError);
          throw new Error('Failed to create vendor profile. Please try again.');
        }
      }

      setSuccess(true);
      toast({
        title: "Email verified!",
        description: "Your account is pending admin approval.",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/vendor/login", { 
          state: { 
            message: "Registration successful! Please login." 
          }
        });
      }, 3000);

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email
      });

      console.log('Resend OTP Response:', { error });

      if (error) throw error;

      toast({
        title: "Code sent",
        description: `A new 6-digit code has been sent to ${form.email}`,
      });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/vendor/complete-signup`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Google sign-up failed");
    }
  };

  // Success Screen
  if (success) {
    return (
      <VendorAuthLayout side="register">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B2E2A] mb-2">
            Registration Successful! 🎉
          </h2>
          <p className="text-[#0B2E2A]/60 mb-4">
            Your account has been created and is pending admin approval.
          </p>
          <div className="bg-primary/5 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-[#0B2E2A]/70">
              📧 We'll notify you once your account is approved.
            </p>
            <p className="text-sm text-[#0B2E2A]/70 mt-2">
              ⏱️ This usually takes 24-48 hours.
            </p>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            onClick={() => navigate("/vendor/login")}
          >
            Go to Login
          </Button>
        </div>
      </VendorAuthLayout>
    );
  }

  // OTP Verification Screen
  if (showOtp) {
    return (
      <VendorAuthLayout side="register">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B2E2A]">Verify Your Email</h2>
          <p className="text-[#0B2E2A]/60 mt-1">
            Enter the 8-digit code sent to <strong>{form.email}</strong>
          </p>
          <p className="text-xs text-[#0B2E2A]/40 mt-1">
            Check your email for the verification code
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <InputOTP
            maxLength={8}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          onClick={handleVerifyOtp}
          disabled={loading || otpCode.length < 8}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-[#0B2E2A]/50">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </p>
          <p className="text-xs text-[#0B2E2A]/40 mt-2">
            Code expires in 10 minutes
          </p>
        </div>
      </VendorAuthLayout>
    );
  }

  // Registration form
  return (
    <VendorAuthLayout side="register">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] tracking-tight">
          Become a Vendor
        </h2>
        <p className="text-[#0B2E2A]/50 mt-2">
          Start selling through WhatsApp in minutes
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-5 glass border-white/30 text-[#0B2E2A] hover:bg-white/40"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Sign up with Google
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0B2E2A]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/40 px-3 text-[#0B2E2A]/40 backdrop-blur-sm">
            or sign up with email
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
          <Label htmlFor="businessName" className="text-[#0B2E2A] font-medium">
            Business Name *
          </Label>
          <div className="relative">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="businessName"
              type="text"
              autoComplete="organization"
              autoFocus
              placeholder="Your business name"
              value={form.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#0B2E2A] font-medium">
            Business Email *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vendor@business.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0B2E2A] font-medium">
              Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#0B2E2A] font-medium">
              Confirm Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPhone" className="text-[#0B2E2A] font-medium">
            Business Phone *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="businessPhone"
              type="tel"
              autoComplete="tel"
              placeholder="+1234567890"
              value={form.businessPhone}
              onChange={(e) => handleChange('businessPhone', e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress" className="text-[#0B2E2A] font-medium">
            Business Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" aria-hidden="true" />
            <Input
              id="businessAddress"
              type="text"
              placeholder="Business address"
              value={form.businessAddress}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-[#0B2E2A] font-medium">
            Category
          </Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full h-12 rounded-xl border border-[#0B2E2A]/10 bg-white/50 px-4 text-sm focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription" className="text-[#0B2E2A] font-medium">
            Business Description
          </Label>
          <textarea
            id="businessDescription"
            placeholder="Tell customers about your business..."
            value={form.businessDescription}
            onChange={(e) => handleChange('businessDescription', e.target.value)}
            className="w-full rounded-xl border border-[#0B2E2A]/10 bg-white/50 px-4 py-3 text-sm focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-20 resize-vertical"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-[#0B2E2A]/60 cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-0.5 w-4 h-4 rounded accent-primary"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Vendor Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <Button
          type="submit"
          className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-pulse"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Vendor Account
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm mt-4">
        <span className="text-[#0B2E2A]/60">Already have an account?</span>
        <button
          onClick={() => navigate("/vendor/login")}
          className="ml-1 text-primary font-semibold hover:underline"
        >
          Sign in
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-[#0B2E2A]/10 space-y-2.5">
        {["Free to get started", "No commission on first 50 orders", "Instant WhatsApp integration"].map((perk) => (
          <div key={perk} className="flex items-center gap-2 text-sm text-[#0B2E2A]/60">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {perk}
          </div>
        ))}
      </div>
    </VendorAuthLayout>
  );
}