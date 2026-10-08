"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  FileText,
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

const categoryLabels: Record<string, { id: string; en: string }> = {
  ARTICLE: { id: "Artikel", en: "Article" },
  WHITEPAPER: { id: "Whitepaper", en: "Whitepaper" },
  WEBINAR: { id: "Webinar & Event", en: "Webinar & Event" },
  CASE_STUDY: { id: "Case Study", en: "Case Study" },
  TEMPLATE: { id: "Tools & Template", en: "Tools & Template" },
};

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

export default function ArticleDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  const formatContent = (content: string) => {
    return content
      .split("\n\n")
      .map((paragraph, index) => {
        if (paragraph.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl sm:text-2xl font-bold text-stone-800 mt-8 mb-4">
              {paragraph.replace("## ", "")}
            </h2>
          );
        }
        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={index} className="text-lg sm:text-xl font-semibold text-stone-800 mt-6 mb-3">
              {paragraph.replace("### ", "")}
            </h3>
          );
        }

        if (paragraph.includes("\n- ")) {
          const items = paragraph.split("\n- ").filter(Boolean);
          return (
            <ul key={index} className="list-disc list-inside space-y-2 my-4 text-stone-700">
              {items.map((item, i) => (
                <li key={i}>{formatInlineText(item.replace(/^- /, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-stone-700 leading-relaxed mb-4">
            {formatInlineText(paragraph)}
          </p>
        );
      });
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24">
        <FileText className="w-16 h-16 text-stone-300 mb-4" />
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          {language === "id" ? "Artikel Tidak Ditemukan" : "Article Not Found"}
        </h1>
        <p className="text-stone-500 mb-6">
          {language === "id"
            ? "Artikel yang Anda cari tidak tersedia."
            : "The article you're looking for is not available."}
        </p>
        <Link href="/news-article">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "id" ? "Kembali ke News & Article" : "Back to News & Article"}
          </Button>
        </Link>
      </div>
    );
  }

  const title = language === "id" ? article.titleId : article.titleEn;
  const content = language === "id" ? article.contentId : article.contentEn;
  const categoryLabel = categoryLabels[article.category]?.[language] || article.category;

  return (
    <>
      {/* Hero/Header */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/news-article"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-petrol-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{language === "id" ? "Kembali ke News & Article" : "Back to News & Article"}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-petrol-600/10 text-petrol-600 text-sm font-medium rounded-full">
                {categoryLabel}
              </span>
              <span className="text-sm text-stone-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getReadTime(content)}
              </span>
              <span className="text-sm text-stone-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                  language === "id" ? "id-ID" : "en-US",
                  { dateStyle: "long" }
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-6">
              {title}
            </h1>

            <p className="text-stone-600">
              <span className="text-stone-500">{language === "id" ? "Oleh:" : "By:"}</span>{" "}
              <span className="font-semibold text-stone-800">{article.authorName}</span>
              {article.authorPosition && (
                <span className="text-stone-600"> – {article.authorPosition}</span>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {article.coverImage && (
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${
          article.imagePosition === "TOP" ? "-mt-4 mb-8" : ""
        }`}>
          {article.imagePosition === "TOP" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <img
                src={getImageUrl(article.coverImage) || ""}
                alt={title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Content */}
      <Section variant="default" padding="xl">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`${
              article.imagePosition === "LEFT" || article.imagePosition === "RIGHT"
                ? "flex flex-col md:flex-row gap-8"
                : ""
            }`}
          >
            {/* Left Image */}
            {article.coverImage && article.imagePosition === "LEFT" && (
              <div className="md:w-1/3 shrink-0">
                <img
                  src={getImageUrl(article.coverImage) || ""}
                  alt={title}
                  className="w-full h-auto rounded-xl shadow-lg sticky top-24"
                />
              </div>
            )}

            {/* Content */}
            <div className={`prose prose-lg max-w-none ${
              article.imagePosition === "LEFT" || article.imagePosition === "RIGHT"
                ? "md:w-2/3"
                : ""
            }`}>
              {/* Center Image */}
              {article.coverImage && article.imagePosition === "CENTER" && (
                <div className="float-none md:float-right md:ml-8 md:mb-4 md:w-1/2 mb-6">
                  <img
                    src={getImageUrl(article.coverImage) || ""}
                    alt={title}
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
              )}

              {formatContent(content)}
            </div>

            {/* Right Image */}
            {article.coverImage && article.imagePosition === "RIGHT" && (
              <div className="md:w-1/3 shrink-0">
                <img
                  src={getImageUrl(article.coverImage) || ""}
                  alt={title}
                  className="w-full h-auto rounded-xl shadow-lg sticky top-24"
                />
              </div>
            )}
          </motion.div>

          {/* Share & Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-stone-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-500">
                  {language === "id" ? "Bagikan artikel ini:" : "Share this article:"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert(language === "id" ? "Link disalin!" : "Link copied!");
                    }}
                    className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              </div>

              <Link href="/news-article">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === "id" ? "Lihat Artikel Lainnya" : "View More Articles"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
