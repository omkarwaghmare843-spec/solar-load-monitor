"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { LiveData, emptyLiveData } from "@/lib/types";

export function useLiveData() {
  const [data, setData] = useState<LiveData>(emptyLiveData());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const liveRef = ref(db, "live");
    const unsubscribe = onValue(
      liveRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setData({ ...emptyLiveData(), ...val });
          setConnected(true);
        }
        setLoading(false);
      },
      () => {
        setConnected(false);
        setLoading(false);
      }
    );

    const connectedRef = ref(db, ".info/connected");
    const unsubscribeConn = onValue(connectedRef, (snap) => {
      setConnected(snap.val() === true);
    });

    return () => {
      unsubscribe();
      unsubscribeConn();
    };
  }, []);

  return { data, connected, loading };
}
