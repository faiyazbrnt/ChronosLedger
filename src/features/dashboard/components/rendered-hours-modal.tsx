"use client";

import React, { useState, useEffect } from "react";
import { X, Target, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenderedHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTarget: number | null;
  onSave: (newTarget: number) => Promise<{ ok: boolean; error?: string }>;
  onSuccess?: (newTarget: number) => void;
}

const COMMON_TARGETS = [200, 300, 486, 600];

export function RenderedHoursModal({
  isOpen,
  onClose,
  currentTarget,
  onSave,
  onSuccess,
}: RenderedHoursModalProps) {
  const [targetValue, setTargetValue] = useState<string>(
    currentTarget ? String(currentTarget) : "300"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTargetValue(currentTarget ? String(currentTarget) : "300");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentTarget]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(targetValue.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid number of hours greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSave(parsed);
      if (res.ok) {
        onSuccess?.(parsed);
        onClose();
      } else {
        setError(res.error ?? "Failed to save target hours. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {currentTarget ? "Edit Rendered Hours Target" : "Set Rendered Hours Target"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Total hours required for your OJT / training program
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Required Training Hours</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Running total against all shifts
              </span>
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 300"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                disabled={isSubmitting}
                className="text-lg font-bold font-mono pr-12 focus-visible:ring-primary"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                hrs
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Common OJT Milestones:
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_TARGETS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTargetValue(String(chip))}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                    targetValue === String(chip)
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border/70 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {chip} hrs
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Continuous OJT Progress
            </p>
            This target tracks your accumulated worked hours across all recorded shifts and never resets at the end of a week or month. Setting this target unlocks shift logging system-wide.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 font-semibold"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save Target"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
