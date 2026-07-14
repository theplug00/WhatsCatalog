import React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Package } from "lucide-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F0F4F4] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-[#0B2E2A]/20" />
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              product.status === "active"
                ? "bg-primary text-white"
                : "bg-[#0B2E2A]/10 text-[#0B2E2A]/50"
            }`}
          >
            {product.status === "active" ? "Active" : "Inactive"}
          </span>
          {(product.stock || 0) <= 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-md"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-md"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#0B2E2A] font-heading text-sm truncate flex-1">
            {product.name}
          </h3>
          <p className="font-bold text-primary text-sm whitespace-nowrap">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
        {product.category && (
          <span className="text-xs text-[#0B2E2A]/40">{product.category}</span>
        )}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0B2E2A]/5">
          <span
            className={`text-xs font-medium ${
              (product.stock || 0) <= 0
                ? "text-red-500"
                : (product.stock || 0) <= 5
                ? "text-amber-600"
                : "text-[#0B2E2A]/50"
            }`}
          >
            {(product.stock || 0) <= 0
              ? "Out of stock"
              : (product.stock || 0) <= 5
              ? `Low stock: ${product.stock}`
              : `Stock: ${product.stock}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}