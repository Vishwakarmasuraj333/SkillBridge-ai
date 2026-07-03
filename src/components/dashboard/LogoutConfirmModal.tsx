"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err?.message || "Something went wrong during sign out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blurred background overlay */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Card container */}
      <div className="relative bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 flex flex-col gap-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Sign out of SkillBridge AI?
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You will need to sign in again to access your dashboard, resume analyses, interview questions, and saved cover letters.
          </p>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2.5 text-xs text-destructive items-start animate-pulse">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-white hover:bg-secondary/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all disabled:opacity-50 shadow-md shadow-red-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Yes, Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
