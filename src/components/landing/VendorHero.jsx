import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Store,
  Zap,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorHero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F4F4] via-[#E8F5EE] to-[#F0F4F4]" />
      <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#0B2E2A]/5 blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left content */}
        <div className="space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 w-fit"
          >
            <Store className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-[#0B2E2A]/70">
              For Vendors & Sellers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold font-heading text-[#0B2E2A] tracking-tight leading-[1.1]"
          >
            Turn WhatsApp into your
            <br />
            <span className="text-gradient-emerald">#1 sales channel.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#0B2E2A]/55 max-w-lg leading-relaxed"
          >
            Launch your catalog, manage orders, and chat with customers — all from
            one powerful vendor dashboard. No app, no website, no hassle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link to="/vendor/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-7 glow-pulse font-semibold text-base h-12"
              >
                Start Selling Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/vendor/login">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-7 font-semibold text-base h-12 border-[#0B2E2A]/15 text-[#0B2E2A] hover:bg-primary/5"
              >
                Vendor Log In
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["#25D366", "#0B2E2A", "#128C7E", "#075E54"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#0B2E2A]/60 font-medium">
                5,000+ vendors
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-[#0B2E2A]/60 font-medium">
                4.9/5 rating
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right visual mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative hidden lg:flex justify-center"
        >
          <div className="relative w-80">
            {/* Phone frame */}
            <div className="relative w-full aspect-[9/19] rounded-[2.5rem] bg-[#0B2E2A] p-3 shadow-2xl shadow-primary/20">
              <div className="w-full h-full rounded-[2rem] bg-gradient-to-b from-[#E8F5EE] to-[#F0F4F4] overflow-hidden flex flex-col">
                {/* Chat header */}
                <div className="bg-primary px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">My Store</p>
                    <p className="text-white/70 text-xs">online</p>
                  </div>
                </div>
                {/* Chat body */}
                <div className="flex-1 p-3 space-y-2">
                  <div className="bg-white rounded-xl rounded-tl-sm p-2.5 max-w-[80%] shadow-sm">
                    <p className="text-xs text-[#0B2E2A]">Hi! I'd like to order the blue sneakers 🥿</p>
                  </div>
                  <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm p-2.5 max-w-[80%] ml-auto shadow-sm">
                    <p className="text-xs text-[#0B2E2A]">Great choice! That's $49. Shall I confirm your order? ✅</p>
                  </div>
                  <div className="bg-white rounded-xl rounded-tl-sm p-2.5 max-w-[80%] shadow-sm">
                    <p className="text-xs text-[#0B2E2A]">Yes please! 🙌</p>
                  </div>
                  <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm p-2.5 max-w-[80%] ml-auto shadow-sm">
                    <p className="text-xs text-[#0B2E2A]">Order confirmed! Track it here 👇</p>
                  </div>
                </div>
                {/* Input bar */}
                <div className="p-2.5 flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5">
                    <p className="text-xs text-[#0B2E2A]/40">Type a message...</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-12 top-1/4 glass-heavy rounded-2xl p-3 shadow-xl w-40"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2E2A]">+34% sales</p>
                  <p className="text-[10px] text-[#0B2E2A]/50">this month</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -right-8 bottom-1/4 glass-heavy rounded-2xl p-3 shadow-xl w-36"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B2E2A]/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#0B2E2A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2E2A]">Order #1042</p>
                  <p className="text-[10px] text-primary font-semibold">New order!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}