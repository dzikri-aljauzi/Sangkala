"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { controlClass } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah, formatTrainingDateRange } from "@/lib/utils";
import {
  TRAINING_DATE_FILTERS,
  TrainingDateFilter,
  isTrainingDateFilter,
} from "@/lib/training-filters";
import GoogleTranslateWidget from "@/components/google-translate/GoogleTranslateWidget";
import type { TrainingWithCount as Training } from "@/types/training";

export default function InfoPelatihanPage() {
  const { t, language } = useLanguage();
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

  return (
    <>
      <div className="notranslate">
        <PageHeader crumbs={[{ href: "/programs", label: "Program" }, { href: "/info-pelatihan", label: t("nav.infoPelatihan") }]} art={{ variant: "bars", seed: 44 }} eyebrow="Training" title={t("nav.infoPelatihan")} lead="Jadwal pelatihan dan program pengembangan" />
      </div>

      <Band>
        <div className="notranslate mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xl flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-700" />
            <input
              type="search"
              aria-label="Cari pelatihan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelatihan..."
              className={`${controlClass} pl-11`}
            />
          </div>
          <Select
            value={dateFilter || "semua"}
            onValueChange={(value) => {
              setDateFilter(value !== "semua" && isTrainingDateFilter(value) ? value : "");
            }}
          >
            <SelectTrigger aria-label="Filter periode" className="h-12! w-full rounded-lg bg-white px-4 sm:w-48">
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

        {loading ? (
          <p role="status" className="notranslate text-stone-700">Memuat…</p>
        ) : trainings.length === 0 ? (
          <p className="notranslate max-w-xl border-t border-ink pt-6 text-lg text-stone-700">
            Tidak ada pelatihan yang cocok dengan pencarian/filter saat ini.
          </p>
        ) : (
          <ul className="border-t border-ink">
            {trainings.map((tr) => {
              const full = tr.capacity !== null && tr._count.registrants >= tr.capacity;
              const left = tr.capacity !== null ? Math.max(0, tr.capacity - tr._count.registrants) : null;
              return (
                <li key={tr.id} className="border-b border-stone-200">
                  <Link
                    href={`/info-pelatihan/${tr.id}`}
                    className="group -mx-3 grid gap-x-8 gap-y-4 rounded-2xl px-3 py-7 transition-colors duration-300 hover:bg-petrol-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-600 md:grid-cols-[6rem_1fr_11rem] md:items-start"
                  >
                    {(() => {
                      const d = new Date(tr.startDate);
                      const loc = language === "en" ? "en-US" : "id-ID";
                      return (
                        <div className="notranslate flex w-20 flex-col items-center overflow-hidden rounded-xl border border-stone-200 bg-paper text-center transition-colors group-hover:border-petrol-600">
                          <span className="type-meta w-full bg-petrol-900 py-1 !tracking-widest text-sogan-200">{d.toLocaleDateString(loc, { month: "short" })}</span>
                          <span className="py-1 font-serif text-[2rem] leading-none text-ink">{d.toLocaleDateString(loc, { day: "2-digit" })}</span>
                          <span className="pb-1.5 font-mono text-[0.6875rem] text-stone-700">{d.getFullYear()}</span>
                        </div>
                      );
                    })()}
                    <div className="min-w-0">
                      <h2 className="type-card transition-colors group-hover:text-petrol-600">{tr.title}</h2>
                      <p className="notranslate mt-1 text-sm text-stone-700">
                        {formatTrainingDateRange(tr.startDate, tr.endDate, language === "en" ? "en-US" : "id-ID")} · {tr.location}
                      </p>
                      <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-stone-700">{tr.description}</p>
                    </div>
                    <div className="notranslate flex items-start justify-between gap-4 md:flex-col md:items-end md:text-right">
                      <div>
                        {tr.price && <p className="text-[0.9375rem] font-medium text-ink">{formatRupiah(tr.price)}</p>}
                        <p className="type-meta mt-1 !tracking-normal text-stone-700">
                          {full ? "Kuota penuh" : left !== null ? `Sisa ${left} kursi` : "Pendaftaran dibuka"}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-petrol-600">
                        {t("nav.cta")}
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Band>
      <GoogleTranslateWidget />
    </>
  );
}
