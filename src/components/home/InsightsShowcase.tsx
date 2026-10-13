"use client";

import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { InsightCard } from "@/components/ui/insight-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useArticles } from "@/lib/use-articles";
import { articleImageUrl, categoryLabel, formatDate, readTime } from "@/lib/articles";

/** Tiga publikasi terbaru. Disembunyikan bila belum ada artikel terbit. */
export default function InsightsShowcase() {
  const { language } = useLanguage();
  const id = language === "id";
  const { items } = useArticles();
  const list = items.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="bg-stone-100 py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="type-meta mb-5 flex items-center gap-3 text-petrol-600">
                <span className="text-sogan-600">07</span> Insight
              </p>
              <h2 className="type-display">{id ? "Pemikiran terbaru." : "Latest thinking."}</h2>
            </div>
            <Button href="/insights" variant="secondary" size="lg" className="group">
              {id ? "Semua insight" : "All insights"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Reveal>
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
          {list.map((a, i) => (
            <Reveal key={a.id} delay={i * 120}>
              <InsightCard
                href={a.category === "ARTICLE" ? `/news-article/${a.slug}` : `/insights/${a.slug}`}
                title={id ? a.titleId : a.titleEn}
                summary={(id ? a.excerptId : a.excerptEn) ?? undefined}
                kind={categoryLabel(a.category, language)}
                date={formatDate(a.publishedAt ?? a.createdAt, language)}
                readTime={readTime(id ? a.contentId : a.contentEn)}
                image={articleImageUrl(a.coverImage) ?? undefined}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
