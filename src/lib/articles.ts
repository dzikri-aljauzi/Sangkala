// Tipe dan pembantu tampilan untuk artikel/insight (dipakai beranda, Insight, News & Article).

export interface ArticleSummary {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  excerptId: string | null;
  excerptEn: string | null;
  authorName: string;
  authorPosition: string | null;
  category: string;
  coverImage: string | null;
  imagePosition: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

type Lang = "id" | "en";

const labels: Record<string, Record<Lang, string>> = {
  WHITEPAPER: { id: "Whitepaper", en: "Whitepaper" },
  WEBINAR: { id: "Webinar", en: "Webinar" },
  CASE_STUDY: { id: "Studi Kasus", en: "Case Study" },
  TEMPLATE: { id: "Template", en: "Template" },
  ARTICLE: { id: "Artikel", en: "Article" },
  NEWS: { id: "Berita", en: "News" },
};

export function categoryLabel(category: string, lang: Lang) {
  return labels[category]?.[lang] ?? category;
}

export function articleImageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
}

export function readTime(content: string) {
  const minutes = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  return `${minutes} min`;
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
