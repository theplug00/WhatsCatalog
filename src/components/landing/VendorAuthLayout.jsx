import React from "react";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import VendorPromoPanel from "@/components/landing/VendorPromoPanel";

export default function VendorAuthLayout({ children, side = "login" }) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#F0F4F4]">
      {/* Background decorative orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-[#0B2E2A]/5 blur-[80px]" />

      {/* Left promo panel (desktop) */}
      <VendorPromoPanel />

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 md:p-8 z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0B2E2A] font-heading">
              Whats<span className="text-primary">Catalog</span>
            </span>
          </Link>

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