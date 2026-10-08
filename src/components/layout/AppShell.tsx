"use client";

import { useState, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Shield, Search, LogOut, ChevronRight } from "lucide-react";
import CommandPalette from "./CommandPalette";
import AppHeader from "./AppHeader";
import type { NavSection } from "@/config/nav";

interface AppShellProps {
  sections: NavSection[];
  assessmentName?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function isItemActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The single shell for the whole app (admin global scope + per-assessment
 * workspace). Nav sections are passed as data, never derived by role
 * branches. Signature: Cmd/Ctrl+K command palette.
 */
export default function AppShell({
  sections,
  assessmentName,
  title,
  subtitle,
  actions,
  children,
}: AppShellProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const handleLogout = async () => {
    await signOut({ callbackUrl: isAdmin ? "/admin/login" : "/assessment-center" });
  };

  const Brand = (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary">
        <Shield className="h-4.5 w-4.5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium leading-tight text-petrol-600">Sangkala</p>
        <p className="truncate text-[11px] text-ink-muted">Assessment Center</p>
      </div>
    </div>
  );

  const UserBlock = (
    <div className="border-y border-hairline px-3 py-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{session?.user?.name}</p>
          <p className="truncate text-xs text-ink-muted">{role?.toLowerCase()}</p>
        </div>
      </div>
    </div>
  );

  const LogoutButton = (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
      <span>Logout</span>
    </button>
  );

  const SidebarNav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
      {sections.map((section) => (
        <div key={section.id}>
          <p className="px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted/70">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isItemActive(item.href, pathname);
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setDrawerOpen(false);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-ink-muted hover:bg-hairline/60 hover:text-ink"
                  }`}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                  <span className="truncate">{item.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-hairline bg-white lg:flex">
        {Brand}
        {UserBlock}
        {SidebarNav}
        {/* Logout pinned to bottom */}
        <div className="border-t border-hairline p-3">{LogoutButton}</div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              {Brand}
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-hairline/60 focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {UserBlock}
            {SidebarNav}
            {/* Logout pinned to bottom */}
            <div className="border-t border-hairline p-3">{LogoutButton}</div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-hairline bg-paper/90 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-hairline/60 lg:hidden focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              {assessmentName && (
                <span className="truncate font-medium text-ink">{assessmentName}</span>
              )}
              {title && (
                <>
                  {assessmentName && (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-muted/60" />
                  )}
                  <span className="hidden truncate text-ink-muted sm:inline">{title}</span>
                </>
              )}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              {/* Command palette trigger */}
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 rounded-md border border-hairline bg-white px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Cari…</span>
                <kbd className="hidden rounded border border-hairline px-1 font-mono text-[10px] sm:block">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {(title || subtitle || actions) && (
            <AppHeader title={title ?? ""} subtitle={subtitle} actions={actions} />
          )}
          {children}
        </main>
      </div>

      <CommandPalette sections={sections} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}