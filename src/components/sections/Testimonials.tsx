"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Quote, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company: string;
}

function TestimonialCard({
  testimonial,
  index,
  language,
}: {
  testimonial: Testimonial;
  index: number;
  language: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongQuote = testimonial.quote.length > 250;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full min-w-0 overflow-hidden"
    >
      <Quote className="absolute top-3 sm:top-6 right-3 sm:right-6 w-7 h-7 sm:w-10 sm:h-10 text-petrol-500/15 pointer-events-none" />

      {/* Author Info at Top */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 min-w-0 w-full">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-petrol-500 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-stone-800 text-sm sm:text-base truncate">
            {testimonial.author}
          </p>
          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 break-words">
            {testimonial.position}
          </p>
          <p className="text-xs sm:text-sm font-medium text-petrol-600 truncate">
            {testimonial.company}
          </p>
        </div>
      </div>

      {/* Quote */}
      <div className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={isExpanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-sm sm:text-base text-stone-600 italic leading-relaxed break-words ${
              !isExpanded && isLongQuote ? "line-clamp-4" : ""
            }`}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </motion.p>
        </AnimatePresence>

        {isLongQuote && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-petrol-600 hover:text-petrol-700 transition-colors"
          >
            {isExpanded ? (
              <>
                {language === "id" ? "Tampilkan Lebih Sedikit" : "Show Less"}
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                {language === "id" ? "Lihat Selengkapnya" : "Show More"}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Klien fiktif untuk keperluan portofolio (tanpa logo)
const clientLogos = [
  { name: "Bank Contoh A" },
  { name: "Bank Contoh B" },
  { name: "Bank Contoh C" },
  { name: "BUMN Contoh A" },
  { name: "BUMN Contoh B" },
  { name: "Universitas Contoh A" },
  { name: "Universitas Contoh B" },
  { name: "Fintech Contoh A" },
  { name: "Asosiasi Contoh A" },
  { name: "Lembaga Contoh A" },
];

function ClientLogosCarousel({ language }: { language: string }) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const itemsPerView = 5;
  const totalSlides = Math.ceil(clientLogos.length / itemsPerView);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const visibleLogos = clientLogos.slice(
    currentIndex * itemsPerView,
    currentIndex * itemsPerView + itemsPerView
  );

  // Fill with items from beginning if not enough
  const displayLogos = visibleLogos.length < itemsPerView
    ? [...visibleLogos, ...clientLogos.slice(0, itemsPerView - visibleLogos.length)]
    : visibleLogos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-stone-200 w-full max-w-full overflow-hidden"
    >
      <p className="text-center text-stone-500 mb-6 sm:mb-8 text-sm sm:text-base">
        {language === "id"
          ? "Contoh klien (fiktif, untuk portofolio)"
          : "Sample clients (fictional, for portfolio)"}
      </p>

      <div
        className="relative w-full max-w-full px-8 sm:px-12 md:px-14"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        ref={carouselRef}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-stone-600" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-stone-600" />
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden w-full max-w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-full"
            >
              {displayLogos.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center aspect-[4/3] w-full min-w-0 overflow-hidden"
                >
                  <span className="text-center font-mono text-xs sm:text-sm text-stone-700">
                    {logo.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hover hint */}
      <p className="text-center text-petrol-400 text-xs sm:text-sm mt-6">
        {language === "id"
          ? "* Hover pada carousel untuk pause animasi atau gunakan tombol navigasi"
          : "* Hover on carousel to pause animation or use navigation buttons"}
      </p>
    </motion.div>
  );
}

export default function Testimonials() {
  const { language } = useLanguage();

  // Testimoni fiktif untuk keperluan portofolio.
  const testimonials: Testimonial[] = [
    {
      quote:
        "Sangkala membantu kami merapikan proses penerbitan dan verifikasi sertifikat pelatihan. Pengingat masa berlaku membuat tidak ada lagi sertifikat yang lapse tanpa disadari.",
      author: "Contoh Klien A",
      position: "Kepala Divisi Manajemen Risiko",
      company: "Bank Contoh (fiktif)",
    },
    {
      quote:
        "Alur assessment center-nya jelas untuk setiap peran. Asesor, admin, dan peserta bisa menjalankan bagiannya tanpa saling menunggu.",
      author: "Contoh Klien B",
      position: "Kepala SDM",
      company: "BUMN Contoh (fiktif)",
    },
    {
      quote:
        "Kerangka People, Process, Technology yang dipakai Sangkala membuat program pelatihan kami terhubung langsung dengan proses dan sistem yang berjalan.",
      author: "Contoh Klien C",
      position: "Wakil Ketua Bidang Akademik",
      company: "Universitas Contoh (fiktif)",
    },
  ];

  return (
    <Section id="testimonials" variant="light" padding="xl" className="w-full max-w-full overflow-hidden">
      <SectionHeader
        title={language === "id" ? "Klien & Testimoni" : "Clients & Testimonials"}
        subtitle={
          language === "id"
            ? "Kepercayaan dan apresiasi dari para pemimpin industri yang telah bermitra dengan kami"
            : "Trust and appreciation from industry leaders who have partnered with us"
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-full">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            testimonial={testimonial}
            index={index}
            language={language}
          />
        ))}
      </div>

      {/* Client logos carousel section */}
      <ClientLogosCarousel language={language} />
    </Section>
  );
}
