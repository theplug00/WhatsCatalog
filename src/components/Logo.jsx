import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a383a8b348b95defff04d98/e090cc7fc_whatsappcatalog.png";

const sizeMap = {
  sm: { img: "w-8 h-8", text: "text-base" },
  md: { img: "w-9 h-9", text: "text-lg" },
  lg: { img: "w-10 h-10", text: "text-xl" },
};

export default function Logo({ size = "md", textClass = "", showText = true }) {
  const s = sizeMap[size] || sizeMap.md;
  return (
    <>
      <img
        src={LOGO_URL}
        alt="WhatsCatalog"
        className={`${s.img} rounded-xl object-cover shrink-0`}
      />
      {showText && (
        <span className={`${s.text} font-bold tracking-tight font-heading ${textClass}`}>
          Whats<span className="text-primary">Catalog</span>
        </span>
      )}
    </>
  );
}