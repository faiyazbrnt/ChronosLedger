"use client";

import * as React from "react";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };
type Notify = Record<ToastVariant, (message: string) => void>;
const ToastContext = React.createContext<Notify | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((variant: ToastVariant, message: string) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, message, variant }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);
  const notify = React.useMemo<Notify>(() => ({ success: (message) => push("success", message), error: (message) => push("error", message), info: (message) => push("info", message) }), [push]);
  return <ToastContext.Provider value={notify}>{children}<div className="fixed bottom-4 left-4 z-[110] space-y-2" aria-live="polite">{toasts.map((toast) => <div key={toast.id} role={toast.variant === "error" ? "alert" : "status"} className={`flex max-w-sm items-center gap-3 rounded-xl border p-3 text-sm shadow-xl ${toast.variant === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : toast.variant === "success" ? "border-success/30 bg-success/10 text-success" : "border-border bg-popover text-foreground"}`}><span className="flex-1">{toast.message}</span><button className="h-8 w-8 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification">×</button></div>)}</div></ToastContext.Provider>;
}
export function useNotify(): Notify { const notify = React.useContext(ToastContext); if (!notify) throw new Error("useNotify must be used within ToastProvider"); return notify; }
