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
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: connected ? "var(--status-good)" : "var(--status-critical)" }}
          />
          {connected ? "Live" : "Offline"}
        </span>
        <span>{now}</span>
      </div>
    </header>
  );
}
