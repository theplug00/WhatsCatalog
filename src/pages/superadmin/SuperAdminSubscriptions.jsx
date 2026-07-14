import React, { useEffect, useState } from "react";
import { Search, CreditCard, Save, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabase";
import { toast } from "@/components/ui/use-toast";

const PLANS = ["free", "basic", "pro", "enterprise"];
const STATUSES = ["active", "expired", "cancelled", "past_due"];

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  past_due: "bg-orange-100 text-orange-700",
};

const PLAN_STYLES = {
  free: "bg-slate-100 text-slate-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-emerald-100 text-emerald-700",
};

export default function SuperAdminSubscriptions() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load vendors from Supabase
  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  // ✅ Save subscription changes
  const saveSubscription = async () => {
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          plan: editing.plan,
          subscription_status: editing.subscription_status,
          subscription_start: editing.subscription_start,
          subscription_end: editing.subscription_end,
          updated_at: new Date().toISOString()
        })
        .eq('id', editing.id);

      if (error) throw error;

      toast({
        title: "Subscription updated",
        description: `${editing.business_name}'s subscription has been updated.`,
      });

      await loadVendors();
      setEditing(null);
    } catch (err) {
      console.error('Error saving subscription:', err);
      setError('Failed to save subscription. Please try again.');
      toast({
        title: "Update failed",
        description: "Failed to save subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Filter vendors
  const filtered = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      v.business_name?.toLowerCase().includes(q) ||
      v.business_email?.toLowerCase().includes(q)
    );
  });

  // ✅ Calculate plan counts
  const planCounts = PLANS.map((plan) => ({
    plan,
    count: vendors.filter((v) => (v.plan || "free") === plan).length,
  }));

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
          Subscriptions
        </h1>
        <p className="text-[#0B2E2A]/50 mt-1">Manage vendor subscription plans and billing status</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {planCounts.map(({ plan, count }) => (
          <div key={plan} className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5">
            <p className="text-2xl font-extrabold font-heading text-[#0B2E2A]">{count}</p>
            <p className="text-xs font-semibold text-[#0B2E2A]/50 capitalize mt-1">{plan} plan</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#0B2E2A]/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4F4]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Vendor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#0B2E2A]/60 uppercase">Billing Period</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#0B2E2A]/60 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-t border-[#0B2E2A]/5 hover:bg-[#F0F4F4]/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-[#0B2E2A]">{v.business_name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">{v.business_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PLAN_STYLES[v.plan || "free"]}`}>
                      {v.plan || "free"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[v.subscription_status || "active"]}`}>
                      {v.subscription_status || "active"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#0B2E2A]/60">
                    {v.subscription_start || v.subscription_end
                      ? `${v.subscription_start || "—"} → ${v.subscription_end || "—"}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEditing({ ...v })}
                      className="px-3 h-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Manage
                    </button>
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

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2E2A]/40 backdrop-blur-sm"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-heading text-[#0B2E2A]">
                {editing.business_name}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">Plan</label>
                <select
                  value={editing.plan || "free"}
                  onChange={(e) => setEditing({ ...editing, plan: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">Status</label>
                <select
                  value={editing.subscription_status || "active"}
                  onChange={(e) => setEditing({ ...editing, subscription_status: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">Start Date</label>
                  <input
                    type="date"
                    value={editing.subscription_start || ""}
                    onChange={(e) => setEditing({ ...editing, subscription_start: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">End Date</label>
                  <input
                    type="date"
                    value={editing.subscription_end || ""}
                    onChange={(e) => setEditing({ ...editing, subscription_end: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <button
                disabled={saving}
                onClick={saveSubscription}
                className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={() => setEditing(null)}
                className="w-full h-12 rounded-xl border border-[#0B2E2A]/10 text-[#0B2E2A]/60 text-sm font-semibold hover:bg-[#F0F4F4] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}