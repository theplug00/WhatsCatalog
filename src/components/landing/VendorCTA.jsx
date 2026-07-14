import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2E2A] via-[#128C7E] to-primary" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/20 blur-[80px]" />

          {/* Content */}
          <div className="relative px-6 md:px-12 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6">
              <Store className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Join 5,000+ vendors
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Ready to turn chats into sales?
            </h2>

            <p className="text-lg text-white/70 mt-5 max-w-lg mx-auto leading-relaxed">
              Start your free vendor account today. No credit card required —
              launch your WhatsApp store in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link to="/vendor/register">
                <Button
                  size="lg"
                  className="bg-white text-[#0B2E2A] hover:bg-white/90 rounded-full px-7 font-semibold text-base h-12"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/vendor/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-7 font-semibold text-base h-12"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}