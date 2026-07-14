import React from "react";
import VendorNavbar from "@/components/landing/VendorNavbar";
import VendorHero from "@/components/landing/VendorHero";
import VendorFeatures from "@/components/landing/VendorFeatures";
import VendorHowItWorks from "@/components/landing/VendorHowItWorks";
import VendorPricing from "@/components/landing/VendorPricing";
import VendorCTA from "@/components/landing/VendorCTA";
import Footer from "@/components/landing/Footer";

export default function VendorLanding() {
  return (
    <div className="min-h-screen bg-[#F0F4F4]">
      <VendorNavbar />
      <VendorHero />
      <VendorFeatures />
      <VendorHowItWorks />
      <VendorPricing />
      <VendorCTA />
      <Footer />
    </div>
  );
}