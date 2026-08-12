"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Calendar, Search, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TRAINING_DATE_FILTERS,
  TrainingDateFilter,
  isTrainingDateFilter,
} from "@/lib/training-filters";
import GoogleTranslateWidget from "@/components/google-translate/GoogleTranslateWidget";

interface Training {
  id: string;
  title: string;
  location: string;
  startDate: string;
  price: string | null;
  description: string;
  imagePath: string | null;
  _count: { registrants: number };
}

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

export default function InfoPelatihanPage() {
  const { t } = useLanguage();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<TrainingDateFilter | "">("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (dateFilter) params.set("filter", dateFilter);

      const res = await fetch(`/api/trainings?${params.toString()}`);
      if (res.ok) {
        setTrainings(await res.json());
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, dateFilter]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <Section variant="gradient" padding="xl" className="pt-32 sm:pt-36">
      <div className="notranslate">
        <SectionHeader
          subtitle="Training"
          title={t("nav.infoPelatihan")}
          description="Jadwal pelatihan dan program pengembangan"
          centered
        />
      </div>

      {/* Search + Filter */}
      <div className="notranslate flex flex-col sm:flex-row sm:items-center gap-3 mb-10 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelatihan..."
            className="pl-10 h-11 rounded-xl bg-white"
          />
        </div>
        <Select
          value={dateFilter || "semua"}
          onValueChange={(value) => {
            setDateFilter(value !== "semua" && isTrainingDateFilter(value) ? value : "");
          }}
        >
          <SelectTrigger className="h-11! w-40 rounded-xl bg-white px-4">
            <SelectValue placeholder="Filter periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {TRAINING_DATE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="notranslate flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="notranslate text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          Tidak ada pelatihan yang cocok dengan pencarian/filter saat ini.
        </div>
      ) : (
        /* Card List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training, index) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full overflow-hidden border border-slate-200 flex flex-col">
                <Link href={`/info-pelatihan/${training.id}`} className="relative h-44 bg-slate-100 flex items-center justify-center block">
                  {training.imagePath ? (
                    <Image
                      src={getImageUrl(training.imagePath) ?? ""}
                      alt={training.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  )}
                  {training.price && (
                    <Badge className="notranslate absolute top-3 right-3 bg-white/90 text-blue-700 border border-blue-100 backdrop-blur">
                      {training.price}
                    </Badge>
                  )}
                </Link>
                <CardContent className="p-5 flex flex-col flex-1">
                  <Link href={`/info-pelatihan/${training.id}`}>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mb-3 hover:text-blue-600 transition-colors">
                      {training.title}
                    </h3>
                  </Link>
                  <div className="notranslate space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{training.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {formatDate(training.startDate)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-5">
                    {training.description}
                  </p>
                  <div className="notranslate mt-auto">
                    <Link
                      href={`/info-pelatihan/${training.id}`}
                      className={cn(
                        buttonVariants({ variant: "primary", size: "sm" }),
                        "w-full"
                      )}
                    >
                      {t("nav.cta")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <GoogleTranslateWidget />
    </Section>
  );
}
