import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowUpRight, Crown, X } from "lucide-react";
import { VENDOR_PLANS, formatCurrency, getPlanLimits } from "@/lib/VendorPlans";

export default function PlanComparison({ currentPlanId, onUpgrade, onDowngrade }) {
  // ✅ Get current plan index for comparison
  const currentPlanIndex = VENDOR_PLANS.findIndex((p) => p.id === currentPlanId);
  const currentPlan = VENDOR_PLANS[currentPlanIndex] || VENDOR_PLANS[0];

  // ✅ Check if plan is upgrade or downgrade
  const getPlanAction = (plan) => {
    const planIndex = VENDOR_PLANS.findIndex((p) => p.id === plan.id);
    if (planIndex > currentPlanIndex) return "upgrade";
    if (planIndex < currentPlanIndex) return "downgrade";
    return "current";
  };

  // ✅ Get price display
  const getPriceDisplay = (plan) => {
    if (plan.price === 0 || plan.id === "free") return "Free";
    return formatCurrency(plan.price, plan.currency || "GHS");
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {VENDOR_PLANS.map((plan, i) => {
        const isCurrent = plan.id === currentPlanId;
        const action = getPlanAction(plan);
        const isUpgrade = action === "upgrade";
        const isDowngrade = action === "downgrade";
        const planLimits = getPlanLimits(plan.id);

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col ${
              isCurrent
                ? "bg-[#0B2E2A] text-white shadow-2xl shadow-primary/20 lg:scale-[1.03] ring-2 ring-primary"
                : plan.popular
                ? "glass-card ring-1 ring-primary/30 hover:shadow-xl hover:shadow-primary/10"
                : "glass-card hover:shadow-xl hover:shadow-primary/5"
            }`}
          >
            {/* Badges */}
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                CURRENT PLAN
              </div>
            )}
            {plan.popular && !isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                MOST POPULAR
              </div>
            )}
            {isUpgrade && !isCurrent && (
              <div className="absolute -top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⬆ Upgrade
              </div>
            )}
            {isDowngrade && !isCurrent && (
              <div className="absolute -top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⬇ Downgrade
              </div>
            )}

            {/* Plan Header */}
            <div className="flex items-center gap-2 mb-1">
              {plan.id === "enterprise" ? (
                <Crown className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-amber-500"}`} />
              ) : (
                <Sparkles className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-primary"}`} />
              )}
              <h3
                className={`text-lg font-bold font-heading ${
                  isCurrent ? "text-white" : "text-[#0B2E2A]"
                }`}
              >
                {plan.name}
              </h3>
            </div>
            <p
              className={`text-xs mb-4 ${
                isCurrent ? "text-white/50" : "text-[#0B2E2A]/50"
              }`}
            >
              {plan.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-5">
              <span
                className={`text-3xl font-extrabold font-heading ${
                  isCurrent ? "text-white" : "text-[#0B2E2A]"
                }`}
              >
                {getPriceDisplay(plan)}
              </span>
              {plan.price > 0 && (
                <span
                  className={`text-sm ${
                    isCurrent ? "text-white/50" : "text-[#0B2E2A]/50"
                  }`}
                >
                  {plan.period}
                </span>
              )}
            </div>

            {/* Plan Limits Summary */}
            {planLimits && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                  isCurrent ? "bg-white/10 text-white/60" : "bg-[#0B2E2A]/5 text-[#0B2E2A]/50"
                }`}>
                  {planLimits.products === -1 ? '♾️ Products' : `📦 ${planLimits.products}`}
                </span>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                  isCurrent ? "bg-white/10 text-white/60" : "bg-[#0B2E2A]/5 text-[#0B2E2A]/50"
                }`}>
                  {planLimits.ordersPerMonth === -1 ? '♾️ Orders' : `📋 ${planLimits.ordersPerMonth}`}
                </span>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                  isCurrent ? "bg-white/10 text-white/60" : "bg-[#0B2E2A]/5 text-[#0B2E2A]/50"
                }`}>
                  🖼️ {planLimits.imagesPerProduct}
                </span>
              </div>
            )}

            {/* Features */}
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCurrent ? "bg-primary" : "bg-primary/10"
                    }`}
                  >
                    <Check
                      className={`w-2.5 h-2.5 ${
                        isCurrent ? "text-white" : "text-primary"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      isCurrent ? "text-white/75" : "text-[#0B2E2A]/65"
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            {isCurrent ? (
              <div className="w-full h-10 rounded-full bg-white/10 text-white/60 text-sm font-semibold flex items-center justify-center cursor-default">
                ✓ Current Plan
              </div>
            ) : isUpgrade ? (
              <button
                onClick={() => onUpgrade?.(plan)}
                className="w-full h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Upgrade
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : isDowngrade ? (
              <button
                onClick={() => onDowngrade?.(plan)}
                className="w-full h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 transition-all bg-amber-500 hover:bg-amber-600 text-white"
              >
                Downgrade
                <ArrowUpRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            ) : (
              <button
                onClick={() => onUpgrade?.(plan)}
                className="w-full h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 transition-all bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Select Plan
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}