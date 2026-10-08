"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Video,
  FolderOpen,
  Download,
  ArrowRight,
  Calendar,
  Clock,
  User,
  FileText,
  Lightbulb,
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

const categories = [
  {
    id: "WHITEPAPER",
    icon: BookOpen,
    title: { id: "Whitepapers", en: "Whitepapers" },
    desc: { id: "Riset mendalam dan best practices", en: "In-depth research and best practices" },
    color: "bg-petrol-500",
  },
  {
    id: "WEBINAR",
    icon: Video,
    title: { id: "Webinar & Events", en: "Webinars & Events" },
    desc: { id: "Sesi interaktif dengan para ahli", en: "Interactive sessions with experts" },
    color: "bg-petrol-800",
  },
  {
    id: "CASE_STUDY",
    icon: FolderOpen,
    title: { id: "Case Studies", en: "Case Studies" },
    desc: { id: "Success stories dari klien kami", en: "Success stories from our clients" },
    color: "bg-petrol-600",
  },
  {
    id: "TEMPLATE",
    icon: Download,
    title: { id: "Tools & Templates", en: "Tools & Templates" },
    desc: { id: "Resources yang dapat diunduh", en: "Downloadable resources" },
    color: "bg-stone-700",
  },
];

const categoryLabels: Record<string, { id: string; en: string }> = {
  WHITEPAPER: { id: "Whitepaper", en: "Whitepaper" },
  WEBINAR: { id: "Webinar", en: "Webinar" },
  CASE_STUDY: { id: "Case Study", en: "Case Study" },
  TEMPLATE: { id: "Template", en: "Template" },
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

export default function InsightsPage() {
  const { language, t } = useLanguage();
  const [resources, setResources] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      // Fetch semua resource (WHITEPAPER, WEBINAR, CASE_STUDY, TEMPLATE)
      const res = await fetch("/api/articles?status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        // Filter hanya kategori resource (bukan ARTICLE)
        const filteredData = data.filter((item: Article) =>
          ["WHITEPAPER", "WEBINAR", "CASE_STUDY", "TEMPLATE"].includes(item.category)
        );
        setResources(filteredData);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = selectedCategory
    ? resources.filter((r) => r.category === selectedCategory)
    : resources;

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

  // Group resources by category for display
  const getResourcesByCategory = (categoryId: string) => {
    return resources.filter((r) => r.category === categoryId);
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
              <Lightbulb className="w-8 h-8 text-petrol-600" />
              <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-petrol-600">
                {t("insights.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {t("insights.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Temukan whitepapers, webinar recordings, case studies, dan tools yang dapat membantu transformasi organisasi Anda."
                : "Discover whitepapers, webinar recordings, case studies, and tools that can help transform your organization."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <Section variant="default" padding="lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category, index) => {
            const count = getResourcesByCategory(category.id).length;
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all border text-center group ${
                  selectedCategory === category.id
                    ? "bg-petrol-600 border-petrol-600 text-white"
                    : "bg-white border-stone-100 hover:border-petrol-200"
                }`}
              >
                <category.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 transition-colors ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "text-petrol-600 group-hover:text-petrol-600"
                }`} />
                <span className={`font-semibold text-xs sm:text-sm md:text-base block ${
                  selectedCategory === category.id ? "text-white" : "text-stone-800"
                }`}>
                  {category.title[language]}
                </span>
                <span className={`text-xs ${
                  selectedCategory === category.id ? "text-white/70" : "text-stone-400"
                }`}>
                  {count} {language === "id" ? "item" : "items"}
                </span>
              </motion.button>
            );
          })}
        </div>
        {selectedCategory && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-petrol-600 hover:text-petrol-800"
            >
              {language === "id" ? "× Hapus Filter" : "× Clear Filter"}
            </button>
          </div>
        )}
      </Section>

      {/* Resources Grid */}
      <Section variant="light" padding="xl">
        <SectionHeader
          title={
            selectedCategory
              ? categoryLabels[selectedCategory]?.[language] || "Resources"
              : language === "id" ? "Semua Resources" : "All Resources"
          }
          subtitle={language === "id" ? "Insight & Resources" : "Insights & Resources"}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">
              {language === "id" ? "Belum ada resources" : "No resources yet"}
            </p>
            <p className="text-sm text-stone-400 mt-2">
              {language === "id"
                ? "Hubungi kami untuk mendapatkan akses ke resources premium."
                : "Contact us to get access to premium resources."}
            </p>
            <Link href="/contact" className="inline-block mt-4">
              <Button variant="primary">
                {language === "id" ? "Hubungi Kami" : "Contact Us"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                language={language}
                index={index}
                getReadTime={getReadTime}
              />
            ))}
          </div>
        )}
      </Section>

      {/* CTA Section */}
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
                ? "Butuh Resources Khusus?"
                : "Need Custom Resources?"}
            </h2>
            <p className="text-sm sm:text-base text-stone-300 mb-6 sm:mb-8">
              {language === "id"
                ? "Hubungi kami untuk mendapatkan akses ke resources premium atau request materi khusus sesuai kebutuhan organisasi Anda."
                : "Contact us to get access to premium resources or request custom materials tailored to your organization's needs."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="gold" size="lg">
                  {language === "id" ? "Hubungi Kami" : "Contact Us"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/news-article">
                <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  {language === "id" ? "Lihat News & Article" : "View News & Article"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}

function ResourceCard({
  resource,
  language,
  index,
  getReadTime,
}: {
  resource: Article;
  language: "id" | "en";
  index: number;
  getReadTime: (content: string) => string;
}) {
  const title = language === "id" ? resource.titleId : resource.titleEn;
  const content = language === "id" ? resource.contentId : resource.contentEn;
  const excerpt = language === "id" ? resource.excerptId : resource.excerptEn;
  const categoryLabel = categoryLabels[resource.category]?.[language] || resource.category;

  const getCategoryIcon = () => {
    switch (resource.category) {
      case "WHITEPAPER": return BookOpen;
      case "WEBINAR": return Video;
      case "CASE_STUDY": return FolderOpen;
      case "TEMPLATE": return Download;
      default: return FileText;
    }
  };

  const getCategoryColor = () => {
    switch (resource.category) {
      case "WHITEPAPER": return "bg-petrol-600/10 text-petrol-600";
      case "WEBINAR": return "bg-petrol-800/10 text-petrol-800";
      case "CASE_STUDY": return "bg-emerald-600/10 text-emerald-600";
      case "TEMPLATE": return "bg-stone-700/10 text-stone-700";
      default: return "bg-stone-600/10 text-stone-600";
    }
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
    >
      <Link href={`/insights/${resource.slug}`}>
        {resource.coverImage ? (
          <div className="h-28 sm:h-32 md:h-40 bg-stone-100 overflow-hidden">
            <img
              src={getImageUrl(resource.coverImage) || ""}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className={`h-28 sm:h-32 md:h-40 ${
            resource.category === "WHITEPAPER" ? "bg-petrol-500" :
            resource.category === "WEBINAR" ? "bg-petrol-800" :
            resource.category === "CASE_STUDY" ? "bg-petrol-600" :
            "bg-stone-700"
          } flex items-center justify-center`}>
            <CategoryIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white/30" />
          </div>
        )}

        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded ${getCategoryColor()}`}>
              {categoryLabel}
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
              <span className="truncate max-w-[100px]">{resource.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>
                {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString(
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
