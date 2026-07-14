import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, ShoppingBag, Users, CreditCard, MessageCircle } from "lucide-react";

const NAV = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/super-admin/vendors", label: "Vendors", icon: Store },
  { to: "/super-admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/super-admin/customers", label: "Customers", icon: Users },
  { to: "/super-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export default function SuperAdminLayout() {
  const location = useLocation();
  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-[#F0F4F4] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B2E2A] text-white flex flex-col fixed inset-y-0 left-0 z-30">
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

      {/* Main content */}
      <main className="flex-1 ml-64 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}