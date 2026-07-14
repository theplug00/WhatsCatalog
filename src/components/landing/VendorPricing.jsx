import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/api/supabase";
import { toast } from "@/components/ui/use-toast";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for trying things out",
    planId: "free",
    features: [
      "Up to 25 products",
      "WhatsApp catalog",
      "Basic order management",
      "Email support",
      "Manual order tracking",
    ],
    cta: "Start Free",
    href: "/vendor/register",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    period: "/month",
    description: "For growing WhatsApp stores",
    planId: "growth",
    features: [
      "Unlimited products",
      "Payment integration",
      "Advanced analytics",
      "Unified inbox",
      "Priority support",
      "Bulk product upload",
      "Custom store branding",
    ],
    cta: "Start 14-Day Trial",
    href: "/vendor/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For high-volume sellers",
    planId: "pro",
    features: [
      "Everything in Growth",
      "Multi-agent inbox",
      "Custom branding",
      "API access",
      "Dedicated manager",
      "Advanced analytics",
      "Export reports",
    ],
    cta: "Contact Sales",
    href: "/vendor/register?plan=pro",
    highlighted: false,
  },
];

export default function VendorPricing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          // ✅ Get user's current plan
          const { data: vendor } = await supabase
            .from('vendors')
            .select('plan')
            .eq('id', user.id)
            .single();
          if (vendor) {
            setUserPlan(vendor.plan);
          }
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handlePlanSelect = async (plan) => {
    if (!isLoggedIn) {
      navigate('/vendor/register');
      return;
    }

    // ✅ If user is already on this plan, show message
    if (userPlan === plan.planId) {
      toast({
        title: "Already on this plan",
        description: `You're currently on the ${plan.name} plan.`,
      });
      navigate('/vendor/admin/subscription');
      return;
    }

    // ✅ If user is on free plan and wants to upgrade
    if (userPlan === 'free' && plan.planId !== 'free') {
      navigate('/vendor/admin/subscription', { 
        state: { upgradeTo: plan.planId } 
      });
      return;
    }

    // ✅ Default: go to registration
    navigate('/vendor/register');
  };

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-5">
            <span className="text-sm font-semibold text-[#0B2E2A]/70">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight leading-tight">
            Plans that grow
            <br />
            <span className="text-gradient-emerald">with your business.</span>
          </h2>
          <p className="text-lg text-[#0B2E2A]/55 mt-5 leading-relaxed">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = userPlan === plan.planId;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#0B2E2A] text-white shadow-2xl shadow-primary/20 lg:scale-105"
                    : "glass-card hover:shadow-xl hover:shadow-primary/5"
                } ${isCurrentPlan ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <h3
                  className={`text-lg font-bold font-heading ${
                    plan.highlighted ? "text-white" : "text-[#0B2E2A]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    plan.highlighted ? "text-white/60" : "text-[#0B2E2A]/50"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold font-heading ${
                      plan.highlighted ? "text-white" : "text-[#0B2E2A]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlighted ? "text-white/60" : "text-[#0B2E2A]/50"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "bg-primary" : "bg-primary/10"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.highlighted
                              ? "text-white"
                              : "text-primary"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm ${
                          plan.highlighted ? "text-white/80" : "text-[#0B2E2A]/70"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="block w-full mt-7"
                  disabled={loading}
                >
                  <Button
                    className={`w-full rounded-full font-semibold h-11 ${
                      isCurrentPlan
                        ? "bg-green-500 hover:bg-green-600 text-white cursor-default"
                        : plan.highlighted
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "bg-[#0B2E2A] hover:bg-[#0B2E2A]/90 text-white"
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      "✓ Current Plan"
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </button>

                {/* ✅ Show plan details for logged in users */}
                {isLoggedIn && userPlan && (
                  <p className="text-xs text-center mt-3 text-[#0B2E2A]/40">
                    Current plan: <span className="font-semibold capitalize">{userPlan}</span>
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ✅ Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          <div>
            <p className="text-2xl font-bold text-[#0B2E2A]">50+</p>
            <p className="text-sm text-[#0B2E2A]/50">Active Stores</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0B2E2A]">100%</p>
            <p className="text-sm text-[#0B2E2A]/50">Satisfaction Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0B2E2A]">24/7</p>
            <p className="text-sm text-[#0B2E2A]/50">Support Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0B2E2A]">14-Day</p>
            <p className="text-sm text-[#0B2E2A]/50">Free Trial</p>
          </div>
        </motion.div>

        {/* ✅ FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#0B2E2A]/50">
            Have questions?{" "}
            <Link to="/contact" className="text-primary hover:underline font-semibold">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}