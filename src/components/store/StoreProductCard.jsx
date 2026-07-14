import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGallery from "@/components/landing/ProductGallery";

export default function StoreProductCard({ product, index, onOrder }) {
  const outOfStock = (product.stock || 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="glass-card rounded-3xl overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 group">
        <div className="relative overflow-hidden">
          <ProductGallery
            images={[product.image_url, ...(product.gallery_images || [])].filter(Boolean)}
            alt={product.name}
            aspect="h-48 md:h-56"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.category && (
              <span className="glass-heavy text-[#0B2E2A] text-xs font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {outOfStock && (
              <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0B2E2A] font-heading text-base md:text-lg leading-tight">
              {product.name}
            </h3>
            <p className="text-primary font-bold text-sm whitespace-nowrap">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
          {product.description && (
            <p className="text-sm text-[#0B2E2A]/50 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
          <Button
            onClick={onOrder}
            disabled={outOfStock}
            size="sm"
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full h-9 px-4 text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            {outOfStock ? "Out of Stock" : "Order Now"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}