"use client";

import React, { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { signOutAction } from "../actions/auth-actions";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "default" | "sm" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  showLabel = true,
  className,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleSignOut}
      aria-label="Sign out of account"
      className={className}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {showLabel && !isPending && <span>Sign Out</span>}
      {showLabel && isPending && <span>Signing Out...</span>}
    </Button>
  );
}
