import React from "react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { id: 1, name: "Skincare", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/bca6582cf_generated_image.png" },
  { id: 2, name: "Fashion", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/1d51200b7_generated_image.png" },
  { id: 3, name: "Electronics", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/17139a6d0_generated_image.png" },
  { id: 4, name: "Home & Decor", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/514bdd3eb_generated_image.png" },
  { id: 5, name: "Food & Drink", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/e672136d0_generated_image.png" },
  { id: 6, name: "Health", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/621d4a9a1_generated_image.png" },
  { id: 7, name: "Sports", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/82b9b1d0a_generated_image.png" },
  { id: 8, name: "Beauty", image: "https://media.base44.com/images/public/6a383a8b348b95defff04d98/c99e3bbc3_generated_image.png" },
];

export default function ShopByCategory() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-[#0B2E2A] tracking-tight"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#0B2E2A]/50 mt-4 max-w-lg mx-auto text-lg"
          >
            Find exactly what you're looking for across our curated collections.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative rounded-2xl overflow-hidden cursor-pointer group h-36 md:h-44 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0B2E2A]/80 via-[#0B2E2A]/20 to-transparent" />
                <h3 className="absolute bottom-3 left-0 right-0 text-center font-bold text-white text-sm md:text-base drop-shadow-md">
                  {cat.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}