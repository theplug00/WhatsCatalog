import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Menu, X, ChevronRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Overview", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
];

export default function VendorNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-nav shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-pulse">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0B2E2A] font-heading">
              Whats<span className="text-primary">Catalog</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-[#0B2E2A]/70 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/vendor/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0B2E2A]/70 hover:text-primary"
              >
                Log In
              </Button>
            </Link>
            <Link to="/vendor/register">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 glow-pulse font-semibold"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl glass-card"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[#0B2E2A]" />
            ) : (
              <Menu className="w-5 h-5 text-[#0B2E2A]" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 glass-heavy rounded-b-2xl mx-3 p-4 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center justify-between px-4 py-3 text-[#0B2E2A] font-medium rounded-xl hover:bg-primary/5 transition-colors"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              <div className="pt-3 border-t border-border mt-2 flex flex-col gap-2">
                <Link to="/vendor/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full font-semibold">
                    Log In
                  </Button>
                </Link>
                <Link to="/vendor/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold glow-pulse">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}