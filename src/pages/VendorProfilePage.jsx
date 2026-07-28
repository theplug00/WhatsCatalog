import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Store, Mail, Phone, MessageCircle, MapPin, 
  Tag, Pencil, Loader2, Upload, Check, User,
  Smartphone, CreditCard, Save, X,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/api/supabase";
import VendorAdminLayout from "@/components/vendor/VendorAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

function DetailRow({ icon: Icon, label, editing, value, formValue, onChange, placeholder }) {
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

function VendorProfilePage() {
  const [vendor, setVendor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVendorProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('Please login to view your profile.');
          setLoading(false);
          return;
        }

        setUser(user);

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();

        if (vendorError) {
          console.warn('Vendor profile not found:', vendorError);
          setError('Vendor profile not found.');
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `vendor-logos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vendor-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-logos')
        .getPublicUrl(filePath);

      setLogoPreview(publicUrl);
      setForm((prev) => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully.",
        duration: 3000,
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updates = {
        business_name: form.business_name || "",
        owner_name: form.owner_name || "",
        business_phone: form.business_phone || form.phone || "",
        whatsapp_number: form.whatsapp_number || "",
        category: form.category || "",
        business_address: form.business_address || form.address || "",
        logo_url: form.logo_url || "",
        momo_number: form.momo_number || "",
        momo_network: form.momo_network || "",
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
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
        duration: 3000,
      });
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <VendorAdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </VendorAdminLayout>
    );
  }

  if (error || !vendor) {
    return (
      <VendorAdminLayout>
        <div className="glass-card rounded-3xl p-6 text-center">
          <Store className="w-10 h-10 text-[#0B2E2A]/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0B2E2A]">
            {error || "No vendor profile found"}
          </p>
          <p className="text-xs text-[#0B2E2A]/50 mt-1">
            Your profile will appear here once your vendor account is set up.
          </p>
        </div>
      </VendorAdminLayout>
    );
  }

  const logoSrc = editing ? (logoPreview || form.logo_url) : vendor.logo_url;

  return (
    <VendorAdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A] flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Profile
          </h1>
          <p className="text-sm text-[#0B2E2A]/50 mt-1">
            Manage your vendor account details
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => {
              setForm(vendor);
              setLogoPreview(null);
              setEditing(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 font-semibold"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-sm font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="h-24 bg-linear-to-r from-primary/80 to-[#0B2E2A]/70" />

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-14 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                {logoSrc ? (
                  <img src={logoSrc} alt={vendor.business_name} className="w-full h-full object-cover" />
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

            <div className="flex-1">
              {editing ? (
                <Input
                  value={form.business_name || ""}
                  onChange={handleChange("business_name")}
                  className="text-2xl font-bold font-heading text-[#0B2E2A] h-10"
                  placeholder="Business name"
                />
              ) : (
                <h2 className="text-2xl font-bold font-heading text-[#0B2E2A]">
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
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  vendor.status === "active" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-amber-100 text-amber-600"
                }`}>
                  {vendor.status === "active" ? "Active" : "Pending"}
                </span>
              </div>
            </div>

            {editing && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setEditing(false);
                    setLogoPreview(null);
                    setForm(vendor);
                  }}
                  variant="outline"
                  className="rounded-full px-4 h-9"
                  disabled={saving}
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 h-9 font-semibold"
                  disabled={saving || uploadingLogo}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow
              icon={User}
              label="Owner"
              editing={editing}
              value={vendor.owner_name}
              formValue={form.owner_name}
              onChange={handleChange("owner_name")}
              placeholder="Owner name"
            />
            <DetailRow
              icon={Mail}
              label="Email"
              editing={false}
              value={vendor.business_email || user?.email}
              formValue=""
              onChange={() => {}}
              placeholder=""
            />
            <DetailRow
              icon={Phone}
              label="Phone"
              editing={editing}
              value={vendor.business_phone}
              formValue={form.business_phone || form.phone}
              onChange={handleChange("business_phone")}
              placeholder="Phone number"
            />
            <DetailRow
              icon={MessageCircle}
              label="WhatsApp"
              editing={editing}
              value={vendor.whatsapp_number}
              formValue={form.whatsapp_number}
              onChange={handleChange("whatsapp_number")}
              placeholder="WhatsApp number"
            />
            <div className="md:col-span-2">
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
            <DetailRow
              icon={Smartphone}
              label="MoMo Number"
              editing={editing}
              value={vendor.momo_number}
              formValue={form.momo_number}
              onChange={handleChange("momo_number")}
              placeholder="024XXXXXXX"
            />
            <DetailRow
              icon={CreditCard}
              label="MoMo Network"
              editing={editing}
              value={vendor.momo_network}
              formValue={form.momo_network}
              onChange={handleChange("momo_network")}
              placeholder="MTN / Vodafone / AirtelTigo"
            />
          </div>
        </div>
      </div>
    </VendorAdminLayout>
  );
}

// ✅ FIXED: CORRECT EXPORT
export default VendorProfilePage;