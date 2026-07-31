import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B2E2A] text-white/70">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img 
                src="/favicon-32x32.png" 
                alt="WhatsCatalog" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-white font-heading">
                Whats<span className="text-primary">Catalog</span>
              </span>
            </div>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              The future of e-commerce is conversational. Browse, order, and track
              — all through WhatsApp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/vendor" className="text-sm text-white/50 hover:text-white transition-colors">Become a Vendor</Link></li>
              <li><Link to="/vendor/login" className="text-sm text-white/50 hover:text-white transition-colors">Vendor Login</Link></li>
              <li><Link to="/vendor/register" className="text-sm text-white/50 hover:text-white transition-colors">Vendor Register</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                hello@whatscatalog.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +233 55 514 0982
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Ghana
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} WhatsCatalog. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link to="/admin/login" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Shield className="w-3.5 h-3.5" />
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}