import React, { useState } from "react";
import { ExternalLink, Copy, Check, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function StoreLinkSection({ vendorId, slug }) {
  const [copied, setCopied] = useState(false);
  
  // ✅ Use slug if available, otherwise fallback to ID
  const storeSlug = slug || vendorId;
  const storeUrl = `${window.location.origin}/store/${storeSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Store URL copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my store!',
          text: `Browse my products at ${storeUrl}`,
          url: storeUrl,
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      // User cancelled share dialog
      console.log('Share cancelled');
    }
  };

  return (
    <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/15 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Store className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0B2E2A]">Your Store Link</p>
          <p className="text-xs text-[#0B2E2A]/50">
            Share this with customers so they can browse your catalog
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 min-w-0 rounded-xl bg-white border border-[#0B2E2A]/10 px-3 py-2">
          <p className="text-xs text-[#0B2E2A]/60 truncate font-mono">
            {storeUrl}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="rounded-xl flex-shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          
          <a href={storeUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Visit
            </Button>
          </a>
        </div>
      </div>

      {/* Share button (mobile friendly) */}
      {navigator.share && (
        <div className="mt-3">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="w-full rounded-xl text-sm"
          >
            <Store className="w-3.5 h-3.5 mr-1.5" />
            Share Store
          </Button>
        </div>
      )}
    </div>
  );
}