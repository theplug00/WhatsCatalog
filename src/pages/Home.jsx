import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ShopByCategory from "@/components/landing/ShopByCategory";
import FlashSale from "@/components/landing/FlashSale";
import PromoSlider from "@/components/landing/PromoSlider";
import AdvertSlider from "@/components/landing/AdvertSlider";
import Testimonials from "@/components/landing/Testimonials";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F4F4]">
      <Navbar />
      <HeroSection />
      <ShopByCategory />
      <FlashSale />
      <PromoSlider />
      <AdvertSlider />
      <Testimonials />
      <FeaturesSection />
      <CTABanner />
      <Footer />
    </div>
  );
}