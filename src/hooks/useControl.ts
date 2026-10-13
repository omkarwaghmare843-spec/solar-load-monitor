"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { ControlState, emptyControlState } from "@/lib/types";

export function useControl() {
  const [control, setControl] = useState<ControlState>(emptyControlState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controlRef = ref(db, "control");
    const unsubscribe = onValue(
      controlRef,
      (snapshot) => {
        const val = snapshot.val();
        setControl({ ...emptyControlState(), ...val });
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  async function setRelay(relay: "relay1" | "relay2", on: boolean) {
    await update(ref(db, "control"), { [relay]: on });
  }

  return { control, loading, setRelay };
}
