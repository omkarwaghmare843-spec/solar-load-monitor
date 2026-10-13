"use client";

import { useState } from "react";
import { Lightbulb, Fan, Power } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Card from "@/components/Card";
import RelayCard from "@/components/RelayCard";
import { useControl } from "@/hooks/useControl";
import { useLiveData } from "@/hooks/useLiveData";

export default function LoadControlPage() {
  const { control, setRelay } = useControl();
  const { connected } = useLiveData();
  const [pending, setPending] = useState<{ relay1: boolean; relay2: boolean }>({
    relay1: false,
    relay2: false,
  });

  async function handleToggle(relay: "relay1" | "relay2", next: boolean) {
    setPending((p) => ({ ...p, [relay]: true }));
    try {
      await setRelay(relay, next);
    } finally {
      setPending((p) => ({ ...p, [relay]: false }));
    }
  }

  return (
    <AuthGuard>
      <AppShell>
        <Header
          title="Load Control"
          subtitle="Switch the LED and fan relays connected to the ESP8266"
          connected={connected}
        />
        <main className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RelayCard
              icon={Lightbulb}
              iconColor="var(--series-4)"
              iconBg="rgba(237,161,0,0.15)"
              label="LED"
              description="Relay 1 - D5"
              desired={control.relay1}
              confirmed={control.relay1_state}
              onToggle={(next) => handleToggle("relay1", next)}
              pending={pending.relay1}
            />
            <RelayCard
              icon={Fan}
              iconColor="var(--series-1)"
              iconBg="rgba(42,120,214,0.15)"
              label="Fan"
              description="Relay 2 - D6"
              desired={control.relay2}
              confirmed={control.relay2_state}
              onToggle={(next) => handleToggle("relay2", next)}
              pending={pending.relay2}
            />
          </div>

          <Card title="How this works" icon={Power} iconColor="var(--chart-muted)">
            <p className="text-sm text-muted">
              Toggling a switch writes the desired state to{" "}
              <code className="rounded bg-background px-1 py-0.5">/control</code> in
              Firebase. The ESP8266 is streaming that path in real time and drives the
              relay the moment it changes, then writes the confirmed state back — if a
              switch briefly says &quot;Syncing with device...&quot; it means the ESP8266
              hasn&apos;t acknowledged yet (check that it&apos;s powered and connected to
              WiFi).
            </p>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
