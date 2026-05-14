"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section, SectionHeader } from "@/components/ui/section";
import { Quote, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company: string;
  image?: string;
  imagePosition?: string;
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
      className="relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <Quote className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 text-blue-500/15" />

      {/* Author Info at Top */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        {testimonial.image ? (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-blue-100 flex-shrink-0">
            <Image
              src={testimonial.image}
              alt={testimonial.author}
              fill
              className="object-cover"
              style={{ objectPosition: testimonial.imagePosition || "center" }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
            {testimonial.author}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
            {testimonial.position}
          </p>
          <p className="text-xs sm:text-sm font-medium text-blue-600">
            {testimonial.company}
          </p>
        </div>
      </div>

      {/* Quote */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={isExpanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-sm sm:text-base text-slate-600 italic leading-relaxed ${
              !isExpanded && isLongQuote ? "line-clamp-4" : ""
            }`}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </motion.p>
        </AnimatePresence>

        {isLongQuote && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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

// Client logos data
const clientLogos = [
  { name: "Bank Bengkulu", src: "/client/BankBengkulu.png" },
  { name: "Bank BPD DIY", src: "/client/BankBPDDIY.png" },
  { name: "Universitas BPD", src: "/client/UniversitasBPD.png" },
  { name: "STIE YKPN", src: "/client/STIEYKPN.png" },
  { name: "Universitas Mulawarman", src: "/client/UniversitasMulawarman.png" },
  { name: "Bank Jateng", src: "/client/bankjateng.png" },
  { name: "Bank Sumsel", src: "/client/banksumsel.png" },
  { name: "Bank BPD Bali", src: "/client/bankbpdbali.png" },
  { name: "Bank Kaltimtara", src: "/client/Bankaltimtara.png" },
  { name: "BSI", src: "/client/bsi.png" },
  { name: "Bank Aceh", src: "/client/bankaceh.png" },
  { name: "Bank Jatim", src: "/client/bankjatim.png" },
  { name: "Dirgantara Indonesia", src: "/client/Dirgantara Indonesia.jpg" },
  { name: "BNI", src: "/client/bni.png" },
  { name: "Mandiri", src: "/client/mandiri.png" },
  { name: "NTP", src: "/client/ntp.png" },
  { name: "Bank BJB Syariah", src: "/client/bankbjpsyariah.jpg" },
  { name: "BPKH", src: "/client/bpkh.png" },
  { name: "Bank BJB", src: "/client/bankbjb.png" },
  { name: "China Construction Bank", src: "/client/China_Construction_Bank_Indonesia.png" },
  { name: "Bank Muamalat", src: "/client/bankmuamalat.png" },
  { name: "Bank Resona", src: "/client/BankResona.png" },
  { name: "Bank Banten", src: "/client/BankBanten.png" },
  { name: "BCA", src: "/client/bca.png" },
  { name: "Bank Jambi", src: "/client/bankjambi.png" },
  { name: "Bank Kalbar", src: "/client/BankKalbar.png" },
  { name: "PKN STAN", src: "/client/logoSTAN.png" },
  { name: "Bank DKI", src: "/client/BankDKI..png" },
  { name: "Bank Artha Graha", src: "/client/Bank_Artha_Graha_Internasional.png" },
  { name: "QNB", src: "/client/Logo_Qatar_National_Bank.png" },
  { name: "iWISE", src: "/client/iWISE.png" },
  { name: "DP Information Group", src: "/client/DP_Information_Group.png" },
  { name: "Bank Maluku Malut", src: "/client/Logo_Bank_Maluku_Malut.png" },
  { name: "Bank Sulteng", src: "/client/Logo_Bank_Sulteng.png" },
  { name: "Bank Sumut", src: "/client/Logo_Bank_Sumut.png" },
  { name: "UPNVJ", src: "/client/Logo_UPNVJ.png" },
  { name: "Bank NTB Syariah", src: "/client/BankNTBSyariah.png" },
  { name: "Bank Aceh Syariah", src: "/client/Logo_Bank_Aceh_Syariah.png" },
  { name: "Bank Riau Kepri", src: "/client/Logo_bankriaukepri.png" },
  { name: "BSMR", src: "/client/bsmr.JPG" },
  { name: "LSP TRK", src: "/client/lsptrk.PNG" },
  { name: "LSP KS", src: "/client/lspks.PNG" },
  { name: "APINDO", src: "/client/apindo.JPG" },
  { name: "LSP PM", src: "/client/lsppm.png" },
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
      className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-200"
    >
      <p className="text-center text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base">
        {language === "id"
          ? "Dipercaya oleh institusi terkemuka"
          : "Trusted by leading institutions"}
      </p>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        ref={carouselRef}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden mx-12 sm:mx-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {displayLogos.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center aspect-[4/3]"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hover hint */}
      <p className="text-center text-blue-400 text-xs sm:text-sm mt-6">
        {language === "id"
          ? "* Hover pada carousel untuk pause animasi atau gunakan tombol navigasi"
          : "* Hover on carousel to pause animation or use navigation buttons"}
      </p>
    </motion.div>
  );
}

export default function Testimonials() {
  const { language } = useLanguage();

  const testimonials: Testimonial[] = [
    {
      quote:
        "Pelatihan manajemen risiko perbankan yang diselenggarakan oleh Leadership Nasional sangat bermanfaat dan aplikatif. Materi yang disampaikan terstruktur dengan baik dan relevan dengan tantangan yang dihadapi industri perbankan saat ini. Fasilitatornya berpengalaman dan mampu menjelaskan konsep-konsep kompleks dengan cara yang mudah dipahami. Pelatihan ini memberikan wawasan baru serta meningkatkan kemampuan analisis dan pengambilan keputusan dalam pengelolaan risiko di perbankan.",
      author: "Adhitya Pranajaya",
      position: "Kepala Cabang",
      company: "Bank BPD Bali",
      image: "/testi/adhitya.jpeg",
      imagePosition: "center top",
    },
    {
      quote:
        "Pelatihan memaparkan konsep BJR secara terstruktur. Saya apresiasi kualitas diskusi yang membuat materi hidup dan aplikatif. Saya merekomendasikan pelatihan dari LNA bagi pimpinan manapun yang ingin memperkuat landasan pengambilan keputusan.",
      author: "Ari Supangat",
      position: "Deputi Analisis Portofolio, Penyelesaian Transaksi dan Penempatan",
      company: "BPKH",
      image: "/testi/Supangat.jpeg",
      imagePosition: "center top",
    },
    {
      quote:
        "Saya sangat terkesan dengan pelatihan IT GRC di LNA. Memberikan manfaat strategis dalam memperkuat tata kelola teknologi informasi yang selaras dengan tujuan bisnis dan regulasi.",
      author: "Dodit Wiweko Probojakti",
      position: "Direktur IT, Digital, dan Operasional",
      company: "Bank Jatim",
      image: "/testi/wiweko.jpeg",
      imagePosition: "center top",
    },
    {
      quote:
        "Sebagai Direktur Manajemen Risiko dan Kepatuhan, saya mengapresiasi peran strategis Leadership Nasional Asia dalam menyusun Blueprint Kepatuhan dan Manajemen Risiko kami. LNA berhasil menciptakan kerangka kerja yang tidak hanya kokoh secara teknis untuk memitigasi risiko, tetapi juga adaptif terhadap dinamika bisnis. Blueprint ini secara signifikan memperkuat fondasi tata kelola kami dan menciptakan budaya risiko dan budaya kepatuhan yang visioner, menjadikannya peta jalan strategis menuju operasional perbankan yang lebih modern dan berdaya saing serta memenuhi GRC.",
      author: "Erik Abibon",
      position: "Direktur Manajemen Risiko dan Kepatuhan",
      company: "Bank Jateng",
      image: "/testi/Abibon.jpeg",
      imagePosition: "center 20%",
    },
    {
      quote:
        "Kami mengapresiasi peran Leadership Nasional Asia dalam penyusunan Blueprint SDM di Bank BPD DIY. Blueprint ini menjadi fondasi penting dalam mencetak SDM yang adaptif terhadap perubahan teknologi, sekaligus mendorong peningkatan produktivitas melalui indikator Earning per Employee (EPE). Dengan sinergi antara pengembangan kompetensi dan target bisnis yang terukur, kami yakin langkah ini akan memperkuat daya saing bank dalam menghadapi era digital.",
      author: "Hudan Mulyawan",
      position: "Direktur Umum",
      company: "Bank BPD DIY",
      image: "/testi/hudan.jpeg",
    },
    {
      quote:
        "Kami mengapresiasi kontribusi Leadership Nasional Asia dalam mendukung penguatan tata kelola, manajemen risiko, dan kepatuhan di Bank BPD Bali. Pendekatan yang komprehensif dan visioner telah membantu kami menyusun kerangka kerja GRC (Governance, Risk, and Compliance) yang tidak hanya memenuhi regulasi, tetapi juga selaras dengan strategi bisnis jangka panjang. Pencapaian kinerja dengan penerapan prudential dan berbagai pengakuan sebagai The High Performing Compliance Director on GRC menjadi bukti nyata bahwa fondasi GRC yang kokoh mampu mendorong peningkatan kualitas bisnis dan layanan perbankan kami. Kolaborasi strategis seperti Focus Group Discussion bersama Kejaksaan Tinggi Bali juga semakin memperkuat mitigasi risiko hukum, memastikan setiap aspek kepatuhan berjalan transparan dan sesuai regulasi yang berlaku. Ke depan, kami berkomitmen untuk terus menerapkan prinsip tata kelola yang baik secara berkelanjutan guna mendukung pertumbuhan bisnis yang sehat dan terpercaya.",
      author: "Drs. I Wayan Sutela Negara, M.M.",
      position: "Direktur Kepatuhan",
      company: "Bank BPD Bali",
      image: "/testi/wayan.jpeg",
    },
    {
      quote:
        "Sebagai Wakil Ketua I Bidang Akademik STIE YKPN, saya memandang bahwa program pendidikan dan pelatihan yang diselenggarakan oleh Leadership Nasional Asia memberikan nilai tambah yang signifikan bagi penguatan kapasitas akademik dan tata kelola institusi. Materi yang disampaikan tidak hanya relevan dengan perkembangan strategi inovasi, Governance, Risk, and Compliance (GRC), serta keberlanjutan bisnis, tetapi juga dikemas secara sistematis, aplikatif, dan selaras dengan kebutuhan sektor perbankan, keuangan, maupun pendidikan tinggi. Pendekatan berbasis praktik, dukungan teknologi, serta perspektif kepemimpinan yang kuat menjadikan setiap sesi pelatihan berdampak nyata dalam meningkatkan kompetensi peserta dan memperluas wawasan strategis. Kami mengapresiasi komitmen Leadership Nasional Asia dalam menghadirkan program yang profesional, adaptif terhadap perubahan industri, serta berorientasi pada kinerja berkelanjutan dan kontribusi bagi kemajuan bangsa.",
      author: "Cahyo Indraswono SE., M.Sc., Ak., CA., CRP.",
      position: "Wakil Ketua I Bidang Akademik",
      company: "STIE YKPN School Of Business",
      image: "/testi/Cahyo.jpeg",
      imagePosition: "center top",
    },
  ];

  return (
    <Section id="testimonials" variant="light" padding="xl">
      <SectionHeader
        title={language === "id" ? "Klien & Testimoni" : "Clients & Testimonials"}
        subtitle={
          language === "id"
            ? "Kepercayaan dan apresiasi dari para pemimpin industri yang telah bermitra dengan kami"
            : "Trust and appreciation from industry leaders who have partnered with us"
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
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
