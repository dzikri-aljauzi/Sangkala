"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { SectionIntro } from "@/components/ui/section-intro";
import { InsightCard } from "@/components/ui/insight-card";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { useArticles } from "@/lib/use-articles";
import { articleImageUrl, categoryLabel, formatDate, readTime, type ArticleSummary } from "@/lib/articles";

export default function NewsArticlePage() {
  const { language, t } = useLanguage();
  const id = language === "id";
  const { items, loading } = useArticles("status=PUBLISHED&category=ARTICLE");

  const featured = items.filter((a) => a.isFeatured).slice(0, 3);
  const regular = items.filter((a) => !featured.includes(a));

  const card = (a: ArticleSummary) => (
    <InsightCard
      key={a.id}
      href={`/news-article/${a.slug}`}
      title={id ? a.titleId : a.titleEn}
      summary={(id ? a.excerptId : a.excerptEn) ?? undefined}
      kind={categoryLabel(a.category, language)}
      date={formatDate(a.publishedAt ?? a.createdAt, language)}
      readTime={readTime(id ? a.contentId : a.contentEn)}
      image={articleImageUrl(a.coverImage) ?? undefined}
    />
  );

  return (
    <>
      <PageHeader crumbs={[{ href: "/news-article", label: "News & Article" }]} art={{ variant: "waves", seed: 41 }} eyebrow={t("newsArticle.subtitle")} title={t("newsArticle.title")} lead={t("newsArticle.description")} />

      {loading ? (
        <Band>
          <p role="status" className="text-stone-700">{id ? "Memuat…" : "Loading…"}</p>
        </Band>
      ) : items.length === 0 ? (
        <Band>
          <p className="text-lg text-stone-700">{t("newsArticle.noArticles")}</p>
        </Band>
      ) : (
        <>
          {featured.length > 0 && (
            <Band>
              <SectionIntro number="01" eyebrow={id ? "Pilihan Editor" : "Editor's Pick"} title={t("newsArticle.featured")} />
              <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{featured.map(card)}</div>
            </Band>
          )}
          {regular.length > 0 && (
            <Band tone={featured.length > 0 ? "stone" : "paper"}>
              <SectionIntro number={featured.length > 0 ? "02" : "01"} eyebrow={id ? "Berita Terbaru" : "Latest News"} title={t("newsArticle.all")} />
              <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{regular.map(card)}</div>
            </Band>
          )}
        </>
      )}

      <ClosingCTA />
    </>
  );
}
