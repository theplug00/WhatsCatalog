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

// ✅ Currency formatter
export const formatCurrency = (amount, currency = "GHS") => {
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
};

// ✅ Get plan by ID
export function getPlanById(id) {
  return VENDOR_PLANS.find((p) => p.id === id) || VENDOR_PLANS[0];
}

// ✅ Get plan by name
export function getPlanByName(name) {
  return VENDOR_PLANS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  ) || VENDOR_PLANS[0];
}

// ✅ Get default/free plan
export function getDefaultPlan() {
  return VENDOR_PLANS.find((p) => p.id === "free") || VENDOR_PLANS[0];
}

// ✅ Get available plans (exclude hidden ones)
export function getAvailablePlans() {
  return VENDOR_PLANS;
}

// ✅ Check if feature is available for a plan
export function isFeatureAvailable(planId, featureKey) {
  const plan = getPlanById(planId);
  if (!plan || !plan.limits) return false;
  
  const limit = plan.limits[featureKey];
  return limit === undefined || limit === -1 || limit > 0;
}

// ✅ Get plan limits
export function getPlanLimits(planId) {
  const plan = getPlanById(planId);
  return plan?.limits || VENDOR_PLANS[0].limits;
}

// ✅ Check if user can upgrade from current plan
export function canUpgrade(currentPlanId, targetPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  const targetIndex = plans.findIndex((p) => p.id === targetPlanId);
  return targetIndex > currentIndex;
}

// ✅ Check if user can downgrade from current plan
export function canDowngrade(currentPlanId, targetPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  const targetIndex = plans.findIndex((p) => p.id === targetPlanId);
  return targetIndex < currentIndex;
}

// ✅ Get next plan for upgrade
export function getNextPlan(currentPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  if (currentIndex === -1 || currentIndex === plans.length - 1) return null;
  return plans[currentIndex + 1];
}

// ✅ Get previous plan for downgrade
export function getPreviousPlan(currentPlanId) {
  const plans = VENDOR_PLANS;
  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
  if (currentIndex <= 0) return null;
  return plans[currentIndex - 1];
}

// ✅ Calculate price difference between plans
export function getPriceDifference(planIdA, planIdB) {
  const planA = getPlanById(planIdA);
  const planB = getPlanById(planIdB);
  return (planB?.price || 0) - (planA?.price || 0);
}

// ✅ Format price for display
export function formatPrice(planId, currency = "GHS") {
  const plan = getPlanById(planId);
  if (!plan) return "Free";
  if (plan.price === 0) return "Free";
  
  const symbols = {
    GHS: "GH₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
  };
  const symbol = symbols[currency] || symbols.GHS;
  return `${symbol}${plan.price}`;
}

// ✅ Get plan features as array
export function getPlanFeatures(planId) {
  const plan = getPlanById(planId);
  return plan?.features || [];
}

// ✅ Check if plan is free
export function isFreePlan(planId) {
  return planId === "free";
}

// ✅ Check if plan is paid
export function isPaidPlan(planId) {
  return planId !== "free";
}

// ✅ Get currency symbol
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