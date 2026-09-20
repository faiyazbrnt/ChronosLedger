"use client";

import * as React from "react";
import { Button } from "./button";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  onConfirm?: () => Promise<void> | void;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = React.createContext<Confirm | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const resolver = React.useRef<((value: boolean) => void) | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const close = React.useCallback((value: boolean, force = false) => {
    if (isConfirming && !force) return;
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [isConfirming]);

  const handleConfirm = async () => {
    if (!options?.onConfirm) {
      close(true, true);
      return;
    }
    setIsConfirming(true);
    try {
      await options.onConfirm();
      setIsConfirming(false);
      close(true);
    } catch {
      setIsConfirming(false);
    }
  };

  const confirm = React.useCallback<Confirm>((nextOptions) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOptions(nextOptions);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  React.useEffect(() => {
    if (!options) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      const first = focusable?.[0];
      const last = focusable?.[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => cancelRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button disabled={isConfirming} aria-label="Cancel confirmation" className="absolute inset-0 bg-foreground/25" onClick={() => close(false)} />
          <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="relative w-full max-w-sm rounded-2xl border border-border bg-popover p-6 shadow-2xl">
            <h2 id="confirm-title" className="text-lg font-bold text-foreground">{options.title}</h2>
            <p id="confirm-description" className="mt-2 text-sm text-muted-foreground">{options.description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button ref={cancelRef} type="button" variant="outline" disabled={isConfirming} onClick={() => close(false)}>{options.cancelLabel ?? "Cancel"}</Button>
              <Button type="button" variant={options.variant === "destructive" ? "destructive" : "default"} disabled={isConfirming} onClick={handleConfirm}>{isConfirming ? "Working…" : options.confirmLabel ?? "Confirm"}</Button>
            </div>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return confirm;
}
