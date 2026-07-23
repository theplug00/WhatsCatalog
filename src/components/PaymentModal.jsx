import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, AlertCircle, Loader2, 
  Smartphone, CreditCard, Truck, Banknote,
  ChevronRight, ChevronLeft
} from "lucide-react";
import { PAYMENT_METHODS, MOMO_NETWORKS, detectMomoNetwork } from "@/lib/paymentTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentConfirm, 
  amount,
  orderDetails 
}) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    phone: "",
    network: "",
    reference: "",
  });

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setError("");
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate
    if (selectedMethod === 'momo') {
      if (!paymentDetails.phone || paymentDetails.phone.length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
      if (!paymentDetails.network) {
        setError("Please select your mobile network");
        return;
      }
      // Auto-detect network
      const detected = detectMomoNetwork(paymentDetails.phone);
      if (detected && !paymentDetails.network) {
        setPaymentDetails(prev => ({ ...prev, network: detected }));
      }
    }

    setLoading(true);
    try {
      await onPaymentConfirm({
        method: selectedMethod,
        ...paymentDetails,
        amount: amount,
        order: orderDetails,
      });
      onClose();
      toast({
        title: "Payment successful!",
        description: "Your order has been confirmed.",
        duration: 3000,
      });
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      toast({
        title: "Payment failed",
        description: err.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setSelectedMethod(null);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0B2E2A]/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-primary/10 to-[#0B2E2A]/5 p-6 border-b border-[#0B2E2A]/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0B2E2A]">Payment</h2>
              <p className="text-sm text-[#0B2E2A]/50">
                Amount: <span className="font-bold text-primary">GH₵{amount?.toFixed(2)}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#0B2E2A]/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-[#0B2E2A]" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div>
              <p className="text-sm text-[#0B2E2A]/60 mb-4">
                Choose your preferred payment method
              </p>
              <div className="space-y-3">
                {Object.values(PAYMENT_METHODS).filter(m => m.enabled).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-[#0B2E2A]/10 hover:border-primary/30'
                    }`}
                  >
                    <div className="text-2xl">{method.icon}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[#0B2E2A]">{method.name}</p>
                      <p className="text-xs text-[#0B2E2A]/50">{method.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0B2E2A]/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-[#0B2E2A]/50 hover:text-primary transition-colors mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-[#0B2E2A]">
                  Pay with {getPaymentMethod(selectedMethod)?.name}
                </p>
                <p className="text-xs text-[#0B2E2A]/50">
                  Amount: GH₵{amount?.toFixed(2)}
                </p>
              </div>

              {selectedMethod === 'cod' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Truck className="w-5 h-5" />
                      <p className="text-sm font-medium">Cash on Delivery</p>
                    </div>
                    <p className="text-xs text-amber-600/80 mt-1">
                      Pay when your order arrives. Have the exact amount ready.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cod-name" className="text-sm font-medium text-[#0B2E2A]">
                      Full Name
                    </Label>
                    <Input
                      id="cod-name"
                      value={paymentDetails.name}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'momo' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Smartphone className="w-5 h-5" />
                      <p className="text-sm font-medium">Mobile Money</p>
                    </div>
                    <p className="text-xs text-blue-600/80 mt-1">
                      We'll send a payment request to your phone
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="momo-name" className="text-sm font-medium text-[#0B2E2A]">
                      Full Name
                    </Label>
                    <Input
                      id="momo-name"
                      value={paymentDetails.name}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="momo-phone" className="text-sm font-medium text-[#0B2E2A]">
                      Mobile Money Number
                    </Label>
                    <Input
                      id="momo-phone"
                      type="tel"
                      value={paymentDetails.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPaymentDetails(prev => ({ 
                          ...prev, 
                          phone: val,
                          network: detectMomoNetwork(val) || prev.network
                        }));
                      }}
                      placeholder="024XXXXXXX"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#0B2E2A]">
                      Network
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {MOMO_NETWORKS.map((network) => (
                        <button
                          key={network.id}
                          type="button"
                          onClick={() => setPaymentDetails(prev => ({ 
                            ...prev, 
                            network: network.id 
                          }))}
                          className={`p-2 rounded-xl text-xs font-medium transition-all ${
                            paymentDetails.network === network.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-[#F0F4F4] text-[#0B2E2A]/60 hover:bg-primary/10'
                          }`}
                        >
                          {network.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    {paymentDetails.phone && !paymentDetails.network && (
                      <p className="text-xs text-amber-500 mt-1">
                        Could not detect network. Please select manually.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4 mr-2" />
                    Pay GH₵{amount?.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-[#0B2E2A]/40">
                By confirming, you agree to our terms and conditions
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}