"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Loader2, Clock, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMinutesToTimeString } from "@/lib/date";

export interface ActivityReportData {
  id: string; // dtrEntryId
  workDate: string;
  timeInMinutes: number;
  timeOutMinutes: number | null;
  activity?: string | null;
  activityDescription?: string | null;
  remarks?: string | null;
}

interface DailyActivityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ActivityReportData | null;
  onSave: (data: {
    id: string;
    activity?: string | null;
    activityDescription?: string | null;
    remarks?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  onSuccess?: (updated: {
    activity: string;
    activityDescription: string;
    remarks: string;
  }) => void;
}

export function DailyActivityReportModal({
  isOpen,
  onClose,
  entry,
  onSave,
  onSuccess,
}: DailyActivityReportModalProps) {
  const [activity, setActivity] = useState<string>("");
  const [activityDescription, setActivityDescription] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && entry) {
      setActivity(entry.activity ?? "");
      setActivityDescription(entry.activityDescription ?? "");
      setRemarks(entry.remarks ?? "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, entry]);

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

  if (!isOpen || !entry || !mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSave({
        id: entry.id,
        activity,
        activityDescription,
        remarks,
      });

      if (res.ok) {
        onSuccess?.({
          activity,
          activityDescription,
          remarks,
        });
        onClose();
      } else {
        setError(res.error ?? "Failed to save daily activity report.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const shiftTimeDisplay =
    entry.timeOutMinutes !== null
      ? `${formatMinutesToTimeString(entry.timeInMinutes)} – ${formatMinutesToTimeString(entry.timeOutMinutes)}`
      : `${formatMinutesToTimeString(entry.timeInMinutes)} – In Progress`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-background rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Daily Activity Report</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Calendar className="h-3 w-3 text-primary" />
                  {entry.workDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {shiftTimeDisplay}
                </span>
              </div>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          {/* 1. Activity Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Activity</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Primary task or project
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Developed authentication module and fixed database migrations"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 resize-y"
            />
          </div>

          {/* 2. Activity Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Activity Description</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Detailed accomplishments (no character limit)
              </span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Conducted code review, created Prisma migration for phase 2 tables, updated test suites, and validated user session tokens..."
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 resize-y font-normal"
            />
          </div>

          {/* 3. Remarks Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Remarks</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Notes, blockers, or supervisor comments
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. All unit tests passed cleanly. Awaiting supervisor signoff."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 resize-y"
            />
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <span>
              This activity report is tied directly to your shift record for {entry.workDate} and can be referenced for timesheet submissions and OJT portfolios.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
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
              <span>{isSubmitting ? "Saving Report..." : "Save Activity Report"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
