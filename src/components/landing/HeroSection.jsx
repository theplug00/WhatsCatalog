import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_BG = "https://media.base44.com/images/public/6a383a8b348b95defff04d98/b0833ac03_generated_image.png";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="E-commerce shopping background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#F0F4F4]/75 via-[#F0F4F4]/45 to-[#c8ebd7]/25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 pb-16 md:pt-0 md:pb-0 w-full">
        <div className="flex items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 max-w-2xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 glass-heavy rounded-full px-4 py-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-[#0B2E2A]/80">
                WhatsApp-Powered Shopping
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black font-heading leading-[1.05] tracking-tight drop-shadow-md">
              <span className="text-[#0B2E2A]">Shop via</span>
              <br />
              <span className="text-gradient-emerald">Conversation.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[#0B2E2A]/80 max-w-lg leading-relaxed font-medium drop-shadow-sm">
              Browse our catalog, pick your favorites, and checkout — all through
              WhatsApp. Shopping made as simple as sending a message.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-14 text-base font-bold glow-pulse shadow-xl shadow-primary/20"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Browse Catalog
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base font-bold border-[#0B2E2A]/15 text-[#0B2E2A] hover:bg-[#0B2E2A]/5 glass-heavy"
              >
                How It Works
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: ShieldCheck, text: "Secure Payments" },
                { icon: Zap, text: "Instant Replies" },
                { icon: Star, text: "5,000+ Happy Buyers" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm font-semibold text-[#0B2E2A]/70">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}