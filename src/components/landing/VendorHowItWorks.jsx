import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Package, MessageCircle, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in seconds with your email or Google. No credit card, no setup fee.",
  },
  {
    icon: Package,
    title: "Add your products",
    description:
      "Upload your catalog with photos, prices, and descriptions. Your store is live instantly.",
  },
  {
    icon: MessageCircle,
    title: "Start selling on WhatsApp",
    description:
      "Customers browse and order through chat. You manage everything from one inbox.",
  },
  {
    icon: TrendingUp,
    title: "Grow your business",
    description:
      "Track analytics, optimize pricing, and scale with insights that actually matter.",
  },
];

export default function VendorHowItWorks() {
  return (
    <section id="how" className="relative py-24 bg-gradient-to-b from-transparent to-[#E8F5EE]/50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight leading-tight">
            Live in <span className="text-gradient-emerald">4 simple steps.</span>
          </h2>
          <p className="text-lg text-[#0B2E2A]/55 mt-5 leading-relaxed">
            From sign-up to your first sale in under 10 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative glass-card rounded-2xl p-6 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-[#0B2E2A] font-heading mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#0B2E2A]/55 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}