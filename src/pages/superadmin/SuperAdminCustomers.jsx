import React, { useEffect, useState, useMemo } from "react";
import { Search, MessageCircle, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/api/supabase";

export default function SuperAdminCustomers() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_date', { ascending: false });

        if (error) throw error;
        setOrders(data);
      } catch (e) {
        console.error('Error fetching orders:', e);
        setError('Failed to load customers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Aggregate unique customers by phone - memoized for performance
  const customers = useMemo(() => {
    const customerMap = new Map();
    
    orders.forEach((o) => {
      const key = o.customer_phone || o.customer_name || 'unknown';
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: o.customer_name || 'Unknown',
          phone: o.customer_phone || '',
          address: o.delivery_address || '',
          notes: o.notes || '',
          orderCount: 0,
          totalSpent: 0,
          firstOrder: o.created_date,
          lastOrder: o.created_date,
        });
      }
      const c = customerMap.get(key);
      c.orderCount += 1;
      c.totalSpent += parseFloat(o.total_price) || 0;
      if (!c.address && o.delivery_address) c.address = o.delivery_address;
      if (o.created_date && o.created_date > c.lastOrder) {
        c.lastOrder = o.created_date;
      }
    });

    // Sort customers by total spent (highest first)
    return Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0B2E2A]">
          Customers
        </h1>
        <p className="text-[#0B2E2A]/50 mt-1">
          All customers across vendors — {filteredCustomers.length} unique customers
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or address..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0B2E2A]/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Total Customers</p>
          <p className="text-xl font-bold text-[#0B2E2A]">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Total Orders</p>
          <p className="text-xl font-bold text-[#0B2E2A]">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Avg. Orders/Customer</p>
          <p className="text-xl font-bold text-[#0B2E2A]">
            {customers.length > 0 ? (orders.length / customers.length).toFixed(1) : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#0B2E2A]/5">
          <p className="text-xs text-[#0B2E2A]/40">Total Revenue</p>
          <p className="text-xl font-bold text-primary">
            ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#0B2E2A]/5 p-12 text-center">
          <p className="text-sm text-[#0B2E2A]/40">
            {search ? "No customers match your search" : "No customers found yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#0B2E2A]/5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0B2E2A] text-sm">{c.name}</p>
                    <p className="text-xs text-[#0B2E2A]/50">
                      {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">
                  ${c.totalSpent.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {c.phone && (
                  <div className="flex items-center gap-2 text-[#0B2E2A]">
                    <Phone className="w-3.5 h-3.5 text-[#0B2E2A]/40" />
                    <span className="text-xs">{c.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#0B2E2A]">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs">{c.phone ? `WA: ${c.phone}` : "—"}</span>
                </div>
                {c.address && (
                  <div className="flex items-start gap-2 text-[#0B2E2A]">
                    <MapPin className="w-3.5 h-3.5 text-[#0B2E2A]/40 mt-0.5" />
                    <span className="text-xs leading-relaxed">{c.address}</span>
                  </div>
                )}
                {c.lastOrder && (
                  <div className="flex items-center gap-2 text-[#0B2E2A]/40">
                    <span className="text-xs">Last order: {new Date(c.lastOrder).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}