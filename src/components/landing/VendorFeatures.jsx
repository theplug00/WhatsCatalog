import React from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  ShoppingCart,
  CreditCard,
  BarChart3,
  MessagesSquare,
  Bell,
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Catalog Management",
    description:
      "Upload products, set prices, and organize collections in minutes. Your storefront updates instantly on WhatsApp.",
  },
  {
    icon: ShoppingCart,
    title: "Order Automation",
    description:
      "Customers browse, order, and pay — all through chat. Every order is tracked from inquiry to delivery.",
  },
  {
    icon: CreditCard,
    title: "Built-in Payments",
    description:
      "Accept payments securely with integrated checkout. No separate payment gateway or manual reconciliation.",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description:
      "Real-time dashboards show revenue, top products, and customer trends so you can grow smarter.",
  },
  {
    icon: MessagesSquare,
    title: "Unified Inbox",
    description:
      "Every customer conversation in one place. Reply fast, never miss a message, and build loyalty.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Get instant alerts for new orders, payments, and customer messages — so you never miss a sale.",
  },
];

export default function VendorFeatures() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />

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
              Everything you need
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight leading-tight">
            One dashboard to run your
            <br />
            <span className="text-gradient-emerald">entire store.</span>
          </h2>
          <p className="text-lg text-[#0B2E2A]/55 mt-5 leading-relaxed">
            Powerful tools that replace a dozen apps — built specifically for
            WhatsApp-first commerce.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-[#0B2E2A] font-heading mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#0B2E2A]/55 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}