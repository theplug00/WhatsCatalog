import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import CatalogGrid from "@/components/landing/CatalogGrid";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F4F4]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-brrom-primary/5 via-transparent to-[#0B2E2A]/5" />
        <div className="relative max-w-7xl mx-auto px-5 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-[#0B2E2A]/70">
                  WhatsApp-Powered Shopping
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading leading-[1.05] tracking-tight">
                <span className="text-[#0B2E2A]">Shop via</span>
                <br />
                <span className="text-gradient-emerald">Conversation.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#0B2E2A]/60 max-w-lg leading-relaxed">
                Browse our catalog, pick your favorites, and checkout — all through
                WhatsApp. Shopping made as simple as sending a message.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-base font-semibold glow-pulse shadow-xl shadow-primary/20">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Browse Catalog
                </Button>
                <Link to="/vendor">
                  <Button variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-[#0B2E2A]/15 text-[#0B2E2A] hover:bg-[#0B2E2A]/5 glass">
                    Become a Vendor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-6 pt-4">
                {[
                  { icon: ShieldCheck, text: "Secure Payments" },
                  { icon: Zap, text: "Instant Replies" },
                  { icon: Star, text: "5,000+ Happy Buyers" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                    <Icon className="w-4 h-4 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[60px] scale-90" />
                <div className="relative glass-card rounded-[2.5rem] p-3 md:p-4 max-w-sm">
                  <img
                    src="https://media.base44.com/images/public/6a383a8b348b95defff04d98/6edd9ca0b_generated_10249565.png"
                    alt="WhatsApp catalog shopping experience"
                    className="w-full rounded-4xl object-cover aspect-3/4"
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -left-6 top-1/3 glass-heavy rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg max-w-45"
                  >
                    <p className="text-xs font-medium text-[#0B2E2A]">
                      "I'd love to order this! 💚"
                    </p>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -right-4 bottom-1/4 glass-heavy rounded-xl px-4 py-2 shadow-lg"
                  >
                    <p className="text-xs text-[#0B2E2A]/60">Best Seller</p>
                    <p className="text-sm font-bold text-primary">$49.99</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <CatalogGrid />

      {/* Footer */}
      <Footer />
    </div>
  );
}