import ArticleDetail from "@/components/sections/ArticleDetail";

export default function NewsArticleDetailPage() {
  return (
    <ArticleDetail
      backHref="/news-article"
      backLabel={{ id: "Kembali ke News & Article", en: "Back to News & Article" }}
    />
  );
}
