"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Newspaper,
} from "lucide-react";

interface Article {
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

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/uploads/")) {
    return `/api/public/images${path}`;
  }
  return path;
};

export default function NewsArticlePage() {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Hanya fetch artikel dengan kategori ARTICLE
      const res = await fetch("/api/articles?status=PUBLISHED&category=ARTICLE");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticles = articles.filter((a) => a.isFeatured);
  const regularArticles = articles.filter((a) => !a.isFeatured);

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-8 h-8 text-petrol-600" />
              <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-petrol-600">
                {t("newsArticle.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {t("newsArticle.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {t("newsArticle.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <Section variant="default" padding="xl">
          <SectionHeader
            title={t("newsArticle.featured")}
            subtitle={language === "id" ? "Pilihan Editor" : "Editor's Pick"}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredArticles.slice(0, 3).map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                language={language}
                index={index}
                getReadTime={getReadTime}
              />
            ))}
          </div>
        </Section>
      )}

      {/* All Articles */}
      <Section variant={featuredArticles.length > 0 ? "light" : "default"} padding="xl">
        <SectionHeader
          title={t("newsArticle.all")}
          subtitle={language === "id" ? "Berita Terbaru" : "Latest News"}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">
              {t("newsArticle.noArticles")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {(featuredArticles.length > 0 ? regularArticles : articles).map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                language={language}
                index={index}
                getReadTime={getReadTime}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Newsletter CTA */}
      <Section variant="dark" padding="xl">
        <div className="max-w-2xl mx-auto text-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {language === "id"
                ? "Dapatkan Berita Terbaru"
                : "Get the Latest News"}
            </h2>
            <p className="text-sm sm:text-base text-stone-300 mb-6 sm:mb-8">
              {language === "id"
                ? "Berlangganan newsletter bulanan kami untuk mendapatkan berita dan artikel terbaru."
                : "Subscribe to our monthly newsletter for the latest news and articles."}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={language === "id" ? "Email Anda" : "Your Email"}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#2a7c82] text-sm sm:text-base"
              />
              <Button variant="gold" size="lg" className="w-full sm:w-auto justify-center">
                {language === "id" ? "Berlangganan" : "Subscribe"}
              </Button>
            </form>
          </motion.div>
        </div>
      </Section>
    </>
  );
}

function ArticleCard({
  article,
  language,
  index,
  getReadTime,
}: {
  article: Article;
  language: "id" | "en";
  index: number;
  getReadTime: (content: string) => string;
}) {
  const title = language === "id" ? article.titleId : article.titleEn;
  const content = language === "id" ? article.contentId : article.contentEn;
  const excerpt = language === "id" ? article.excerptId : article.excerptEn;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
    >
      <Link href={`/news-article/${article.slug}`}>
        {article.coverImage ? (
          <div className="h-28 sm:h-32 md:h-40 bg-stone-100 overflow-hidden">
            <img
              src={getImageUrl(article.coverImage) || ""}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-28 sm:h-32 md:h-40 bg-petrol-500 flex items-center justify-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white/30" />
          </div>
        )}

        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-petrol-600/10 text-petrol-600 text-[10px] sm:text-xs font-medium rounded">
              {language === "id" ? "Artikel" : "Article"}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {getReadTime(content)}
            </span>
          </div>

          <h3 className="font-bold text-stone-800 mb-2 sm:mb-3 group-hover:text-petrol-600 transition-colors line-clamp-2 text-sm sm:text-base">
            {title}
          </h3>

          {excerpt && (
            <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 mb-3">
              {excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[100px]">{article.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                  language === "id" ? "id-ID" : "en-US",
                  { dateStyle: "medium" }
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
