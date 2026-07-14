import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorPending() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#f0f4f4] to-[#e8f5e9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-heavy rounded-3xl p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#0B2E2A] mb-2">
          Pending Approval
        </h2>
        
        <p className="text-[#0B2E2A]/60 mb-6">
          Your vendor account has been created and is awaiting admin approval. 
          We'll notify you via email once your account is activated.
        </p>

        <div className="bg-primary/5 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#0B2E2A]">Step 1: Registration Complete</p>
              <p className="text-xs text-[#0B2E2A]/50">Your account has been created</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#0B2E2A]">Step 2: Email Verification</p>
              <p className="text-xs text-[#0B2E2A]/50">Your email has been verified</p>
            </div>
          </div>
          <div className="flex items-start gap-3 opacity-50">
            <Clock className="w-5 h-5 text-[#0B2E2A] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#0B2E2A]">Step 3: Admin Approval</p>
              <p className="text-xs text-[#0B2E2A]/50">Awaiting admin review</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            asChild
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>

        <p className="text-xs text-[#0B2E2A]/40 mt-4">
          Need help? Contact support at support@whatscatalog.com
        </p>
      </motion.div>
    </div>
  );
}