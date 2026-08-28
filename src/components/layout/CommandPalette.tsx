"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, CornerDownLeft, ArrowRight, FolderOpen } from "lucide-react";
import type { NavSection } from "@/config/nav";

interface AssessmentItem {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

interface CommandPaletteProps {
  sections?: NavSection[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  group: string;
}

/**
 * Signature element of the Unified Workbench: Cmd/Ctrl+K search.
 * Jumps to any assessment or view from anywhere in the app.
 * Opens via keyboard shortcut or the `command-palette:open` custom event.
 */
export default function CommandPalette({
  sections = [],
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
      if (next) setQuery("");
    },
    [onOpenChange]
  );

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    const onCustom = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onCustom);
    };
  }, [isOpen, setOpen]);

  // Fetch assessments when opened (admin only — endpoint is public, so
  // non-admin roles must not see other clients' assessments)
  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    fetch("/api/assessments")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AssessmentItem[]) => setAssessments(Array.isArray(data) ? data : []))
      .catch(() => setAssessments([]));
  }, [isOpen, isAdmin]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const result: PaletteItem[] = [];

    for (const section of sections) {
      for (const item of section.items) {
        const label = item.label;
        if (!q || label.toLowerCase().includes(q)) {
          result.push({
            id: `nav-${section.id}-${item.key}`,
            label,
            description: section.label,
            href: item.href,
            group: "Navigasi",
          });
        }
      }
    }

    for (const a of assessments) {
      const label = `${a.name} — ${a.clientName}`;
      if (!q || label.toLowerCase().includes(q)) {
        result.push({
          id: `assessment-${a.id}`,
          label: a.name,
          description: a.clientName,
          href: `/assessment-center/${a.id}/overview`,
          group: "Assessment",
        });
      }
    }

    return result;
  }, [query, sections, assessments]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Keep active item scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) navigate(item.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Cari"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-hairline bg-white shadow-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search className="h-4 w-4 flex-shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Cari assessment, halaman, pengguna…"
            className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
            aria-label="Pencarian"
          />
          <kbd className="hidden flex-shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:block">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              Tidak ada hasil untuk “{query}”
            </p>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                data-index={index}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-paper text-ink" : "text-ink-muted"
                }`}
              >
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{item.label}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {item.group} · {item.description}
                  </span>
                </span>
                {index === activeIndex && (
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-hairline px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-hairline px-1 font-mono">↓</kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> pilih
          </span>
        </div>
      </div>
    </div>
  );
}