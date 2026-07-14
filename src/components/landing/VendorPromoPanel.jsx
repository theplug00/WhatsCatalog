import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Store,
  Zap,
  BarChart3,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant WhatsApp Store",
    description: "Launch your catalog on WhatsApp in under 5 minutes — no coding needed.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track orders, revenue, and customer insights as they happen.",
  },
  {
    icon: Users,
    title: "Customer CRM",
    description: "Manage conversations and build lasting relationships in one inbox.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Accept payments with bank-grade encryption and fraud protection.",
  },
];

export default function VendorPromoPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 z-10 overflow-y-auto">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 w-fit">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0B2E2A] font-heading">
          Whats<span className="text-primary">Catalog</span>
        </span>
      </Link>

      {/* Main content */}
      <div className="space-y-8 py-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 w-fit"
        >
          <Store className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-[#0B2E2A]/70">
            Vendor Portal
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl xl:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight leading-[1.15]">
            Grow your business
            <br />
            through{" "}
            <span className="text-gradient-emerald">conversations.</span>
          </h1>
          <p className="text-lg text-[#0B2E2A]/55 max-w-md leading-relaxed mt-5">
            Join thousands of vendors selling directly to customers via WhatsApp.
            Everything you need to run your store — in one place.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-[#0B2E2A] text-sm font-heading">
                {feature.title}
              </h3>
              <p className="text-xs text-[#0B2E2A]/50 mt-1 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-[#0B2E2A]/70 leading-relaxed text-sm italic">
            "Switching to WhatsCatalog tripled my orders in the first month.
            Customers love ordering through WhatsApp — it's that easy."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#0B2E2A] flex items-center justify-center text-white font-bold text-sm">
              SK
            </div>
            <div>
              <p className="font-semibold text-[#0B2E2A] text-sm">Sarah K.</p>
              <p className="text-xs text-[#0B2E2A]/50">Founder, Bloom Accessories</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#0B2E2A]/40">
          © {new Date().getFullYear()} WhatsCatalog
        </p>
        <Link
          to="/"
          className="text-sm text-[#0B2E2A]/50 hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
        >
          Back to store
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}