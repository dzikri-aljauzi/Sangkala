"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { InsightCard } from "@/components/ui/insight-card";
import { Button } from "@/components/ui/button";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { useArticles } from "@/lib/use-articles";
import { articleImageUrl, categoryLabel, formatDate, readTime, type ArticleSummary } from "@/lib/articles";
import { cn } from "@/lib/utils";

const RESOURCE_CATEGORIES = ["WHITEPAPER", "WEBINAR", "CASE_STUDY", "TEMPLATE"] as const;

export default function InsightsPage() {
  const { language, t } = useLanguage();
  const id = language === "id";
  const { items, loading } = useArticles();
  const [selected, setSelected] = useState<string | null>(null);

  const resources = items.filter((a) => (RESOURCE_CATEGORIES as readonly string[]).includes(a.category));
  const visible = selected ? resources.filter((r) => r.category === selected) : resources;
  const featured = !selected ? visible.find((r) => r.isFeatured) : undefined;
  const rest = featured ? visible.filter((r) => r.id !== featured.id) : visible;

  const card = (a: ArticleSummary, className?: string) => (
    <InsightCard
      key={a.id}
      className={className}
      href={`/insights/${a.slug}`}
      title={id ? a.titleId : a.titleEn}
      summary={(id ? a.excerptId : a.excerptEn) ?? undefined}
      kind={categoryLabel(a.category, language)}
      date={formatDate(a.publishedAt ?? a.createdAt, language)}
      readTime={readTime(id ? a.contentId : a.contentEn)}
      image={articleImageUrl(a.coverImage) ?? undefined}
    />
  );

  const tabs: { key: string | null; label: string; count: number }[] = [
    { key: null, label: id ? "Semua" : "All", count: resources.length },
    ...RESOURCE_CATEGORIES.map((c) => ({
      key: c as string | null,
      label: categoryLabel(c, language),
      count: resources.filter((r) => r.category === c).length,
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("insights.subtitle")}
        title={t("insights.title")}
        lead={
          id
            ? "Temukan whitepapers, webinar recordings, case studies, dan tools yang dapat membantu transformasi organisasi Anda."
            : "Discover whitepapers, webinar recordings, case studies, and tools that can help transform your organization."
        }
      />

      <Band>
        <div role="tablist" aria-label={id ? "Jenis konten" : "Content type"} className="-mx-5 mb-12 flex gap-8 overflow-x-auto border-b border-stone-200 px-5 md:mx-0 md:px-0">
          {tabs.map((tab) => {
            const active = selected === tab.key;
            return (
              <button
                key={tab.label}
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(tab.key)}
                className={cn(
                  "-mb-px shrink-0 border-b-2 py-3 text-[0.9375rem] transition-colors",
                  active ? "border-petrol-600 font-medium text-ink" : "border-transparent text-stone-700 hover:text-ink"
                )}
              >
                {tab.label} <span className="type-meta ml-1 !tracking-normal text-stone-700">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <p role="status" className="text-stone-700">
            {id ? "Memuat…" : "Loading…"}
          </p>
        ) : visible.length === 0 ? (
          <div className="max-w-xl border-t border-ink pt-8">
            <h2 className="type-h2 mb-3">{id ? "Belum ada resources" : "No resources yet"}</h2>
            <p className="mb-6 text-lg text-stone-700">
              {id
                ? "Konten sedang disiapkan. Hubungi kami jika Anda membutuhkan materi tertentu."
                : "Content is being prepared. Contact us if you need specific materials."}
            </p>
            <Button href="/contact" variant="secondary" size="lg">{id ? "Hubungi Kami" : "Contact Us"}</Button>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-14 border-t border-ink pt-6 lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-12">
                {card(featured, "!border-0 !pt-0 lg:col-span-2")}
              </div>
            )}
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{rest.map((a) => card(a))}</div>
          </>
        )}
      </Band>

      <ClosingCTA
        title={id ? "Butuh resources khusus?" : "Need custom resources?"}
        lead={
          id
            ? "Hubungi kami untuk mendapatkan akses ke resources premium atau request materi khusus sesuai kebutuhan organisasi Anda."
            : "Contact us to get access to premium resources or request custom materials tailored to your organization's needs."
        }
      />
    </>
  );
}
