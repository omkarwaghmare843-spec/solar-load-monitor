"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  History,
  ToggleLeft,
  Settings,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live", label: "Live Monitoring", icon: Activity },
  { href: "/history", label: "Historical Data", icon: History },
  { href: "/load-control", label: "Load Control", icon: ToggleLeft },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-amber/20">
        <Sun className="h-5 w-5 text-accent-amber" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">
          Energy Monitor
        </p>
        <p className="text-xs text-slate-400">Solar Microgrid</p>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-navy"
                : "text-slate-300 hover:bg-navy-light hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountFooter({ email, onSignOut }: { email?: string | null; onSignOut: () => void }) {
  return (
    <div className="border-t border-navy-light px-3 py-4">
      <div className="mb-2 truncate px-3 text-xs text-slate-400">{email}</div>
      <button
        onClick={onSignOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-navy-light hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar — unchanged from before, laptop layout untouched */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-slate-200 md:flex">
        <Brand />
        <NavLinks pathname={pathname} />
        <AccountFooter email={user?.email} onSignOut={() => signOut()} />
      </aside>

      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 text-slate-200 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-amber/20">
            <Sun className="h-4 w-4 text-accent-amber" />
          </div>
          <p className="text-sm font-semibold text-white">Energy Monitor</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 hover:bg-navy-light"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[80vw] flex-col bg-navy text-slate-200">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 hover:bg-navy-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            <AccountFooter email={user?.email} onSignOut={() => signOut()} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col pt-14 md:pt-0">{children}</div>
    </div>
  );
}
