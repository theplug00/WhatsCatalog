import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Gift, CreditCard } from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import CurrentPlanCard from "@/components/vendor/CurrentPlanCard";
import PlanComparison from "@/components/vendor/PlanComparison";
import { getPlanById } from "@/lib/vendorPlans";
import { toast } from "@/components/ui/use-toast";

// ✅ Support WhatsApp number
const SUPPORT_WHATSAPP = "233555140982";

export default function VendorSubscription() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastId, setToastId] = useState(null);

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

  // ✅ Auto-dismiss toast helper
  const showToast = (title, description, variant = "default", duration = 3000) => {
    // Dismiss any existing toast
    if (toastId) {
      toast.dismiss(toastId);
    }
    
    // Show new toast with auto-dismiss
    const id = toast({
      title,
      description,
      variant,
      duration, // ✅ Auto-dismiss after duration
    });
    
    setToastId(id);
    
    // Clear toastId after dismiss
    setTimeout(() => {
      setToastId(null);
    }, duration + 100);
  };

  // ✅ Get current plan
  const currentPlan = getPlanById(vendor?.plan || "free");

  // ✅ Handle upgrade request
  const handleUpgrade = (targetPlan) => {
    const vendorName = vendor?.business_name || "my business";
    const currentPlanName = currentPlan?.name || "Starter";
    const targetPlanName = targetPlan?.name || "Pro";
    const targetPrice = targetPlan?.priceLabel || "GH₵0";
    const targetPeriod = targetPlan?.period !== "forever" ? targetPlan?.period || "" : "";

    const text = `Hello! I'd like to upgrade my subscription.%0A%0A` +
      `From: ${currentPlanName}%0A` +
      `To: ${targetPlanName} (${targetPrice}${targetPeriod})%0A` +
      `Business: ${vendorName}%0A` +
      `Vendor ID: ${vendor?.id || "N/A"}`;

    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );

    // ✅ Toast with auto-dismiss - 3 seconds
    showToast(
      "Upgrade request sent",
      `We've opened WhatsApp to process your upgrade to ${targetPlanName}.`,
      "success",
      3000
    );
  };

  // ✅ Handle downgrade request
  const handleDowngrade = (targetPlan) => {
    const vendorName = vendor?.business_name || "my business";
    const currentPlanName = currentPlan?.name || "Starter";
    const targetPlanName = targetPlan?.name || "Basic";

    const text = `Hello! I'd like to downgrade my subscription.%0A%0A` +
      `From: ${currentPlanName}%0A` +
      `To: ${targetPlanName}%0A` +
      `Business: ${vendorName}%0A` +
      `Vendor ID: ${vendor?.id || "N/A"}`;

    if (confirm(`Are you sure you want to downgrade from ${currentPlanName} to ${targetPlanName}?`)) {
      window.open(
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );

      // ✅ Toast with auto-dismiss - 3 seconds
      showToast(
        "Downgrade request sent",
        `We've opened WhatsApp to process your downgrade to ${targetPlanName}.`,
        "info",
        3000
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <VendorAdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </VendorAdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <VendorAdminLayout>
        <div className="glass-card rounded-3xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-red-500" />
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

  // No vendor found
  if (!vendor) {
    return (
      <VendorAdminLayout>
        <div className="glass-card rounded-3xl p-6 text-center">
          <CreditCard className="w-10 h-10 text-[#0B2E2A]/20 mx-auto mb-3" />
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Subscription & Offers
        </h1>
        <p className="text-sm text-[#0B2E2A]/50 mt-1">
          Manage your plan and view the benefits available to you
        </p>
      </div>

      {/* Current Plan */}
      <CurrentPlanCard vendor={vendor} plan={currentPlan} />

      {/* Your Benefits */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gift className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold font-heading text-[#0B2E2A]">
            Your Benefits
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
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-[#0B2E2A]/70">
                {feature}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Available Plans */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold font-heading text-[#0B2E2A]">
            Available Plans
          </h2>
          <p className="text-sm text-[#0B2E2A]/50 mt-0.5">
            Upgrade to unlock more features and grow your business
          </p>
        </div>
        <PlanComparison
          currentPlanId={vendor.plan || "free"}
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
        />
      </section>
    </VendorAdminLayout>
  );
}