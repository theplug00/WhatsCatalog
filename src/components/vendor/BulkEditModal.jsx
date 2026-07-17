import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BulkEditModal({ selectedCount, onApply, onClose }) {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const hasChanges = price !== "" || stock !== "" || status !== "";

  const handleApply = async () => {
    if (!hasChanges) return;
    setSaving(true);
    const updates = {};
    if (price !== "") updates.price = Number(price);
    if (stock !== "") updates.stock = Number(stock);
    if (status !== "") updates.status = status;
    await onApply(updates);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0B2E2A]/40 hover:text-[#0B2E2A]"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0B2E2A]">Bulk Edit</h3>
            <p className="text-xs text-[#0B2E2A]/50">
              Updating {selectedCount} {selectedCount === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        <p className="text-sm text-[#0B2E2A]/50 mb-4">
          Only fill in the fields you want to update. Leave the rest unchanged.
        </p>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Price
            </Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Leave unchanged"
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Stock Quantity
            </Label>
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Leave unchanged"
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Status
            </Label>
            <div className="flex gap-2">
              {[
                { value: "", label: "Unchanged" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ].map((opt) => (
                <button
                  key={opt.value || "unchanged"}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    status === opt.value
                      ? opt.value === "active"
                        ? "bg-primary text-white"
                        : opt.value === "inactive"
                        ? "bg-[#0B2E2A] text-white"
                        : "bg-primary/10 text-primary"
                      : "glass-card text-[#0B2E2A]/50 hover:text-[#0B2E2A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!hasChanges || saving}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
          >
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Apply to {selectedCount}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}