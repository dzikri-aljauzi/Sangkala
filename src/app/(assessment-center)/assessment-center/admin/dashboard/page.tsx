"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  LogOut,
  FileText,
  Users,
  BookOpen,
  Camera,
  ChevronRight,
  LayoutDashboard,
  Award,
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/assessment-center/admin-login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/assessment-center/admin-login");
      return;
    }
    if (status === "authenticated") {
      fetchAssessments();
    }
  }, [status, session, router]);

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

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Admin Dashboard</p>
                <p className="text-xs text-slate-500">Leadership Nasional Asia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{session.user?.name}</p>
                <p className="text-xs text-slate-500">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/assessment-center/admin-login" })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Semua Assessment</h1>
            <p className="text-slate-500 mt-1">Kelola seluruh assessment dari satu tempat</p>
          </div>
          <Link
            href="/assessment-center/admin/dashboard/certificates"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Award className="w-4 h-4" />
            Kelola Sertifikat
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total Assessment", value: assessments.length, icon: LayoutDashboard, color: "text-blue-600 bg-blue-50" },
            { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-emerald-600 bg-emerald-50" },
            { label: "Total Dokumen", value: totalDocuments, icon: FileText, color: "text-orange-600 bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Assessment Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-14 w-14 bg-slate-200 rounded-lg mb-4" />
                <div className="h-5 bg-slate-200 rounded mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
                <div className="h-8 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <LayoutDashboard className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">Belum ada assessment</p>
            <p className="text-slate-400 text-sm mt-1">Assessment yang dibuat akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.15 }}
              >
                <Link
                  href={`/assessment-center/${assessment.id}/dashboard`}
                  className="group block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Logo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center justify-center h-14 w-14 rounded-xl ${
                        assessment.clientLogo ? "bg-white border border-slate-200" : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      }`}>
                        {assessment.clientLogo ? (
                          <Image
                            src={assessment.clientLogo}
                            alt={assessment.clientName}
                            width={56}
                            height={56}
                            className="object-contain p-1 rounded-xl"
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {assessment.clientName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Info */}
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {assessment.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">{assessment.clientName}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
                      {[
                        { icon: Users, value: assessment._count.users, label: "User" },
                        { icon: FileText, value: assessment._count.documents, label: "Dok" },
                        { icon: BookOpen, value: assessment._count.resumes, label: "Resume" },
                        { icon: Camera, value: assessment._count.documentations, label: "Foto" },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <stat.icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                          <p className="text-sm font-semibold text-slate-700">{stat.value}</p>
                          <p className="text-[10px] text-slate-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer bar */}
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all">
                    <p className="text-white text-sm font-medium text-center">
                      Kelola Assessment →
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
