import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

/**
 * Shared split-screen auth layout: full-bleed image on the left,
 * form content on the right. Responsive — image hidden on mobile.
 *
 * Props:
 *  - image: url string for the left-side photo
 *  - badge: small label text (e.g. "Vendor Portal")
 *  - headline: large headline over the image
 *  - subtitle: paragraph under the headline
 *  - children: the form card content
 *  - footerLink: ReactNode rendered below the form (e.g. "New here? Sign up")
 */
export default function SplitAuthLayout({
  image,
  badge,
  headline,
  subtitle,
  children,
  footerLink,
}) {
  return (
    <div className="min-h-screen flex bg-[#F0F4F4]">
      {/* Left — image panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* ✅ Fixed: Proper image with fallback */}
        <img
          src={image || "/auth-bg.jpg"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // ✅ Fallback if image fails to load
            e.target.src = "/auth-bg.jpg";
          }}
        />
        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0B2E2A]/85 via-[#0B2E2A]/60 to-primary/30" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <Logo size="lg" textClass="text-white" />
          </Link>

          {/* Headline block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            {badge && (
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-white/10 px-3 py-1.5 mb-5 rounded-full">
                {badge}
              </span>
            )}
            <h2 className="text-4xl xl:text-5xl font-black font-heading leading-[1.1] tracking-tight">
              {headline}
            </h2>
            {subtitle && (
              <p className="text-lg text-white/70 leading-relaxed mt-5">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} WhatsCatalog
            </p>
            <Link
              to="/"
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              Back to store
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <Logo size="lg" />
          </Link>

          {/* Form content */}
          <div className="glass-heavy rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/5">
            {children}
          </div>

          {footerLink && (
            <p className="text-center text-sm text-[#0B2E2A]/50 mt-6">
              {footerLink}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}