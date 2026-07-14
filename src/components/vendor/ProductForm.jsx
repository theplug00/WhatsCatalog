import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, ImageIcon, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/api/supabase";

const CATEGORIES = ["Fashion", "Electronics", "Home", "Beauty", "Food", "Sports", "Other"];

export default function ProductForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    category: initialData?.category || "General",
    stock: initialData?.stock ?? 0,
    status: initialData?.status || "active",
  });
  const [images, setImages] = useState(() => {
    const all = [];
    if (initialData?.image_url) all.push(initialData.image_url);
    if (initialData?.gallery_images) all.push(...initialData.gallery_images);
    return all;
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Upload multiple images to Supabase Storage
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB");
        return;
      }
    }

    setUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          // Upload to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `¢{Date.now()}_¢{Math.random().toString(36).substring(2)}.¢{fileExt}`;
          const filePath = `products/¢{fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Upload error:', err);
      setError("Failed to upload one or more images. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImageToFront = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const [img] = next.splice(idx, 1);
      return [img, ...next];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        status: form.status,
        image_url: images[0] || "",
        gallery_images: images.slice(1),
      });
    } catch (err) {
      console.error('Save error:', err);
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm" onClick={onCancel} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0B2E2A] font-heading">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full hover:bg-[#0B2E2A]/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#0B2E2A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image gallery upload */}
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-2 block">
              Product Images
            </Label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt={`Product ¢{idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => moveImageToFront(idx)}
                          className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          title="Set as cover"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="relative flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-[#0B2E2A]/15 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all overflow-hidden">
              <div className="flex flex-col items-center gap-2 text-[#0B2E2A]/40">
                {uploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                )}
                <p className="text-sm font-medium">
                  {uploading ? "Uploading..." : images.length ? "Add more images" : "Click to upload images"}
                </p>
                <p className="text-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> First image becomes the cover · up to 5MB each
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Product Name <span className="text-primary">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Blue Sneakers"
              className="rounded-xl"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
                Price (¢) <span className="text-primary">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="49.99"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
                Stock
              </Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Category
            </Label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your product..."
              className="rounded-xl min-h-20"
            />
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium text-[#0B2E2A] mb-1.5 block">
              Status
            </Label>
            <div className="flex gap-2">
              {["active", "inactive"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange("status", s)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ¢{
                    form.status === s
                      ? "bg-primary text-white"
                      : "glass-card text-[#0B2E2A]/60 hover:text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-xl"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
              disabled={saving || uploading}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                initialData ? "Save Changes" : "Add Product"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}