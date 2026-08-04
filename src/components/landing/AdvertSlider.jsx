import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADVERTS = [
  {
    id: 1,
    title: "Mega Summer Sale",
    subtitle: "Up to 50% off everything",
    description: "Shop the season's biggest deals across every category. Limited stock available.",
    cta: "Shop Now",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/6bd091deb_generated_8d151403.png",
    badge: "Limited Time",
  },
  {
    id: 2,
    title: "New Arrivals Weekly",
    subtitle: "Fresh drops every Friday",
    description: "Be the first to discover trending products from top vendors across the globe.",
    cta: "Explore New",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/ca7033eef_generated_83b08cce.png",
    badge: "New",
  },
  {
    id: 3,
    title: "Free Delivery Weekend",
    subtitle: "On all orders via WhatsApp",
    description: "Enjoy complimentary shipping on every purchase this weekend only. No minimum spend.",
    cta: "Start Shopping",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/3738c889c_generated_e68fcdb4.png",
    badge: "This Weekend",
  },
];

export default function AdvertSlider() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % ADVERTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goTo = (idx) => setActive((idx + ADVERTS.length) % ADVERTS.length);
  const advert = ADVERTS[active];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div
          className="relative rounded-4xl overflow-hidden h-95 md:h-115 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={advert.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={advert.image}
                alt={advert.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-[#0B2E2A]/85 via-[#0B2E2A]/55 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center px-8 md:px-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={advert.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-md text-white"
              >
                <span className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  {advert.badge}
                </span>
                <p className="text-primary text-sm font-semibold mb-2">{advert.subtitle}</p>
                <h2 className="text-3xl md:text-5xl font-extrabold font-heading leading-tight mb-3">
                  {advert.title}
                </h2>
                <p className="text-white/70 text-base md:text-lg mb-6 max-w-sm">
                  {advert.description}
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 font-semibold">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {advert.cta}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <button
            onClick={() => goTo(active - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-heavy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => goTo(active + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-heavy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {ADVERTS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}