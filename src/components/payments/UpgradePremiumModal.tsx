"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Loader2, CreditCard, Shield } from "lucide-react";

interface UpgradePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpgradePremiumModal({ isOpen, onClose, onSuccess }: UpgradePremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create order on the server
      const res = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
      });
      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initiate transaction.");
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay payment gateway failed to load. Check your internet connection.");
      }

      // 3. Configure Razorpay checkout options
      const options = {
        key: orderData.publicKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SkillBridge AI",
        description: "Unlock Premium Resume Templates",
        image: "https://cdn-icons-png.flaticon.com/512/6125/6125139.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setSuccess(true);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } catch (err: any) {
            setError(err.message || "An error occurred during payment verification.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayObject = new (window as any).Razorpay(options);
      razorpayObject.open();
    } catch (err: any) {
      setError(err.message || "Failed to complete checkout processing.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden flex flex-col text-left animate-zoom-in text-foreground">
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-bold">Unlock Premium Resume Templates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-zoom-in">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h4 className="text-lg font-bold text-emerald-400">Upgrade Successful!</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Congratulations! All premium templates, professional PDF export without watermarks, and advanced AI rewriting tools are now unlocked.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock the full potential of SkillBridge AI. Upgrade today to compile professional resumes that stand out.
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="p-1 rounded bg-primary/10 text-primary text-xs font-bold mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-semibold">Unlock 7 Premium Templates</p>
                  <p className="text-[10px] text-muted-foreground">Gain full access to Developer Dark, Creative Sidebar, Tech Gradient, and more.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="p-1 rounded bg-primary/10 text-primary text-xs font-bold mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-semibold">Advanced AI Resume Rewrite</p>
                  <p className="text-[10px] text-muted-foreground">Improve wording, vocabulary, and keywords tailored for specific target roles.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="p-1 rounded bg-primary/10 text-primary text-xs font-bold mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-semibold">Professional PDF Export</p>
                  <p className="text-[10px] text-muted-foreground">Export high-resolution PDFs without any watermark.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="p-1 rounded bg-primary/10 text-primary text-xs font-bold mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-semibold">No Watermark</p>
                  <p className="text-[10px] text-muted-foreground">Clean output ready to submit directly to recruiters.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/40 border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Premium Access</span>
                <p className="text-xl font-extrabold">₹199 <span className="text-xs font-normal text-muted-foreground">one-time</span></p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Secure Payment</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Configuring Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Unlock Premium ₹199</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
