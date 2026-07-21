import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  Pencil,
  Loader2,
  Upload,
  Check,
  User,
} from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StoreLinkSection from "@/components/vendor/StoreLinkSection";
import { toast } from "@/components/ui/use-toast";

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");

  // ✅ Load vendor profile from Supabase
  useEffect(() => {
    const loadVendorProfile = async () => {
      setLoading(true);
      setError("");
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          console.error('No user found');
          setLoading(false);
          return;
        }

        setUser(user);

        // Get vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.warn('Vendor profile not found:', vendorError);
          setLoading(false);
          return;
        }

        setVendor(vendorData);
        setForm(vendorData);
      } catch (err) {
        console.error('Error loading vendor profile:', err);
        setError('Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };

    loadVendorProfile();
  }, []);

  // ✅ Upload logo to Supabase Storage
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploadingLogo(true);
    setError("");
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `vendor-logos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vendor-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-logos')
        .getPublicUrl(filePath);

      setLogoPreview(publicUrl);
      setForm((prev) => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully.",
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload logo. Please try again.');
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // ✅ Save vendor profile to Supabase
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update({
          business_name: form.business_name,
          owner_name: form.owner_name,
          business_phone: form.business_phone || form.phone,
          whatsapp_number: form.whatsapp_number,
          category: form.category,
          business_address: form.business_address || form.address,
          logo_url: form.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendor.id)
        .select()
        .single();

      if (error) throw error;

      setVendor(data);
      setForm(data);
      setEditing(false);
      setLogoPreview(null);
      
      toast({
        title: "Profile updated",
        description: "Your vendor profile has been updated successfully.",
      });
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save profile. Please try again.');
      toast({
        title: "Update failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="glass-card rounded-3xl p-6 text-center">
        <Store className="w-10 h-10 text-[#0B2E2A]/20 mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#0B2E2A]">
          No vendor profile found
        </p>
        <p className="text-xs text-[#0B2E2A]/50 mt-1">
          Your profile will appear here once your vendor account is set up.
        </p>
      </div>
    );
  }

  const logoSrc = editing ? (logoPreview || form.logo_url) : vendor.logo_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl overflow-hidden mb-8"
    >
      {/* Banner */}
      <div className="h-20 bg-linear-to-r from-primary/80 to-[#0B2E2A]/70" />

      {/* Error message */}
      {error && (
        <div className="mx-5 md:mx-6 mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="p-5 md:p-6">
        {/* Top row: logo + name + edit */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
          {/* Logo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-10 h-10 text-[#0B2E2A]/25" />
              )}
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
            )}
          </div>

          {/* Name + category */}
          <div className="flex-1 sm:pb-1">
            {editing ? (
              <Input
                value={form.business_name || ""}
                onChange={handleChange("business_name")}
                className="text-xl font-bold font-heading text-[#0B2E2A] h-9"
                placeholder="Business name"
              />
            ) : (
              <h2 className="text-xl font-bold font-heading text-[#0B2E2A]">
                {vendor.business_name}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              {editing ? (
                <Input
                  value={form.category || ""}
                  onChange={handleChange("category")}
                  className="text-xs h-7 max-w-40"
                  placeholder="Category"
                />
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {vendor.category || "General"}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  vendor.status === "active"
                    ? "bg-green-100 text-green-600"
                    : vendor.status === "pending"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {vendor.status === "active" ? " Approved" : vendor.status === "pending" ? "⏳ Pending" : vendor.status}
              </span>
            </div>
          </div>
          // Add store link section when vendor is approved
{vendor?.is_approved && vendor?.slug && (
  <div className="mt-4 pt-4 border-t border-[#0B2E2A]/10">
    <p className="text-xs font-semibold text-[#0B2E2A]/60 uppercase tracking-wide">Your Store</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-sm font-medium text-[#0B2E2A] truncate">
        {window.location.origin}/store/{vendor.slug}
      </span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/store/${vendor.slug}`);
          toast({ title: "Copied!" });
        }}
        className="text-xs text-primary hover:underline"
      >
        Copy
      </button>
    </div>
  </div>
)}

          {/* Edit / Save button */}
          {!editing ? (
            <Button
              onClick={() => {
                setForm(vendor);
                setLogoPreview(null);
                setEditing(true);
              }}
              variant="outline"
              className="rounded-full px-4 h-9 text-sm font-semibold"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditing(false);
                  setLogoPreview(null);
                  setForm(vendor);
                }}
                variant="outline"
                className="rounded-full px-4 h-9 text-sm"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-9 text-sm font-semibold"
                disabled={saving || uploadingLogo}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Contact details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Owner name */}
          <DetailRow
            icon={User}
            label="Owner"
            editing={editing}
            value={vendor.owner_name}
            formValue={form.owner_name}
            onChange={handleChange("owner_name")}
            placeholder="Owner name"
          />
          {/* Email */}
          <DetailRow
            icon={Mail}
            label="Email"
            editing={false}
            value={vendor.business_email || user?.email}
          />
          {/* Phone */}
          <DetailRow
            icon={Phone}
            label="Phone"
            editing={editing}
            value={vendor.business_phone}
            formValue={form.business_phone || form.phone}
            onChange={handleChange("business_phone")}
            placeholder="Phone number"
          />
          {/* WhatsApp */}
          <DetailRow
            icon={MessageCircle}
            label="WhatsApp"
            editing={editing}
            value={vendor.whatsapp_number}
            formValue={form.whatsapp_number}
            onChange={handleChange("whatsapp_number")}
            placeholder="WhatsApp number"
          />
          {/* Address */}
          <div className="sm:col-span-2">
            <DetailRow
              icon={MapPin}
              label="Address"
              editing={editing}
              value={vendor.business_address}
              formValue={form.business_address || form.address}
              onChange={handleChange("business_address")}
              placeholder="Business address"
            />
          </div>
        </div>

        {/* Store Link - Show only when approved */}
        {!editing && vendor.status === "active" && vendor.is_approved && (
          <StoreLinkSection vendorId={vendor.id} slug={vendor.slug} />
        )}
      </div>
    </motion.div>
  );
}

// ✅ Detail Row Component
function DetailRow({
  icon: Icon,
  label,
  editing,
  value,
  formValue,
  onChange,
  placeholder,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/40 border border-white/30 px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#0B2E2A]/40 uppercase tracking-wide">
          {label}
        </p>
        {editing ? (
          <Input
            value={formValue || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="h-7 text-sm mt-0.5 p-0 border-0 bg-transparent focus-visible:ring-0"
          />
        ) : (
          <p className="text-sm font-medium text-[#0B2E2A] truncate">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}