import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, X, MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabase";

// ✅ Updated WhatsApp number for support
const SUPPORT_WHATSAPP = "233555140982";

export default function SupportContact() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get current user from Supabase
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // ✅ Get vendor name from user metadata
    const vendorName = user?.user_metadata?.business_name || 
                       user?.full_name || 
                       user?.email || 
                       "a vendor";
    
    // ✅ Build WhatsApp message
    const text = `Hello Support,%0A%0AI'm ${vendorName} and I need help with:%0A%0A${encodeURIComponent(
      message.trim()
    )}`;
    
    // ✅ Open WhatsApp
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
    setOpen(false);
    setMessage("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0B2E2A]/70 hover:bg-primary/10 hover:text-primary transition-all w-full mb-1"
      >
        <LifeBuoy className="w-4 h-4" />
        Contact Support
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2E2A]/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-heavy rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B2E2A] font-heading text-lg leading-tight">
                      Contact Support
                    </h3>
                    <p className="text-xs text-[#0B2E2A]/50">
                      Send a message to our support team
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#0B2E2A]/40 hover:text-[#0B2E2A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#0B2E2A]/60 mb-1.5 block">
                    How can we help?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={4}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl glass-card text-sm text-[#0B2E2A] placeholder:text-[#0B2E2A]/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* ✅ Show support number */}
                <div className="flex items-center gap-2 text-xs text-[#0B2E2A]/40">
                  <span>📱 Support WhatsApp:</span>
                  <span className="font-medium text-[#0B2E2A]/60">
                    +{SUPPORT_WHATSAPP}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send via WhatsApp
                  <Send className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] text-center text-[#0B2E2A]/40">
                  This opens WhatsApp with your message pre-filled for our support team.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}