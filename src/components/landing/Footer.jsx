import React from "react";
import { MessageCircle, Mail, MapPin, Phone, ArrowUpRight, Shield } from "lucide-react";

const FOOTER_LINKS = {
  Shop: ["All Products", "New Arrivals", "Best Sellers", "Sale Items", "Gift Cards"],
  Support: ["FAQ", "Shipping Info", "Returns", "Track Order", "Contact Us"],
  Company: ["About Us", "Careers", "Blog", "Press", "Partners"],
  Vendors: ["Vendor Login", "Apply to Sell", "Seller Guide", "Vendor Dashboard", "Policies"],
};

export default function Footer() {
  return (
    <footer id="contact" className="glass-footer">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
        {/* Top row: Brand + newsletter */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 pb-16 border-b border-[#0B2E2A]/10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0B2E2A] font-heading">
                Whats<span className="text-primary">Catalog</span>
              </span>
            </div>
            <p className="text-[#0B2E2A]/50 max-w-sm leading-relaxed">
              The future of e-commerce is conversational. Browse, order, and track
              — all through WhatsApp. No apps to download, no accounts to create.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                <Mail className="w-4 h-4 text-primary" />
                hello@whatscatalog.com
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                <Phone className="w-4 h-4 text-primary" />
                +233 (555) 140-980
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0B2E2A]/50">
                <MapPin className="w-4 h-4 text-primary" />
                Tema, Ghana
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold font-heading text-[#0B2E2A] mb-3">
              Stay in the loop
            </h3>
            <p className="text-[#0B2E2A]/50 mb-5">
              Get exclusive deals and new arrivals straight to your WhatsApp.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 rounded-full glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors glow-pulse flex items-center gap-1.5 shrink-0">
                Subscribe
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Link columns - 4 columns (no social links) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-16">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-[#0B2E2A] font-heading mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const href =
                    link === "Vendor Login"
                      ? "/vendor/login"
                      : link === "Apply to Sell"
                      ? "/vendor/register"
                      : link === "Vendor Dashboard"
                      ? "/vendor/admin"
                      : "#";
                  return (
                    <li key={link}>
                      <a
                        href={href}
                        className="text-sm text-[#0B2E2A]/50 hover:text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar - with Admin Login */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#0B2E2A]/10">
          <p className="text-xs text-[#0B2E2A]/40">
            © {new Date().getFullYear()} WhatsCatalog. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#0B2E2A]/40">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
            <a 
                 href="/super-admin/login" 
                 className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium text-primary/80 hover:text-primary"
               >
              <Shield className="w-3.5 h-3.5" />
           Super Admin
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}