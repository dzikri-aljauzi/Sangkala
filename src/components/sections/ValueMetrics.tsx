"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Building2, Users, Star, Award } from "lucide-react";

const metrics = [
  {
    icon: Building2,
    value: "100+ Projects Consultant",
    key: "metrics.institutions",
  },
  {
    icon: Users,
    value: "15,000+",
    key: "metrics.professionals",
  },
  {
    icon: Star,
    value: "99%",
    key: "metrics.satisfaction",
  },
  {
    icon: Award,
    value: "ISO 9001",
    key: "metrics.certified",
  },
];

export default function ValueMetrics() {
  const { t } = useLanguage();

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white relative -mt-6 sm:-mt-10 md:-mt-16 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 md:p-10 lg:p-12 border border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-3 sm:mb-4">
                  <metric.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-lg min-[400px]:text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1 break-words">
                  {metric.value}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-tight px-1">
                  {t(metric.key)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
