import React, { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle, Ban, Eye, X, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { supabase } from "@/api/supabase";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-slate-200 text-slate-700",
};

export default function SuperAdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const loadVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (e) {
      console.error('Error loading vendors:', e);
      setError('Failed to load vendors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const updateStatus = async (vendor, status) => {
    setUpdating(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', vendor.id);

      if (error) throw error;
      
      await loadVendors();
      if (selected && selected.id === vendor.id) {
        setSelected({ ...vendor, status });
      }
    } catch (e) {
      console.error('Error updating vendor status:', e);
      setError('Failed to update vendor status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      v.business_name?.toLowerCase().includes(q) ||
      v.business_email?.toLowerCase().includes(q) ||
      v.owner_name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Vendors
        </h1>
        <p className="text-[#0B2E2A]/50 mt-1">Review, approve, and manage vendor accounts</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-3 text-sm font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or owner..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "active", "approved", "rejected", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-11 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-white text-[#0B2E2A]/60 border border-[#0B2E2A]/10 hover:border-primary/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#0B2E2A]/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4F4]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Business</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#0B2E2A]/60 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-t border-[#0B2E2A]/5 hover:bg-[#F0F4F4]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-[#0B2E2A]">{v.business_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{v.category || "General"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#0B2E2A]">{v.owner_name || "—"}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{v.business_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-[#0B2E2A] capitalize">{v.plan || "free"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[v.status] || "bg-gray-100 text-gray-700"}`}>
                      {v.status || "pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelected(v)}
                        className="w-8 h-8 rounded-lg bg-[#F0F4F4] flex items-center justify-center text-[#0B2E2A]/60 hover:bg-primary/10 hover:text-primary transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(v.status === "pending" || v.status === "suspended") && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(v, "active")}
                          className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {v.status !== "rejected" && v.status !== "suspended" && v.status !== "pending" && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(v, "suspended")}
                          className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {v.status !== "rejected" && v.status !== "pending" && (
                        <button
                          disabled={updating}
                          onClick={() => updateStatus(v, "rejected")}
                          className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-[#0B2E2A]/40">No vendors found</p>
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="text-xs text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#0B2E2A]/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-[#0B2E2A]">Vendor Details</h2>
              <button 
                onClick={() => setSelected(null)} 
                className="w-8 h-8 rounded-full hover:bg-[#F0F4F4] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#0B2E2A]/40 hover:text-[#0B2E2A]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase">Business Name</p>
                <p className="text-base font-bold text-[#0B2E2A]">{selected.business_name}</p>
                <p className="text-sm text-[#0B2E2A]/50">{selected.category || "General"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase">Owner</p>
                  <p className="text-sm text-[#0B2E2A]">{selected.owner_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase">Status</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[selected.status] || "bg-gray-100 text-gray-700"}`}>
                    {selected.status || "pending"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#0B2E2A]/10">
                <div className="flex items-center gap-2 text-sm text-[#0B2E2A]">
                  <Mail className="w-4 h-4 text-[#0B2E2A]/40" />
                  {selected.business_email}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0B2E2A]">
                  <Phone className="w-4 h-4 text-[#0B2E2A]/40" />
                  {selected.business_phone || "—"}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#0B2E2A]">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  {selected.whatsapp_number || selected.business_phone || "—"}
                </div>
                <div className="flex items-start gap-2 text-sm text-[#0B2E2A]">
                  <MapPin className="w-4 h-4 text-[#0B2E2A]/40 mt-0.5" />
                  {selected.business_address || "—"}
                </div>
              </div>

              <div className="pt-4 border-t border-[#0B2E2A]/10">
                <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase mb-2">Subscription</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0B2E2A] capitalize">{selected.plan || "free"} plan</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    selected.subscription_status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selected.subscription_status || "active"}
                  </span>
                </div>
                {selected.subscription_start && selected.subscription_end && (
                  <p className="text-xs text-[#0B2E2A]/50 mt-1">
                    {selected.subscription_start} → {selected.subscription_end}
                  </p>
                )}
              </div>

              {selected.business_description && (
                <div className="pt-4 border-t border-[#0B2E2A]/10">
                  <p className="text-xs font-semibold text-[#0B2E2A]/50 uppercase mb-2">Description</p>
                  <p className="text-sm text-[#0B2E2A]/70">{selected.business_description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {(selected.status === "pending" || selected.status === "suspended") && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(selected, "active")}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                {selected.status !== "rejected" && selected.status !== "pending" && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(selected, "suspended")}
                    className="flex-1 h-11 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-600 hover:text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Suspend
                  </button>
                )}
                {selected.status !== "rejected" && selected.status !== "pending" && (
                  <button
                    disabled={updating}
                    onClick={() => updateStatus(selected, "rejected")}
                    className="flex-1 h-11 rounded-xl bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-600 hover:text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}