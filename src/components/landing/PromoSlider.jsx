import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROMO_CARDS = [
  {
    id: 1,
    title: "Luxury Skincare",
    subtitle: "Glow Collection",
    discount: "30% OFF",
    description: "Premium organic skincare essentials crafted for radiant skin.",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/6bd091deb_generated_8d151403.png",
    tag: "Trending",
  },
  {
    id: 2,
    title: "Fashion Accessories",
    subtitle: "Signature Edit",
    discount: "25% OFF",
    description: "Curated watches and jewelry for the modern connoisseur.",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/ca7033eef_generated_83b08cce.png",
    tag: "New Arrival",
  },
  {
    id: 3,
    title: "Tech Essentials",
    subtitle: "Smart Living",
    discount: "20% OFF",
    description: "Next-gen gadgets that blend style with functionality.",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/8228e9bc6_generated_7b3764b9.png",
    tag: "Hot Deal",
  },
  {
    id: 4,
    title: "Home & Decor",
    subtitle: "Artisan Series",
    discount: "40% OFF",
    description: "Handcrafted decor pieces to elevate your living space.",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/3738c889c_generated_e68fcdb4.png",
    tag: "Limited",
  },
  {
    id: 5,
    title: "Gourmet Delights",
    subtitle: "Epicurean Box",
    discount: "15% OFF",
    description: "Curated specialty foods and artisan treats delivered fresh.",
    image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/5cd95598c_generated_6483fc08.png",
    tag: "Exclusive",
  },
];

export default function PromoSlider() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: dir * 360, behavior: "smooth" });
    }
  };

  return (
    <section id="promos" className="relative py-20 md:py-28 overflow-hidden">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Special Offers
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
            >
              Today's Best Deals
            </motion.h2>
          </div>

          {/* Scroll controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="rounded-full w-11 h-11 glass-card border-none disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="rounded-full w-11 h-11 glass-card border-none disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-5 md:px-8 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Left spacer for centering on large screens */}
        <div className="shrink-0 w-0 lg:w-[calc((100vw-80rem)/2)]" />

        {PROMO_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="shrink-0 w-[300px] md:w-[340px] snap-start group"
          >
            <div className="glass-card rounded-3xl overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
              {/* Image with parallax overlay */}
              <div className="relative h-52 md:h-60 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Tag badge */}
                <div className="absolute top-4 left-4">
                  <span className="glass-heavy text-[#0B2E2A] text-xs font-bold px-3 py-1.5 rounded-full">
                    {card.tag}
                  </span>
                </div>

                {/* Discount badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                    {card.discount}
                  </span>
                </div>
              </div>

              {/* Card info */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {card.subtitle}
                </p>
                <h3 className="text-xl font-bold text-[#0B2E2A] font-heading">
                  {card.title}
                </h3>
                <p className="text-sm text-[#0B2E2A]/50 leading-relaxed">
                  {card.description}
                </p>

                {/* CTA – slides up on hover */}
                <motion.div
                  initial={false}
                  className="pt-2"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold h-11 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Order via WhatsApp
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Right spacer */}
        <div className="shrink-0 w-5 md:w-8 lg:w-[calc((100vw-80rem)/2)]" />
      </div>
    </section>
  );
}