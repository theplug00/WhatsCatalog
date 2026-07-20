import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, ShoppingBag, Users, CreditCard, MessageCircle, Menu, X } from "lucide-react";

const NAV = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/super-admin/vendors", label: "Vendors", icon: Store },
  { to: "/super-admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/super-admin/customers", label: "Customers", icon: Users },
  { to: "/super-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export default function SuperAdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-[#F0F4F4] flex">
      {/* ============================================ */}
      {/* DESKTOP SIDEBAR - hidden on mobile */}
      {/* ============================================ */}
      <aside className="hidden lg:flex w-64 bg-[#0B2E2A] text-white flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/super-admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold font-heading block leading-tight">
                WhatsCatalog
              </span>
              <span className="text-[11px] text-white/50">Super Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            View Storefront
          </Link>
        </div>
      </aside>

      {/* ============================================ */}
      {/* MOBILE HEADER - only visible on mobile */}
      {/* ============================================ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B2E2A] px-4 py-3 flex items-center justify-between">
        <Link to="/super-admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white font-heading">
            Whats<span className="text-primary">Catalog</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* ============================================ */}
      {/* MOBILE SIDEBAR OVERLAY - slides in from left */}
      {/* ============================================ */}
      {mobileOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Sidebar panel - 80% width on mobile */}
          <aside className="lg:hidden fixed top-0 left-0 z-50 w-[80%] max-w-sm h-full bg-[#0B2E2A] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <Link to="/super-admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-bold font-heading block leading-tight">
                    WhatsCatalog
                  </span>
                  <span className="text-[11px] text-white/50">Super Admin</span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                View Storefront
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* ============================================ */}
      {/* MAIN CONTENT - with padding for mobile header */}
      {/* ============================================ */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}