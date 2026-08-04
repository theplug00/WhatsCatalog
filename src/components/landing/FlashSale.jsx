import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEALS = [
  {
    id: 1,
    name: "Luxury Skincare Set",
    originalPrice: 89.99,
    salePrice: 49.99,
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/6bd091deb_generated_8d151403.png",
    soldPercent: 72,
  },
  {
    id: 2,
    name: "Signature Watch",
    originalPrice: 159.99,
    salePrice: 99.99,
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/ca7033eef_generated_83b08cce.png",
    soldPercent: 85,
  },
  {
    id: 3,
    name: "Smart Home Bundle",
    originalPrice: 199.99,
    salePrice: 129.99,
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/8228e9bc6_generated_7b3764b9.png",
    soldPercent: 60,
  },
  {
    id: 4,
    name: "Artisan Decor Set",
    originalPrice: 79.99,
    salePrice: 39.99,
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/3738c889c_generated_e68fcdb4.png",
    soldPercent: 90,
  },
];

const SALE_HOURS = 8;

function useCountdown() {
  const [remaining, setRemaining] = useState(SALE_HOURS * 3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : SALE_HOURS * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function FlashSale() {
  const time = useCountdown();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-orange-50/50 via-transparent to-transparent" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
                Flash Sale
              </h2>
              <p className="text-sm text-[#0B2E2A]/50">Grab them before they're gone</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0B2E2A]/60 mr-1">Ends in</span>
            {[
              { label: "HRS", value: time.hours },
              { label: "MIN", value: time.minutes },
              { label: "SEC", value: time.seconds },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="bg-[#0B2E2A] text-white rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold font-heading tabular-nums">
                    {pad(unit.value)}
                  </div>
                  <span className="text-[10px] font-bold text-[#0B2E2A]/40 mt-1">{unit.label}</span>
                </div>
                {i < 2 && <span className="text-xl font-bold text-[#0B2E2A]/30 -mt-4">:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Deal cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {DEALS.map((deal, i) => {
            const discount = Math.round(
              ((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100
            );
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F0F4F4]">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    -{discount}%
                  </div>
                  {/* Sold progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${deal.soldPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        {deal.soldPercent}% sold
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-[#0B2E2A] text-sm truncate mb-2">
                    {deal.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-extrabold text-primary">
                      ${deal.salePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#0B2E2A]/40 line-through">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-9 text-xs font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    Order Now
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}