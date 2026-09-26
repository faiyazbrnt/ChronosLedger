"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, User, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { LogoutButton } from "@/features/auth";
import { SettingsModal } from "@/features/settings";

interface AccountMenuClientProps {
  email: string;
  initialName?: string | null;
  initialAvatar?: string | null;
  initialCurrency?: string;
}

export function AccountMenuClient({
  email,
  initialName,
  initialAvatar,
  initialCurrency = "PHP",
}: AccountMenuClientProps) {
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live state for instant UI reflection without full page reload
  const [name, setName] = useState(initialName ?? "");
  const [avatar, setAvatar] = useState<string | null>(initialAvatar ?? null);
  const [currency, setCurrency] = useState(initialCurrency);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    setName(initialName ?? "");
  }, [initialName]);

  useEffect(() => {
    setAvatar(initialAvatar ?? null);
  }, [initialAvatar]);

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        !triggerRef.current?.parentElement?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const displayName = name.trim() ? name : email.split("@")[0] ?? "Account";

  return (
    <>
      <div className="relative">
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter") {
              event.preventDefault();
              setOpen(true);
              window.requestAnimationFrame(() =>
                menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
              );
            }
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          className="h-10 gap-2 px-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary overflow-hidden shrink-0 border border-border/50">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
          <span className="hidden text-left sm:block max-w-[120px]">
            <span className="block text-xs font-semibold truncate text-foreground">
              {displayName}
            </span>
            <span className="block text-[10px] text-muted-foreground">Online</span>
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Account menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeMenu();
            }}
            className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {/* User Details */}
            <div className="px-2.5 py-2 border-b border-border/60 mb-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {name || "User Account"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>

            {/* Settings Action */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setIsSettingsOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:bg-muted text-left cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </button>

            {/* Logout Action */}
            <div className="pt-1 mt-1 border-t border-border/60">
              <LogoutButton
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialProfile={{
          name,
          avatar,
          email,
        }}
        initialCurrency={currency}
        onProfileUpdated={(updated) => {
          if (updated.name !== undefined) setName(updated.name ?? "");
          if (updated.avatar !== undefined) setAvatar(updated.avatar ?? null);
        }}
        onCurrencyUpdated={(newCurrency) => {
          setCurrency(newCurrency);
        }}
      />
    </>
  );
}
