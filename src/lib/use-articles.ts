"use client";

import { useEffect, useState } from "react";
import type { ArticleSummary } from "@/lib/articles";

/** Ambil artikel terbit dari /api/articles. `loading` true sampai respons pertama. */
export function useArticles(query = "status=PUBLISHED") {
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/articles?${query}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (alive && Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  return { items, loading };
}
