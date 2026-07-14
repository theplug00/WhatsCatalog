import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTABanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2E2A] via-[#134e3a] to-[#25D366]/80" />

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 blur-[60px]" />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-white/80">
                Start Shopping Now
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold font-heading text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Ready to Shop via{" "}
              <span className="text-primary">WhatsApp?</span>
            </h2>

            <p className="text-white/60 mt-5 max-w-xl mx-auto text-lg">
              Join thousands of happy customers who shop smarter through conversations.
              One message is all it takes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 h-14 text-base font-semibold glow-pulse shadow-xl shadow-primary/30"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Open WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 h-14 text-base font-semibold border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                View Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}