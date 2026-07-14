import React from "react";
import { motion } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BulkEditBar({ selectedCount, onEdit, onClear }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-heavy rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3"
    >
      <span className="text-sm font-bold text-[#0B2E2A]">
        {selectedCount} selected
      </span>
      <div className="w-px h-6 bg-[#0B2E2A]/10" />
      <Button
        onClick={onEdit}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 text-sm font-semibold"
      >
        <Pencil className="w-4 h-4 mr-1" />
        Bulk Edit
      </Button>
      <Button
        onClick={onClear}
        variant="ghost"
        className="rounded-xl text-sm text-[#0B2E2A]/60 hover:text-[#0B2E2A]"
      >
        <X className="w-4 h-4 mr-1" />
        Clear
      </Button>
    </motion.div>
  );
}