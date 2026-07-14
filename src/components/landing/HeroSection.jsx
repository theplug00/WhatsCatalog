import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_BG = "https://media.base44.com/images/public/6a383a8b348b95defff04d98/93bd8f6a3_generated_bdac4038.png";
const PHONE_IMG = "https://media.base44.com/images/public/6a383a8b348b95defff04d98/6edd9ca0b_generated_10249565.png";

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
          alt="Abstract emerald glass spheres"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-brm-[#F0F4F4]/90 via-[#F0F4F4]/70 to-[#c8ebd7]/50" />
      </div>

      {/* Floating decorative orbs */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-[10%] w-40 h-40 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[15%] w-56 h-56 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 pb-16 md:pt-0 md:pb-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-[#0B2E2A]/70">
                WhatsApp-Powered Shopping
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading leading-[1.05] tracking-tight">
              <span className="text-[#0B2E2A]">Shop via</span>
              <br />
              <span className="text-gradient-emerald">Conversation.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[#0B2E2A]/60 max-w-lg leading-relaxed">
              Browse our catalog, pick your favorites, and checkout — all through
              WhatsApp. Shopping made as simple as sending a message.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-14 text-base font-semibold glow-pulse shadow-xl shadow-primary/20"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Browse Catalog
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base font-semibold border-[#0B2E2A]/15 text-[#0B2E2A] hover:bg-[#0B2E2A]/5 glass"
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
                <div key={text} className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[60px] scale-90" />

              {/* Glass frame */}
              <div className="relative glass-card rounded-[2.5rem] p-3 md:p-4 max-w-85 md:max-w-95">
                <img
                  src={PHONE_IMG}
                  alt="WhatsApp catalog shopping experience"
                  className="w-full rounded-4xl object-cover aspect-3/4"
                />

                {/* Floating chat bubble */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -left-6 top-1/3 glass-heavy rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg max-w-45"
                >
                  <p className="text-xs font-medium text-[#0B2E2A]">
                    "I'd love to order the emerald necklace! 💚"
                  </p>
                </motion.div>

                {/* Floating price tag */}
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
  );
}