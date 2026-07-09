"use client";
import { useCallback, useEffect, useState } from "react";

export type MeResponse = {
  user: { id: string; email: string; createdAt: string } | null;
  profile: any | null;
  consent: any | null;
};

export function useMe() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, refresh };
}
