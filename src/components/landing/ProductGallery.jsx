import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

export default function ProductGallery({ images = [], alt = "Product", className = "", aspect = "h-48 md:h-56" }) {
  const validImages = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  if (validImages.length === 0) {
    return (
      <div className={`w-full ${aspect} flex items-center justify-center bg-[#F0F4F4] ${className}`}>
        <Package className="w-12 h-12 text-[#0B2E2A]/20" />
      </div>
    );
  }

  if (validImages.length === 1) {
    return (
      <div className={`relative w-full ${aspect} overflow-hidden ${className}`}>
        <img
          src={validImages[0]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  };
  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  };

  return (
    <div className={`relative w-full ${aspect} overflow-hidden ${className}`}>
      {/* Slides */}
      {validImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${alt} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-heavy flex items-center justify-center text-[#0B2E2A] hover:bg-primary hover:text-white transition-colors z-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass-heavy flex items-center justify-center text-[#0B2E2A] hover:bg-primary hover:text-white transition-colors z-10"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {validImages.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}