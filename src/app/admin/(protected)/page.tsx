"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AppHeader from "@/components/layout/AppHeader";
import {
  FileText,
  Users,
  BookOpen,
  Camera,
  ChevronRight,
  LayoutDashboard,
  Award,
  GraduationCap,
} from "lucide-react";

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

export default function AdminGlobalDashboardPage() {
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

  const totalUsers = assessments.reduce((sum, a) => sum + a._count.users, 0);
  const totalDocuments = assessments.reduce((sum, a) => sum + a._count.documents, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        title="Semua Assessment"
        subtitle="Kelola seluruh assessment dari satu tempat"
      />

      <div className="mt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Assessment", value: assessments.length, icon: LayoutDashboard, color: "text-primary bg-primary/10" },
            { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-ok bg-ok/10" },
            { label: "Total Dokumen", value: totalDocuments, icon: FileText, color: "text-ink-muted bg-hairline/60" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 rounded-lg border border-hairline bg-white p-5">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{stat.value}</p>
                <p className="text-xs text-ink-muted">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-hairline bg-white p-6">
                <div className="h-14 w-14 rounded-md bg-hairline mb-4" />
                <div className="h-5 rounded bg-hairline mb-2" />
                <div className="h-4 rounded bg-hairline w-2/3 mb-4" />
                <div className="h-8 rounded bg-hairline" />
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-white py-16 text-center">
            <LayoutDashboard className="mx-auto mb-4 h-14 w-14 text-hairline" />
            <p className="text-lg font-medium text-ink">Belum ada assessment</p>
            <p className="mt-1 text-sm text-ink-muted">Assessment yang dibuat akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-5 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.15 }}
              >
                <Link
                  href={`/assessment-center/${assessment.id}/overview`}
                  className="group block overflow-hidden rounded-lg border border-hairline bg-white transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="p-6">
                    {/* Logo */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-md ${
                        assessment.clientLogo ? "border border-hairline bg-white" : "bg-primary"
                      }`}>
                        {assessment.clientLogo ? (
                          <Image
                            src={assessment.clientLogo}
                            alt={assessment.clientName}
                            width={56}
                            height={56}
                            className="rounded-md p-1 object-contain"
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {assessment.clientName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-ink-muted transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    {/* Info */}
                    <h3 className="mb-1 line-clamp-1 font-semibold text-ink transition-colors group-hover:text-primary">
                      {assessment.name}
                    </h3>
                    <p className="mb-4 text-sm text-ink-muted">{assessment.clientName}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 border-t border-hairline pt-4">
                      {[
                        { icon: Users, value: assessment._count.users, label: "User" },
                        { icon: FileText, value: assessment._count.documents, label: "Dok" },
                        { icon: BookOpen, value: assessment._count.resumes, label: "Resume" },
                        { icon: Camera, value: assessment._count.documentations, label: "Foto" },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <stat.icon className="mx-auto mb-0.5 h-3.5 w-3.5 text-ink-muted" />
                          <p className="text-sm font-semibold text-ink">{stat.value}</p>
                          <p className="text-[10px] text-ink-muted">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer bar */}
                  <div className="bg-primary px-6 py-3 transition-colors group-hover:bg-primary/90">
                    <p className="text-center text-sm font-medium text-white">
                      Buka Workspace →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
