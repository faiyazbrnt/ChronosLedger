"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui";
import { LogoutButton } from "./logout-button";

export function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || !triggerRef.current?.parentElement?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);
  return <div className="relative"><Button ref={triggerRef} variant="outline" size="sm" onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "Enter") { event.preventDefault(); setOpen(true); window.requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()); } }} aria-haspopup="menu" aria-expanded={open} className="h-10 gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary"><User className="h-4 w-4" /></span><span className="hidden text-left sm:block"><span className="block text-xs">Account</span><span className="block text-[10px] text-muted-foreground">Online</span></span><ChevronDown className="h-3 w-3" /></Button>{open && <div ref={menuRef} role="menu" onKeyDown={(event) => { if (event.key === "Escape") close(); }} className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-xl"><p className="truncate px-2 py-2 text-xs text-muted-foreground">{email}</p><LogoutButton variant="ghost" size="sm" className="w-full justify-start" /></div>}</div>;
}
