import React from "react";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import VendorPromoPanel from "@/components/landing/VendorPromoPanel";

export default function VendorAuthLayout({ children, side = "login" }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#F0F4F4]">
      {/* Background decorative orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-125 h-125 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute top-[40%] left-[50%] w-75 h-75 rounded-full bg-[#0B2E2A]/5 blur-[80px]" />

      {/* Left promo panel (desktop) */}
      <VendorPromoPanel />

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 md:p-8 z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo - fixed */}
          <div className="flex justify-center lg:justify-start mb-4">
            <img 
              src="/logo.png" 
              alt="WhatsCatalog" 
              className="w-12 h-12 object-contain"
            />
          </div>

          <div className="glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/5">
            {children}
          </div>

          <p className="text-center text-sm text-[#0B2E2A]/40 mt-6">
            {side === "login" ? (
              <>
                New vendor?{" "}
                <Link
                  to="/vendor/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Apply to sell
                </Link>
              </>
            ) : (
              <>
                Already a vendor?{" "}
                <Link
                  to="/vendor/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}