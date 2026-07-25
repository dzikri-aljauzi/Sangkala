"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { BarChart3, CheckCircle2, Clock, ClipboardList, FileText, Download } from "lucide-react";

interface StaffKlienDashboardProps {
  assessmentId: string;
}

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

interface Progress {
  id: string;
  activityName: string;
  percentage: number;
  description: string | null;
  order: number;
}

interface Attendance {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  uploadedBy: {
    name: string;
  };
}

export default function StaffKlienDashboard({ assessmentId }: StaffKlienDashboardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "progress">("overview");

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
      fetchProgresses();
      fetchAttendances();
    }
  }, [assessmentId]);

  const fetchAttendances = async () => {
    try {
      const res = await fetch(`/api/attendance?assessmentId=${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgresses = async () => {
    try {
      const res = await fetch(`/api/progress?assessmentId=${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setProgresses(data);
      }
    } catch (error) {
      console.error("Error fetching progresses:", error);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const overallProgress = progresses.length > 0
    ? Math.round(progresses.reduce((acc, p) => acc + p.percentage, 0) / progresses.length)
    : 0;
  const completedCount = progresses.filter(p => p.percentage === 100).length;
  const inProgressCount = progresses.filter(p => p.percentage > 0 && p.percentage < 100).length;

  return (
    <DashboardWrapper
      assessmentName={`${assessment.name} - ${assessment.clientName}`}
      assessmentId={assessmentId}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            {assessment.clientLogo && (
              <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-center">
                <img
                  src={assessment.clientLogo}
                  alt={assessment.clientName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "progress" && "Progress Pelaksanaan"}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {activeTab === "overview" && "Selamat datang di portal assessment"}
                {activeTab === "progress" && "Pantau progress pelaksanaan assessment"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && (
          <div>
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-8 mb-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-2">
                {t("assessmentCenter.welcome")}, {session?.user?.name}!
              </h2>
              <p className="text-blue-100">
                Anda dapat memantau progress pelaksanaan assessment di halaman ini.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{overallProgress}%</p>
                    <p className="text-sm text-slate-600">Progress Keseluruhan</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
                    <p className="text-sm text-slate-600">Kegiatan Selesai</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
                    <p className="text-sm text-slate-600">Sedang Berjalan</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Progress Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Progress Terkini</h3>
                <button
                  onClick={() => setActiveTab("progress")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Lihat Detail →
                </button>
              </div>

              {progresses.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Belum ada progress yang tersedia
                </p>
              ) : (
                <div className="space-y-4">
                  {progresses.slice(0, 5).map((progress) => (
                    <div key={progress.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {progress.activityName}
                        </p>
                        <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress.percentage === 100
                                ? "bg-green-500"
                                : progress.percentage >= 50
                                ? "bg-blue-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 w-12 text-right">
                        {progress.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === "progress" && (
          <ProgressView progresses={progresses} attendances={attendances} />
        )}
      </div>
    </DashboardWrapper>
  );
}

// Progress View Component with Chart (same as KlienDashboard)
function ProgressView({ progresses, attendances }: { progresses: Progress[]; attendances: Attendance[] }) {
  const overallProgress = progresses.length > 0
    ? Math.round(progresses.reduce((acc, p) => acc + p.percentage, 0) / progresses.length)
    : 0;

  const completedCount = progresses.filter(p => p.percentage === 100).length;
  const inProgressCount = progresses.filter(p => p.percentage > 0 && p.percentage < 100).length;
  const notStartedCount = progresses.filter(p => p.percentage === 0).length;

  // If no progress and no attendance, show empty state
  if (progresses.length === 0 && attendances.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-slate-200 p-12 text-center"
      >
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">Belum ada progress yang tersedia</p>
        <p className="text-sm text-slate-400 mt-2">
          Progress akan muncul di sini ketika sudah diupdate oleh admin
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Only show progress section if there are progresses */}
      {progresses.length > 0 && (
        <>
          {/* Overall Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-medium text-blue-100 mb-1">Progress Keseluruhan</h3>
                <p className="text-4xl font-bold">{overallProgress}%</p>
                <p className="text-blue-100 text-sm mt-2">
                  {completedCount} dari {progresses.length} kegiatan selesai
                </p>
              </div>

              {/* Circular Progress Indicator */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallProgress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallProgress}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-white/20 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-white rounded-full h-3"
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                  <p className="text-sm text-slate-500">Selesai</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
                  <p className="text-sm text-slate-500">Sedang Berjalan</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{notStartedCount}</p>
                  <p className="text-sm text-slate-500">Belum Dimulai</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Detail Kegiatan</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {progresses.map((progress, index) => (
                <motion.div
                  key={progress.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        progress.percentage === 100
                          ? "bg-green-100 text-green-700"
                          : progress.percentage > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{progress.activityName}</h4>
                        {progress.description && (
                          <p className="text-sm text-slate-500 mt-0.5">{progress.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {progress.percentage === 100 && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      <span className={`text-lg font-bold ${
                        progress.percentage === 100
                          ? "text-green-600"
                          : progress.percentage > 0
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}>
                        {progress.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * index, ease: "easeOut" }}
                      className={`h-3 rounded-full ${
                        progress.percentage === 100
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : progress.percentage >= 50
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : progress.percentage > 0
                          ? "bg-gradient-to-r from-orange-400 to-yellow-400"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Attendance Files Section */}
      {attendances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">File Absensi</h3>
                <p className="text-sm text-slate-500">Dokumen absensi yang tersedia</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{attendance.title}</p>
                    <p className="text-sm text-slate-500 truncate">{attendance.fileName}</p>
                  </div>
                </div>
                <a
                  href={`/api/files${attendance.filePath.replace('/uploads/', '/')}?filename=${encodeURIComponent(attendance.fileName)}`}
                  download={attendance.fileName}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
