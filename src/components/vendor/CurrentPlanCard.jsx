import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/VendorPlans";

const PLAN_GRADIENTS = {
  free: "bg-gradient-to-br from-slate-500 to-slate-700",
  basic: "bg-gradient-to-br from-blue-500 to-blue-700",
  pro: "bg-gradient-to-br from-purple-500 to-purple-700",
  enterprise: "bg-gradient-to-br from-emerald-500 to-emerald-700",
};

const STATUS_STYLES = {
  active: { dot: "bg-emerald-300", label: "Active", color: "text-emerald-600" },
  expired: { dot: "bg-amber-300", label: "Expired", color: "text-amber-600" },
  cancelled: { dot: "bg-red-300", label: "Cancelled", color: "text-red-600" },
  past_due: { dot: "bg-orange-300", label: "Past Due", color: "text-orange-600" },
  trial: { dot: "bg-blue-300", label: "Trial", color: "text-blue-600" },
};

export default function CurrentPlanCard({ vendor, plan }) {
  const status = vendor?.subscription_status || "active";
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;

  // ✅ Calculate days remaining
  const daysRemaining = vendor?.subscription_end
    ? Math.max(
        0,
        Math.ceil(
          (new Date(vendor.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const isExpired = status === "expired" || status === "cancelled";

  // ✅ Check if on free plan
  const isFreePlan = plan?.id === "free";

  // ✅ Format date display
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ✅ Get price display
  const getPriceDisplay = () => {
    if (!plan) return "Free";
    if (plan.price === 0 || plan.id === "free") return "Free";
    return formatCurrency(plan.price, plan.currency || "GHS");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden mb-8 shadow-xl shadow-primary/5"
    >
      {/* Header with gradient */}
      <div className={`${PLAN_GRADIENTS[plan?.id] || PLAN_GRADIENTS.free} p-6 md:p-8 text-white`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Current Plan
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold font-heading">{plan?.name || "Starter"}</h2>
            <p className="text-white/70 text-sm mt-1">{plan?.description || "Basic plan"}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-4xl font-extrabold font-heading">
                {getPriceDisplay()}
              </span>
              {plan?.period !== "forever" && plan?.id !== "free" && (
                <span className="text-sm text-white/60">{plan?.period || "/month"}</span>
              )}
            </div>
            {!isFreePlan && (
              <p className="text-xs text-white/50 mt-1">
                {plan?.currency || "GHS"} per month
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="glass-heavy p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Billing Period */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#0B2E2A]/40 uppercase tracking-wide">
              Billing Period
            </p>
            <p className="text-sm font-semibold text-[#0B2E2A] truncate">
              {isFreePlan ? (
                "No billing"
              ) : vendor?.subscription_start || vendor?.subscription_end ? (
                `${formatDate(vendor.subscription_start)} → ${formatDate(vendor.subscription_end)}`
              ) : (
                "No expiration"
              )}
            </p>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#0B2E2A]/40 uppercase tracking-wide">
              Days Remaining
            </p>
            <p className={`text-sm font-semibold ${isExpired ? 'text-red-500' : 'text-[#0B2E2A]'}`}>
              {isFreePlan ? (
                "Unlimited"
              ) : daysRemaining !== null ? (
                isExpired ? (
                  "Expired"
                ) : daysRemaining === 0 ? (
                  "Expires today"
                ) : (
                  `${daysRemaining} days`
                )
              ) : (
                "Unlimited"
              )}
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {isExpired ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : isFreePlan ? (
              <CreditCard className="w-4 h-4 text-primary" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#0B2E2A]/40 uppercase tracking-wide">
              Account Status
            </p>
            <p className={`text-sm font-semibold ${isExpired ? 'text-red-500' : 'text-[#0B2E2A]'}`}>
              {isFreePlan 
                ? "Free plan active" 
                : isExpired 
                ? "Renewal needed" 
                : status === "trial"
                ? "Trial period active"
                : "All features active"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Plan Limits Summary */}
      {plan?.limits && (
        <div className="bg-white/40 px-5 md:px-6 py-3 border-t border-[#0B2E2A]/5">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-[#0B2E2A]/40 uppercase tracking-wide">
              Plan Limits:
            </span>
            <span className="text-[#0B2E2A]/60">
              {plan.limits.products === -1 ? '♾️ Unlimited' : `📦 ${plan.limits.products} products`}
            </span>
            <span className="text-[#0B2E2A]/60">
              {plan.limits.ordersPerMonth === -1 ? '♾️ Unlimited' : `📋 ${plan.limits.ordersPerMonth} orders/mo`}
            </span>
            <span className="text-[#0B2E2A]/60">
              🖼️ {plan.limits.imagesPerProduct} images/product
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}