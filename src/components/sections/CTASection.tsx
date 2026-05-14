"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

export default function CTASection() {
  const { language } = useLanguage();

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-64 sm:w-96 h-64 sm:h-96 bg-blue-200/30 rounded-full blur-[80px] sm:blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-200/30 rounded-full blur-[80px] sm:blur-[100px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6"
          >
            {language === "id"
              ? "Siap Membangun Kinerja Berkelanjutan?"
              : "Ready to Build Sustainable Performance?"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
          >
            {language === "id"
              ? "Konsultasi gratis 30 menit untuk mendiskusikan kebutuhan transformasi organisasi Anda."
              : "Free 30-minute consultation to discuss your organization's transformation needs."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="group w-full sm:w-auto shadow-lg justify-center">
                {language === "id" ? "Jadwalkan Konsultasi" : "Schedule Consultation"}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/programs" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center">
                {language === "id" ? "Lihat Program Kami" : "View Our Programs"}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center text-slate-500"
          >
            <a
              href="tel:+622129538817"
              className="flex items-center gap-2 hover:text-blue-600 transition-colors text-xs sm:text-sm md:text-base"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>021-29538817</span>
            </a>
            <span className="hidden sm:block text-slate-300">|</span>
            <a
              href="mailto:leadership.nasional@gmail.com"
              className="flex items-center gap-2 hover:text-blue-600 transition-colors text-xs sm:text-sm md:text-base"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="break-all sm:break-normal">leadership.nasional@gmail.com</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
