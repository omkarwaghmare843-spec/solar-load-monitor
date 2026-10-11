"use client";

import { useEffect, useState } from "react";
import { ref, query, limitToLast, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { HistoryEntry } from "@/lib/types";

export function useHistoryData(limit: number = 200) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const historyRef = query(ref(db, "history"), limitToLast(limit));
    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const entries: HistoryEntry[] = Object.entries(val).map(
            ([id, entry]) => ({ id, ...(entry as Omit<HistoryEntry, "id">) })
          );
          entries.sort((a, b) => a.timestamp - b.timestamp);
          setHistory(entries);
        } else {
          setHistory([]);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [limit]);

  return { history, loading };
}
