 
// src/lib/vendorPlans.js
export const VENDOR_PLANS = [
  {
    id: "free",
    name: "Starter",
    priceLabel: "Free",
    price: 0,
    currency: "GHS",
    period: "forever",
    description: "Perfect for getting started",
    popular: false,
    features: [
      "Up to 25 products",
      "WhatsApp catalog & orders",
      "Single product image per listing",
      "Basic order management",
      "Email support",
      "Basic analytics",
    ],
    limits: {
      products: 25,
      imagesPerProduct: 1,
      ordersPerMonth: 50,
      support: "email",
    },
    cta: "Start Free",
    href: "/vendor/register?plan=free",
  },
  {
    id: "basic",
    name: "Growth",
    priceLabel: "GH₵29",
    price: 29,
    currency: "GHS",
    period: "/month",
    description: "For growing WhatsApp stores",
    popular: true,
    features: [
      "Up to 100 products",
      "Multi-image galleries (5 per product)",
      "Low-stock alerts & monitoring",
      "Bulk product editing",
      "Basic analytics dashboard",
      "Priority email support",
      "Custom store URL",
    ],
    limits: {
      products: 100,
      imagesPerProduct: 5,
      ordersPerMonth: 200,
      support: "priority_email",
    },
    cta: "Start 14-Day Trial",
    href: "/vendor/register?plan=basic",
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "GH₵79",
    price: 79,
    currency: "GHS",
    period: "/month",
    description: "For high-volume sellers",
    popular: false,
    features: [
      "Unlimited products",
      "Advanced analytics & sales insights",
      "Custom store branding & logo",
      "Bulk edit & AI descriptions",
      "Priority WhatsApp support",
      "API access",
      "Export reports",
      "Multi-agent inbox",
    ],
    limits: {
      products: -1, // Unlimited
      imagesPerProduct: 10,
      ordersPerMonth: 1000,
      support: "whatsapp_priority",
    },
    cta: "Get Started",
    href: "/vendor/register?plan=pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "GH₵199",
    price: 199,
    currency: "GHS",
    period: "/month",
    description: "For large-scale operations",
    popular: false,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations & webhooks",
      "Multi-store management",
      "24/7 phone & WhatsApp support",
      "SLA guarantee",
      "Custom domain support",
      "White-label options",
    ],
    limits: {
      products: -1, // Unlimited
      imagesPerProduct: 20,
      ordersPerMonth: -1, // Unlimited
      support: "dedicated",
    },
    cta: "Contact Sales",
    href: "/vendor/register?plan=enterprise",
  },
];

export function getPlanById(id) {
  return VENDOR_PLANS.find((p) => p.id === id) || VENDOR_PLANS[0];
}

export function getPlanByName(name) {
  return VENDOR_PLANS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  ) || VENDOR_PLANS[0];
}

export function getDefaultPlan() {
  return VENDOR_PLANS.find((p) => p.id === "free") || VENDOR_PLANS[0];
}

export function getAvailablePlans() {
  return VENDOR_PLANS;
}

export function getPlanLimits(planId) {
  const plan = getPlanById(planId);
  return plan?.limits || VENDOR_PLANS[0].limits;
}

export function getPlanLimit(planId, key) {
  const limits = getPlanLimits(planId);
  return limits?.[key] ?? 0;
}

export function isUnlimited(planId, key) {
  const limit = getPlanLimit(planId, key);
  return limit === -1;
}

export function canAddMore(planId, currentCount, key) {
  if (isUnlimited(planId, key)) return true;
  const limit = getPlanLimit(planId, key);
  return currentCount < limit;
}

export function getRemaining(planId, currentCount, key) {
  if (isUnlimited(planId, key)) return Infinity;
  const limit = getPlanLimit(planId, key);
  return Math.max(0, limit - currentCount);
}

export function isFeatureAvailable(planId, featureKey) {
  const plan = getPlanById(planId);
  if (!plan || !plan.limits) return false;
  const limit = plan.limits[featureKey];
  return limit === undefined || limit === -1 || limit > 0;
}

export function canUpgrade(currentPlanId, targetPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  const targetIndex = plans.findIndex((p) => p.id === targetPlanId);
  return targetIndex > currentIndex;
}

export function canDowngrade(currentPlanId, targetPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  const targetIndex = plans.findIndex((p) => p.id === targetPlanId);
  return targetIndex < currentIndex;
}

export function getNextPlan(currentPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  if (currentIndex === -1 || currentIndex === plans.length - 1) return null;
  return plans[currentIndex + 1];
}

export function getPreviousPlan(currentPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  if (currentIndex <= 0) return null;
  return plans[currentIndex - 1];
}

export function getPriceDifference(planIdA, planIdB) {
  const planA = getPlanById(planIdA);
  const planB = getPlanById(planIdB);
  return (planB?.price || 0) - (planA?.price || 0);
}

export function formatPrice(planId, currency = "GHS") {
  const plan = getPlanById(planId);
  if (!plan) return "Free";
  if (plan.price === 0) return "Free";
  return formatCurrency(plan.price, currency);
}

export function formatCurrency(amount, currency = "GHS") {
  const symbols = {
    GHS: "GH₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
  };
  const symbol = symbols[currency] || symbols.GHS;
  if (amount === 0) return "Free";
  return `${symbol}${amount.toFixed(2)}`;
}

export function getPlanFeatures(planId) {
  const plan = getPlanById(planId);
  return plan?.features || [];
}

export function isFreePlan(planId) {
  return planId === "free";
}

export function isPaidPlan(planId) {
  return planId !== "free";
}

export function getCurrencySymbol(currency = "GHS") {
  const symbols = {
    GHS: "GH₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
  };
  return symbols[currency] || "GH₵";
}