"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Band } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { InsightCard } from "@/components/ui/insight-card";
import { Button } from "@/components/ui/button";
import { articleImageUrl, categoryLabel, formatDate, readTime, type ArticleSummary } from "@/lib/articles";

/** Tiga publikasi terbaru. Disembunyikan sepenuhnya kalau belum ada artikel terbit. */
export default function InsightsTeaser() {
  const { language } = useLanguage();
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const id = language === "id";

  useEffect(() => {
    let alive = true;
    fetch("/api/articles?status=PUBLISHED")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ArticleSummary[]) => {
        if (alive && Array.isArray(data)) setItems(data.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <Band>
      <SectionIntro
        number="06"
        eyebrow="Insight"
        title={id ? "Pemikiran terbaru" : "Latest thinking"}
      />
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((a) => (
          <InsightCard
            key={a.id}
            href={`/insights/${a.slug}`}
            title={id ? a.titleId : a.titleEn}
            summary={(id ? a.excerptId : a.excerptEn) ?? undefined}
            kind={categoryLabel(a.category, language)}
            date={formatDate(a.publishedAt ?? a.createdAt, language)}
            readTime={readTime(id ? a.contentId : a.contentEn)}
            image={articleImageUrl(a.coverImage) ?? undefined}
          />
        ))}
      </div>
      <Button href="/insights" variant="text" className="mt-10 inline-block">{id ? "Semua insight →" : "All insights →"}</Button>
    </Band>
  );
}
