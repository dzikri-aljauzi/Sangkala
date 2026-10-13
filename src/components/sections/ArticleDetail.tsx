"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Link2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { articleImageUrl, categoryLabel, formatDate, readTime, type ArticleSummary } from "@/lib/articles";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/** Markdown ringan: ##, ###, daftar "- ", **tebal**, *miring*. */
function renderContent(content: string): ReactNode[] {
  return content.split("\n\n").map((p, i) => {
    if (p.startsWith("## ")) return <h2 key={i} className="type-h2 !text-[1.625rem] !leading-[2.125rem] mb-4 mt-12">{p.slice(3)}</h2>;
    if (p.startsWith("### ")) return <h3 key={i} className="type-h3 mb-3 mt-8">{p.slice(4)}</h3>;
    if (p.includes("\n- ")) {
      return (
        <ul key={i} className="my-6 list-disc space-y-2 pl-6 marker:text-stone-600">
          {p.split("\n- ").filter(Boolean).map((it, n) => <li key={n}>{inline(it.replace(/^- /, ""))}</li>)}
        </ul>
      );
    }
    return <p key={i} className="mb-6">{inline(p)}</p>;
  });
}

/** Detail artikel untuk /insights/[slug] dan /news-article/[slug]. */
export default function ArticleDetail({ backHref, backLabel }: { backHref: string; backLabel: { id: string; en: string } }) {
  const { language } = useLanguage();
  const id = language === "id";
  const slug = useParams().slug as string;
  const [article, setArticle] = useState<ArticleSummary | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    fetch(`/api/articles/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && (setArticle(d), setState("ok")))
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state === "loading") {
    return (
      <Container className="py-32">
        <p role="status" className="text-stone-700">{id ? "Memuat…" : "Loading…"}</p>
      </Container>
    );
  }

  if (state === "error" || !article) {
    return (
      <Container className="py-24 md:py-32">
        <p className="type-meta mb-4 text-petrol-600">404</p>
        <h1 className="type-h1 mb-4">{id ? "Artikel tidak ditemukan" : "Article not found"}</h1>
        <p className="prose-width mb-8 text-lg text-stone-700">
          {id ? "Artikel yang Anda cari tidak tersedia." : "The article you're looking for is not available."}
        </p>
        <Link href={backHref}>
          <Button variant="secondary" size="lg">← {backLabel[language]}</Button>
        </Link>
      </Container>
    );
  }

  const title = id ? article.titleId : article.titleEn;
  const content = id ? article.contentId : article.contentEn;
  const excerpt = id ? article.excerptId : article.excerptEn;
  const img = articleImageUrl(article.coverImage);
  const meta = [categoryLabel(article.category, language), formatDate(article.publishedAt ?? article.createdAt, language), readTime(content)].join(" · ");

  const figure = (cls: string) =>
    img && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={img} alt={title} className={`h-auto w-full rounded-lg ${cls}`} />
    );

  return (
    <article>
      <header className="border-b border-stone-200 pb-12 pt-10 md:pb-16 md:pt-14">
        <Container>
          <Link href={backHref} className="mb-10 inline-flex items-center gap-2 text-[0.9375rem] text-stone-700 transition-colors hover:text-petrol-600">
            <ArrowLeft aria-hidden className="size-4" />
            {backLabel[language]}
          </Link>
          <p className="type-meta mb-5 text-petrol-600">{meta}</p>
          <h1 className="type-h1 max-w-[24ch] md:max-w-[28ch]">{title}</h1>
          {excerpt && <p className="type-lead prose-width mt-6">{excerpt}</p>}
          <p className="mt-8 text-[0.9375rem] text-stone-700">
            {id ? "Oleh " : "By "}
            <span className="font-medium text-ink">{article.authorName}</span>
            {article.authorPosition && `, ${article.authorPosition}`}
          </p>
        </Container>
      </header>

      <Container className="py-12 md:py-16">
        {article.imagePosition === "TOP" && figure("mb-12 max-h-[28rem] object-cover")}
        <div className="mx-auto max-w-[68ch] text-lg leading-8 text-ink">
          {article.imagePosition === "CENTER" && figure("mb-10")}
          {(article.imagePosition === "LEFT" || article.imagePosition === "RIGHT") && img && (
            <div className={`mb-8 md:mb-4 md:w-1/2 ${article.imagePosition === "LEFT" ? "md:float-left md:mr-8" : "md:float-right md:ml-8"}`}>
              {figure("")}
            </div>
          )}
          {renderContent(content)}
        </div>

        <div className="mx-auto mt-14 flex max-w-[68ch] flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              });
            }}
            className="inline-flex items-center gap-2 text-[0.9375rem] text-stone-700 transition-colors hover:text-petrol-600"
          >
            <Link2 aria-hidden className="size-4" />
            {id ? "Salin tautan" : "Copy link"}
            <span role="status" className="text-petrol-600">{copied ? (id ? "· Tautan disalin" : "· Link copied") : ""}</span>
          </button>
          <Link href={backHref}>
            <Button variant="text">{id ? "Lihat artikel lainnya →" : "View more articles →"}</Button>
          </Link>
        </div>
      </Container>
    </article>
  );
}
