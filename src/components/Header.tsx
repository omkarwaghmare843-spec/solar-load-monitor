"use client";

import { useEffect, useState } from "react";

export default function Header({
  title,
  subtitle,
  connected,
}: {
  title: string;
  subtitle: string;
  connected: boolean;
}) {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    function update() {
      setNow(
        new Date().toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      );
    }
    update();
    const id = setInterval(update, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex flex-col gap-2 border-b border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        <p className="truncate text-xs text-muted sm:text-sm">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted sm:text-sm">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: connected ? "var(--status-good)" : "var(--status-critical)" }}
          />
          {connected ? "Live" : "Offline"}
        </span>
        <span className="whitespace-nowrap">{now}</span>
      </div>
    </header>
  );
}
