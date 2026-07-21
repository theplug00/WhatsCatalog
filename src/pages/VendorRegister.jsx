import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, Mail, Lock, Loader2, Store, 
  ArrowRight, Eye, EyeOff, CheckCircle2, 
  Phone, MapPin, Building, Shield, 
  Sparkles, ChevronRight, Check, X,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import GoogleIcon from "@/components/GoogleIcon";

const CATEGORIES = ["Fashion", "Electronics", "Home", "Beauty", "Food", "Sports", "Other"];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const slideIn = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!form.businessName.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!form.businessPhone.trim()) {
      setError("Business phone is required");
      return false;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Step 1: Register user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStep1()) return;
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/vendor/register`,
          data: {
            business_name: form.businessName,
            business_phone: form.businessPhone,
            role: 'vendor'
          }
        }
      });

      console.log('SignUp Response:', { data, error });

      if (error) throw error;

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setError("An account with this email already exists. Please login.");
          setLoading(false);
          return;
        }

        setShowOtp(true);
        toast({
          title: "✨ Verification code sent",
          description: `We sent a code to ${form.email}`,
          duration: 3000,
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
      const { data, error } = await supabase.auth.verifyOtp({
        email: form.email,
        token: otpCode,
        type: 'email'
      });

      if (error) {
        if (error.message?.includes('expired')) {
          setError("Code expired. Please request a new one.");
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data.user) {
        // Create vendor profile
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
              status: 'pending',
              slug: generateSlug(form.businessName)
            }
          ]);

        if (vendorError) {
          console.error('Vendor creation error:', vendorError);
          throw new Error('Failed to create vendor profile. Please try again.');
        }

        setSuccess(true);
        toast({
          title: "🎉 Registration Successful!",
          description: "Your account is pending admin approval.",
          duration: 4000,
        });

        setTimeout(() => {
          navigate("/vendor/login", { 
            state: { message: "Registration successful! Please login." }
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email
      });

      if (error) throw error;

      toast({
        title: "📨 Code resent",
        description: `A new code sent to ${form.email}`,
        duration: 3000,
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

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#f0f4f4] to-[#e8f5e9]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#0B2E2A] mb-2">
            🎉 Registration Successful!
          </h2>
          <p className="text-[#0B2E2A]/60 mb-6">
            Your account has been created and is pending admin approval.
          </p>
          <div className="bg-primary/5 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0B2E2A]">Step 1: Email Verified</p>
                <p className="text-xs text-[#0B2E2A]/50">✓ Your email has been confirmed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#0B2E2A]">Step 2: Admin Approval</p>
                <p className="text-xs text-[#0B2E2A]/50">⏳ Awaiting admin review (24-48 hours)</p>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              onClick={() => navigate("/vendor/login")}
            >
              Go to Login
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // OTP Screen
  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#f0f4f4] to-[#e8f5e9]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#0B2E2A] text-center">Verify Your Email</h2>
          <p className="text-[#0B2E2A]/60 text-center mt-1">
            Enter the 8-digit code sent to <strong>{form.email}</strong>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-center my-8">
            <InputOTP
              maxLength={8}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
            >
              <InputOTPGroup>
                {[...Array(8)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
          </motion.div>

          <div className="text-center mt-4">
            <p className="text-sm text-[#0B2E2A]/50">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={resending}
                className="text-primary font-semibold hover:underline disabled:opacity-50 transition-all"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>

          <button
            onClick={() => setShowOtp(false)}
            className="mt-4 text-sm text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors w-full text-center"
          >
            ← Back to registration
          </button>
        </motion.div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#f0f4f4] to-[#e8f5e9]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-primary/10 to-[#0B2E2A]/5 p-6 border-b border-[#0B2E2A]/5">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center"
              >
                <Store className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-[#0B2E2A]">Become a Vendor</h1>
                <p className="text-sm text-[#0B2E2A]/50">Start selling on WhatsCatalog</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Google Sign Up */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-medium mb-6 rounded-xl border-[#0B2E2A]/10 hover:bg-primary/5 transition-all"
                onClick={handleGoogle}
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                Sign up with Google
              </Button>
            </motion.div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0B2E2A]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-[#0B2E2A]/40">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key="form"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {/* Business Name */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="businessName" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      placeholder="Your business name"
                      className="mt-1 h-12 rounded-xl border-[#0B2E2A]/10 focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="email" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Business Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="vendor@business.com"
                      className="mt-1 h-12 rounded-xl border-[#0B2E2A]/10 focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </motion.div>

                  {/* Phone */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="businessPhone" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Business Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={form.businessPhone}
                      onChange={(e) => handleChange('businessPhone', e.target.value)}
                      placeholder="+233 55 514 0982"
                      className="mt-1 h-12 rounded-xl border-[#0B2E2A]/10 focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="password" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="Min. 6 characters"
                        className="h-12 rounded-xl border-[#0B2E2A]/10 pr-10 focus:ring-2 focus:ring-primary/30 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="confirmPassword" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className="h-12 rounded-xl border-[#0B2E2A]/10 pr-10 focus:ring-2 focus:ring-primary/30 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Address */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="businessAddress" className="text-[#0B2E2A] font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Business Address
                    </Label>
                    <Input
                      id="businessAddress"
                      value={form.businessAddress}
                      onChange={(e) => handleChange('businessAddress', e.target.value)}
                      placeholder="Business address"
                      className="mt-1 h-12 rounded-xl border-[#0B2E2A]/10 focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </motion.div>

                  {/* Category */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="category" className="text-[#0B2E2A] font-medium">Category</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full h-12 rounded-xl border border-[#0B2E2A]/10 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="businessDescription" className="text-[#0B2E2A] font-medium">
                      Business Description
                    </Label>
                    <textarea
                      id="businessDescription"
                      value={form.businessDescription}
                      onChange={(e) => handleChange('businessDescription', e.target.value)}
                      placeholder="Tell customers about your business..."
                      className="w-full rounded-xl border border-[#0B2E2A]/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-20 resize-vertical transition-all"
                    />
                  </motion.div>

                  {/* Terms */}
                  <motion.div variants={fadeInUp}>
                    <label className="flex items-start gap-2.5 text-sm text-[#0B2E2A]/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-primary transition-all"
                      />
                      <span>
                        I agree to the{" "}
                        <a href="#" className="text-primary font-medium hover:underline">Vendor Terms</a>{" "}
                        and{" "}
                        <a href="#" className="text-primary font-medium hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </motion.div>

                  {/* Submit */}
                  <motion.div
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2"
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20"
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
                          <Sparkles className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-[#0B2E2A]/60">
                Already have an account?{" "}
                <Link to="/vendor/login" className="text-primary font-semibold hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Perks */}
            <div className="mt-6 pt-6 border-t border-[#0B2E2A]/10 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Shield, text: "Free to get started" },
                { icon: Sparkles, text: "No commission on first 50 orders" },
                { icon: Check, text: "Instant WhatsApp integration" }
              ].map((perk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-[#0B2E2A]/60"
                >
                  <perk.icon className="w-4 h-4 text-primary shrink-0" />
                  {perk.text}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}