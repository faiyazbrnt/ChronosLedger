"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Coins,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnits } from "@/lib/money";
import {
  updateSettingsAction,
  updateProfileAction,
} from "../actions/settings-actions";

const CURRENCY_PRESETS = [
  { code: "PHP", label: "PHP (₱)", symbol: "₱" },
  { code: "USD", label: "USD ($)", symbol: "$" },
  { code: "EUR", label: "EUR (€)", symbol: "€" },
  { code: "GBP", label: "GBP (£)", symbol: "£" },
  { code: "JPY", label: "JPY (¥)", symbol: "¥" },
  { code: "SGD", label: "SGD (S$)", symbol: "S$" },
  { code: "AUD", label: "AUD (A$)", symbol: "A$" },
  { code: "CAD", label: "CAD (CA$)", symbol: "CA$" },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: {
    name?: string | null;
    avatar?: string | null;
    email?: string | null;
  } | null;
  initialCurrency?: string;
  onProfileUpdated?: (profile: { name?: string | null; avatar?: string | null }) => void;
  onCurrencyUpdated?: (currency: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  initialProfile,
  initialCurrency = "PHP",
  onProfileUpdated,
  onCurrencyUpdated,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"account" | "currency">("account");

  // Profile Form State
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [avatar, setAvatar] = useState<string | null>(initialProfile?.avatar ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Currency Form State
  const [currency, setCurrency] = useState(initialCurrency.toUpperCase());

  // Feedback State
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(initialProfile?.name ?? "");
    setAvatar(initialProfile?.avatar ?? null);
    setAvatarPreview(initialProfile?.avatar ?? null);
    setCurrency(initialCurrency.toUpperCase());
    setStatusMessage(null);
  }, [initialProfile, initialCurrency, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Process file upload (validate size & mime, read as Base64 Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatusMessage({
        type: "error",
        text: "Please select a valid image file (JPEG, PNG, or WebP).",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "Image file size exceeds 2 MB. Please select a smaller photo.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatar(dataUrl);
      setStatusMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateProfileAction({
        name: name.trim() || null,
        avatar: avatar,
      });

      if (!res.ok) {
        setStatusMessage({ type: "error", text: res.error });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Account profile updated successfully!",
      });

      if (onProfileUpdated && res.data) {
        onProfileUpdated({
          name: res.data.name,
          avatar: res.data.avatar,
        });
      }
    });
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const code = currency.trim().toUpperCase();
    if (code.length !== 3) {
      setStatusMessage({
        type: "error",
        text: "Currency must be a 3-letter ISO code (e.g. PHP, USD, EUR).",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateSettingsAction({
        currency: code,
      });

      if (!res.ok) {
        setStatusMessage({ type: "error", text: res.error });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Currency preferences updated successfully!",
      });

      if (onCurrencyUpdated) {
        onCurrencyUpdated(code);
      }
    });
  };

  // Safe live preview formatting
  let previewAmount1 = "₱1,500.00";
  let previewAmount2 = "₱10,500.00";
  try {
    const code = currency.trim().toUpperCase();
    if (code.length === 3) {
      previewAmount1 = formatMinorUnits(150000, code);
      previewAmount2 = formatMinorUnits(1050000, code);
    }
  } catch {
    // Fallback on invalid code
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-bold text-foreground">
                Settings & Preferences
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your personal profile and currency formatting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-xl bg-muted/60 p-1 border border-border/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("account");
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "account"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("currency");
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "currency"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Currency & Formatting</span>
          </button>
        </div>

        {/* Status Banner */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Account (Name + Profile Picture) */}
        {activeTab === "account" && (
          <form onSubmit={handleSaveAccount} className="space-y-5">
            {/* Profile Picture Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full border-2 border-border/80 bg-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photo</span>
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isPending}
                        className="text-destructive hover:bg-destructive/10 text-xs h-8 gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    JPEG, PNG, or WebP. Max file size: 2 MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Editable Name */}
            <div className="space-y-1.5">
              <label htmlFor="settings-name" className="text-xs font-semibold text-foreground">
                Display Name
              </label>
              <Input
                id="settings-name"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                disabled={isPending}
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                This name will appear on your top navigation header and greetings.
              </p>
            </div>

            {/* Email (Read-Only) */}
            {initialProfile?.email && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={initialProfile.email}
                  disabled
                  className="text-sm bg-muted/50 text-muted-foreground font-mono"
                />
              </div>
            )}

            {/* Save Account */}
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Account...</span>
                  </>
                ) : (
                  <span>Save Account</span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Currency & Formatting */}
        {activeTab === "currency" && (
          <form onSubmit={handleSaveCurrency} className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground block">
                Popular Currencies
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CURRENCY_PRESETS.map((preset) => {
                  const isSelected = currency === preset.code;
                  return (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setCurrency(preset.code)}
                      disabled={isPending}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border/60 hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <span className="text-sm font-mono">{preset.code}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Currency Code */}
            <div className="space-y-1.5">
              <label htmlFor="settings-custom-currency" className="text-xs font-semibold text-foreground">
                Custom ISO Currency Code
              </label>
              <Input
                id="settings-custom-currency"
                type="text"
                maxLength={3}
                placeholder="PHP"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                disabled={isPending}
                className="font-mono text-sm tracking-wider uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter any valid 3-letter ISO 4217 currency code.
              </p>
            </div>

            {/* Live Preview Box */}
            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Live Currency Preview</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {currency || "PHP"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div className="bg-card p-2 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Sample Expense
                  </span>
                  <span className="font-bold text-foreground">{previewAmount1}</span>
                </div>
                <div className="bg-card p-2 rounded-lg border border-border/40">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Sample Budget
                  </span>
                  <span className="font-bold text-foreground">{previewAmount2}</span>
                </div>
              </div>
            </div>

            {/* Save Currency */}
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Currency...</span>
                  </>
                ) : (
                  <span>Save Currency</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
