import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Check, Gift, CreditCard, Crown, 
  Sparkles, TrendingUp, Clock, Shield, Zap,
  BarChart3, Users, Package, DollarSign,
  ArrowRight, ChevronRight, X, CheckCircle,
  AlertCircle, Calendar, Download, Printer,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import CurrentPlanCard from "@/components/vendor/CurrentPlanCard";
import PlanComparison from "@/components/vendor/PlanComparison";
import { getPlanById, getPlanLimits, VENDOR_PLANS } from "../lib/vendorPlans";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// ============================================
// SUPPORT WHATSAPP NUMBER
// ============================================
const SUPPORT_WHATSAPP = "233555140982";

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function VendorSubscription() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState("overview"); // overview | plans

  // ✅ Load vendor profile from Supabase
  useEffect(() => {
    const loadVendor = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('Please login to view your subscription.');
          setLoading(false);
          return;
        }

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.warn('Vendor not found:', vendorError);
          setError('Vendor profile not found. Please complete your registration.');
          setLoading(false);
          return;
        }

        setVendor(vendorData);
      } catch (err) {
        console.error('Error loading vendor:', err);
        setError('Failed to load vendor profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadVendor();
  }, []);

  // ✅ Get current plan
  const currentPlan = getPlanById(vendor?.plan || "free");
  const planLimits = getPlanLimits(vendor?.plan || "free");

  // ✅ Handle upgrade request
  const handleUpgrade = (targetPlan) => {
    setSelectedPlan(targetPlan);
    setShowConfirmModal(true);
  };

  // ✅ Handle downgrade request
  const handleDowngrade = (targetPlan) => {
    setSelectedPlan(targetPlan);
    setShowConfirmModal(true);
  };

  // ✅ Get plan index
  const getPlanIndex = (planId) => {
    return VENDOR_PLANS.findIndex(p => p.id === planId);
  };

  // ✅ Confirm plan change
  const confirmPlanChange = async () => {
    setProcessing(true);
    try {
      const vendorName = vendor?.business_name || "my business";
      const currentPlanName = currentPlan?.name || "Starter";
      const targetPlanName = selectedPlan?.name || "Pro";
      const targetPrice = selectedPlan?.priceLabel || "GH₵0";
      const targetPeriod = selectedPlan?.period !== "forever" ? selectedPlan?.period || "" : "";

      const isUpgrade = getPlanIndex(selectedPlan?.id) > getPlanIndex(vendor?.plan || "free");
      
      const text = `Hello! I'd like to ${isUpgrade ? 'upgrade' : 'downgrade'} my subscription.%0A%0A` +
        `From: ${currentPlanName}%0A` +
        `To: ${targetPlanName} (${targetPrice}${targetPeriod})%0A` +
        `Business: ${vendorName}%0A` +
        `Vendor ID: ${vendor?.id || "N/A"}`;

      window.open(
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );

      toast({
        title: isUpgrade ? "Upgrade request sent" : "Downgrade request sent",
        description: `We've opened WhatsApp to process your request to ${targetPlanName}.`,
        duration: 4000,
      });

      setShowConfirmModal(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Error processing plan change:', err);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <VendorAdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </VendorAdminLayout>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <VendorAdminLayout>
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </VendorAdminLayout>
    );
  }

  // ✅ No vendor found
  if (!vendor) {
    return (
      <VendorAdminLayout>
        <div className="glass-card rounded-3xl p-8 text-center">
          <CreditCard className="w-12 h-12 text-[#0B2E2A]/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0B2E2A]">
            No vendor profile found
          </p>
          <p className="text-xs text-[#0B2E2A]/50 mt-1">
            Your subscription details will appear here once your account is set up.
          </p>
        </div>
      </VendorAdminLayout>
    );
  }

  return (
    <VendorAdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.div {...fadeInUp}>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            Subscription
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Manage your plan and unlock more features
          </p>
        </motion.div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === "overview" 
                ? "bg-primary text-white" 
                : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView("plans")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === "plans" 
                ? "bg-primary text-white" 
                : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10"
            }`}
          >
            All Plans
          </button>
        </div>
      </div>

      {/* Overview View */}
      {view === "overview" && (
        <motion.div {...fadeInUp}>
          {/* Current Plan Card */}
          <CurrentPlanCard vendor={vendor} plan={currentPlan} />

          {/* Plan Usage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B2E2A]">Products</p>
                  <p className="text-xs text-[#0B2E2A]/50">Available products</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0B2E2A]">
                {planLimits?.products === -1 ? '♾️' : planLimits?.products || 25}
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B2E2A]">Support</p>
                  <p className="text-xs text-[#0B2E2A]/50">Response time</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0B2E2A] capitalize">
                {planLimits?.support || 'email'}
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B2E2A]">Plan Status</p>
                  <p className="text-xs text-[#0B2E2A]/50">Current period</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0B2E2A] capitalize">
                {vendor?.subscription_status || 'active'}
              </p>
            </motion.div>
          </div>

          {/* Features */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold font-heading text-[#0B2E2A]">
                Plan Features
              </h2>
              <span className="text-xs text-[#0B2E2A]/40 ml-2">
                ({currentPlan.features.length} features)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentPlan.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-[#0B2E2A]/70">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setView("plans")}
              className="bg-primary text-white rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-semibold">Upgrade Plan</p>
            </button>
            <button
              onClick={() => {
                const text = `Hello! I need help with my subscription.%0A%0APlan: ${currentPlan.name}%0ABusiness: ${vendor?.business_name}`;
                window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, "_blank");
              }}
              className="bg-[#25D366] text-white rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg"
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-semibold">Contact Support</p>
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Invoice generated",
                  description: "Your invoice is being prepared.",
                  duration: 3000,
                });
              }}
              className="bg-purple-500 text-white rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg"
            >
              <Download className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-semibold">Invoice</p>
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Feature request sent",
                  description: "We'll review your request.",
                  duration: 3000,
                });
              }}
              className="bg-amber-500 text-white rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-lg"
            >
              <Sparkles className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-semibold">Request Feature</p>
            </button>
          </div>
        </motion.div>
      )}

      {/* Plans View */}
      {view === "plans" && (
        <motion.div {...fadeInUp}>
          <div className="mb-6">
            <p className="text-sm text-[#0B2E2A]/50">
              Compare plans and choose the best one for your business
            </p>
          </div>
          <PlanComparison
            currentPlanId={vendor.plan || "free"}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
          />
        </motion.div>
      )}

      {/* ============================================ */}
      {/* CONFIRM MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showConfirmModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-[#0B2E2A]/40 backdrop-blur-sm"
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedPlan(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E2A]">
                    {getPlanIndex(selectedPlan.id) > getPlanIndex(vendor?.plan || "free") 
                      ? 'Upgrade Plan' 
                      : 'Downgrade Plan'}
                  </h2>
                  <p className="text-sm text-[#0B2E2A]/50">
                    Confirm your plan change
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedPlan(null);
                  }}
                  className="p-2 hover:bg-[#F0F4F4] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#0B2E2A]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#0B2E2A]/40">Current Plan</p>
                      <p className="font-semibold text-[#0B2E2A]">{currentPlan.name}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-[#0B2E2A]/40">New Plan</p>
                      <p className="font-semibold text-[#0B2E2A]">{selectedPlan.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {getPlanIndex(selectedPlan.id) > getPlanIndex(vendor?.plan || "free") 
                        ? 'You will be upgraded to the new plan. Your billing will be adjusted accordingly.'
                        : 'You will be downgraded to the new plan. Some features may be removed.'}
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedPlan(null);
                    }}
                    variant="outline"
                    className="flex-1 rounded-xl"
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmPlanChange}
                    className={`flex-1 rounded-xl text-white font-semibold ${
                      getPlanIndex(selectedPlan.id) > getPlanIndex(vendor?.plan || "free")
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </VendorAdminLayout>
  );
}