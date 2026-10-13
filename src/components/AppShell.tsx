"use client";

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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live", label: "Live Monitoring", icon: Activity },
  { href: "/history", label: "Historical Data", icon: History },
  { href: "/load-control", label: "Load Control", icon: ToggleLeft },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-slate-200 md:flex">
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
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
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
        <div className="border-t border-navy-light px-3 py-4">
          <div className="mb-2 truncate px-3 text-xs text-slate-400">
            {user?.email}
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-navy-light hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
