import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Truck, Clock, CreditCard, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Chat to Order",
    description: "Browse, select, and checkout all within a single WhatsApp conversation.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Multiple trusted payment options with end-to-end encrypted transactions.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Real-time tracking updates sent directly to your WhatsApp chat.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Our catalog never sleeps. Browse and order anytime, anywhere.",
  },
  {
    icon: CreditCard,
    title: "Easy Returns",
    description: "Hassle-free return process managed entirely through chat.",
  },
  {
    icon: Headphones,
    title: "Live Support",
    description: "Get instant help from our team, no bots — real human conversations.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="about" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/[0.03] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
          >
            Why Shop With Us?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#0B2E2A]/50 mt-4 max-w-lg mx-auto text-lg"
          >
            We bring the full retail experience to your favorite messaging app.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <div className="glass-card rounded-3xl p-6 md:p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0B2E2A] font-heading mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#0B2E2A]/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}