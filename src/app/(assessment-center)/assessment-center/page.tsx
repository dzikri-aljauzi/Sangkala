"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Users, Calendar } from "lucide-react";

interface Assessment {
  id: string;
  name: string;
  description: string | null;
  clientName: string;
  clientLogo: string | null;
  createdAt: string;
  _count: {
    users: number;
    documents: number;
    resumes: number;
    documentations: number;
  };
}

export default function AssessmentCenterPage() {
  const { t } = useLanguage();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <Section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            {t("assessmentCenter.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            {t("assessmentCenter.pageDescription")}
          </motion.p>
        </div>
      </Section>

      {/* Assessment List Section */}
      <Section className="py-16">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {t("assessmentCenter.listTitle")}
          </h2>
          <p className="text-slate-600">
            {t("assessmentCenter.selectAssessment")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-16 w-16 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-6">
              {t("assessmentCenter.noAssessments")}
            </p>
            <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-sm text-slate-700 mb-4">
                Belum ada assessment yang dibuat. Login sebagai admin untuk membuat assessment baru.
              </p>
              <Link href="/assessment-center/admin-login">
                <Button variant="primary" className="w-full">
                  Login sebagai Admin
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/assessment-center/${assessment.id}/login`}
                  className="block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Logo */}
                    <div
                      className={`flex items-center justify-center h-20 w-20 rounded-lg mb-4 group-hover:scale-110 transition-transform ${
                        assessment.clientLogo
                          ? "bg-white border border-slate-200"
                          : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      }`}
                    >
                      {assessment.clientLogo ? (
                        <Image
                          src={assessment.clientLogo}
                          alt={assessment.clientName}
                          width={80}
                          height={80}
                          className="object-contain p-2"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {assessment.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {assessment.clientName}
                    </p>
                    {assessment.description && (
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {assessment.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>{assessment._count.users}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span>{assessment._count.documents}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(assessment.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Login Indicator */}
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                    <p className="text-white text-sm font-medium text-center">
                      {t("assessmentCenter.login")} →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
