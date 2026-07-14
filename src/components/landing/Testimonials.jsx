import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Verified Buyer",
    rating: 5,
    text: "Absolutely love the quality and the seamless ordering process. I placed my order through WhatsApp and got a response within minutes. Will definitely shop again!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "James Okoro",
    role: "Repeat Customer",
    rating: 5,
    text: "The catalog is easy to browse and the products are exactly as described. The WhatsApp checkout is so convenient — no fuss, just fast and friendly service.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Aisha Khan",
    role: "Verified Buyer",
    rating: 5,
    text: "Beautiful packaging, quick delivery, and outstanding customer support. This is how online shopping should feel. Highly recommend to everyone.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4"
          >
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-primary">
              Loved by Customers
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#0B2E2A]/50 mt-4 max-w-lg mx-auto text-lg"
          >
            Real stories from happy shoppers who trust our catalog for their everyday needs.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass-card rounded-3xl p-6 md:p-7 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-[#0B2E2A]/70 text-sm md:text-base leading-relaxed flex-1">
                {t.text}
              </p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#0B2E2A]/10">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-[#0B2E2A] text-sm font-heading">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#0B2E2A]/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}