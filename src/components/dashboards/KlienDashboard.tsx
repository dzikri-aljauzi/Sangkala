"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { FoldersView, BatchListView } from "@/components/shared/ResumeFolderViews";
import { FileText, Image as ImageIcon, LogOut, Download, File, X, BarChart3, CheckCircle2, Clock, FolderOpen, Layers, User, ChevronRight, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown, ClipboardList } from "lucide-react";

interface KlienDashboardProps {
  assessmentId: string;
}

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
  resumes: any[];
  documentations: any[];
  echelons: Echelon[];
}

interface Echelon {
  id: string;
  name: string;
  order: number;
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

export default function KlienDashboard({ assessmentId }: KlienDashboardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "resumes" | "documentations" | "progress">(
    "overview"
  );

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/assessment-center" });
  };

  if (loading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                {activeTab === "resumes" && t("assessmentCenter.resumes")}
                {activeTab === "documentations" && t("assessmentCenter.documentations")}
                {activeTab === "progress" && "Progress Pelaksanaan"}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {activeTab === "overview" && "Selamat datang di portal assessment Anda"}
                {activeTab === "resumes" && "Resume dan laporan assessment"}
                {activeTab === "documentations" && "Dokumentasi dan file pendukung"}
                {activeTab === "progress" && "Pantau progress pelaksanaan assessment Anda"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
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
                Berikut adalah dokumen-dokumen assessment Anda yang telah disiapkan
                oleh tim kami. Anda dapat mengunduh dan melihat dokumen-dokumen
                tersebut.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {assessment.resumes.length}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {t("assessmentCenter.resumes")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {assessment.documentations.length}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {t("assessmentCenter.documentations")}
                </p>
              </motion.div>
            </div>
          </div>
        )}

        {/* Resume Folder View */}
        {activeTab === "resumes" && (
          <ResumeFolderView
            resumes={assessment.resumes}
            echelons={assessment.echelons || []}
          />
        )}

        {activeTab === "documentations" && (
          <FilesList
            files={assessment.documentations}
            title={t("assessmentCenter.documentations")}
            emptyMessage="Belum ada dokumentasi yang tersedia"
            icon={ImageIcon}
            color="green"
          />
        )}

        {activeTab === "progress" && (
          <ProgressView progresses={progresses} attendances={attendances} />
        )}
      </div>
    </DashboardWrapper>
  );
}

// Progress View Component with Chart
function ProgressView({ progresses, attendances }: { progresses: Progress[]; attendances: Attendance[] }) {
  // Calculate overall progress
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

          {/* Progress List with Bar Chart */}
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

// Files List Component
function FilesList({
  files,
  title,
  emptyMessage,
  icon: Icon,
  color,
}: {
  files: any[];
  title: string;
  emptyMessage: string;
  icon: any;
  color: string;
}) {
  const { t } = useLanguage();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const colorClasses: any = {
    blue: {
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: "hover:bg-blue-200",
    },
    green: {
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-100",
      text: "text-green-600",
      hover: "hover:bg-green-200",
    },
  };

  const colors = colorClasses[color];

  // Check if a file is an image
  const isImageFile = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-slate-200 p-12 text-center"
      >
        <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">{emptyMessage}</p>
        <p className="text-sm text-slate-400 mt-2">
          Dokumen akan muncul di sini ketika sudah diupload oleh admin
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file, index) => {
          const isImage = isImageFile(file.fileName);

          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Header — Image Preview or Gradient */}
              {isImage ? (
                <div
                  className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => setLightboxImage(file.filePath)}
                >
                  <img
                    src={file.filePath}
                    alt={file.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <ImageIcon className="w-5 h-5 text-slate-700" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`bg-gradient-to-br ${colors.gradient} p-6 flex items-center justify-center`}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                  {file.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <File className="w-4 h-4" />
                    <span className="truncate">{file.fileName}</span>
                  </div>

                  {file.uploadedBy && (
                    <div className="text-xs text-slate-500">
                      Uploaded by: {file.uploadedBy.name}
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isImage && (
                    <button
                      onClick={() => setLightboxImage(file.filePath)}
                      className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-all text-sm`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Lihat
                    </button>
                  )}
                  <a
                    href={`${file.filePath.startsWith('/api/files') ? file.filePath : `/api/files${file.filePath.replace('/uploads/', '/')}`}?filename=${encodeURIComponent(file.fileName)}`}
                    download={file.fileName}
                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-lg ${colors.bg} ${colors.text} ${colors.hover} font-medium transition-all text-sm group-hover:shadow-md`}
                  >
                    <Download className="w-4 h-4" />
                    {t("assessmentCenter.download")}
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage}
              alt="Full size preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="mt-3 text-center">
              <a
                href={lightboxImage}
                download
                className="inline-flex items-center gap-2 px-6 py-2 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Resume Folder View Component
function ResumeFolderView({
  resumes,
  echelons,
}: {
  resumes: any[];
  echelons: Echelon[];
}) {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<"folders" | "umum" | "eselon" | "individu">("folders");
  const [selectedEchelonId, setSelectedEchelonId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const sortedResumes = [...resumes].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  const umumResumes = sortedResumes.filter((r) => r.category === "UMUM" || !r.category);
  const eselonResumes = sortedResumes.filter((r) => r.category === "ESELON");
  const individuResumes = sortedResumes.filter((r) => r.category === "INDIVIDU");

  const eselonGrouped = echelons.map((echelon) => ({
    ...echelon,
    resumes: eselonResumes.filter((r) => r.echelonId === echelon.id),
  }));

  const batches = useMemo(() => {
    const map = new Map<string, { id: string; name: string; createdAt: string }>();
    resumes.forEach((r) => {
      if (r.resumeBatch && !map.has(r.resumeBatch.id)) {
        map.set(r.resumeBatch.id, r.resumeBatch);
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [resumes]);

  const getBatchUmum = (batchId: string) => umumResumes.filter((r) => r.resumeBatch?.id === batchId);
  const getBatchEselonGrouped = (batchId: string) =>
    echelons.map((echelon) => ({
      ...echelon,
      resumes: eselonResumes.filter(
        (r) => r.echelonId === echelon.id && r.resumeBatch?.id === batchId
      ),
    }));
  const getBatchIndividu = (batchId: string) => individuResumes.filter((r) => r.resumeBatch?.id === batchId);

  const selectedEchelon = selectedEchelonId
    ? eselonGrouped.find((e) => e.id === selectedEchelonId)
    : null;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedBatchId]);

  const goBack = () => {
    if (selectedEchelonId) {
      setSelectedEchelonId(null);
    } else if (selectedBatchId) {
      setSelectedBatchId(null);
      setPage(1);
      setSearchQuery("");
    } else {
      setCurrentView("folders");
    }
  };

  if (currentView === "folders") {
    return <FoldersView
      umumResumes={umumResumes}
      eselonResumes={eselonResumes}
      individuResumes={individuResumes}
      echelons={echelons}
      resumes={resumes}
      setCurrentView={setCurrentView}
    />;
  }

  if (currentView === "umum") {
    if (!selectedBatchId) {
      return (
        <BatchListView
          batches={batches}
          resumes={umumResumes}
          title="Hasil Keseluruhan - Umum"
          iconColor="blue"
          onSelect={setSelectedBatchId}
          goBackToFolders={() => {
            setSelectedBatchId(null);
            setCurrentView("folders");
          }}
        />
      );
    }

    const batchUmum = getBatchUmum(selectedBatchId);
    const batch = batches.find((b) => b.id === selectedBatchId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Hasil Keseluruhan - Umum</h2>
              <p className="text-xs text-slate-500">{batch?.name}</p>
            </div>
          </div>
        </div>

        {batchUmum.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada resume umum di batch ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchUmum.map((file) => (
              <ResumeFileCard key={file.id} file={file} color="blue" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentView === "eselon") {
    if (!selectedBatchId) {
      return (
        <BatchListView
          batches={batches}
          resumes={eselonResumes}
          title="Hasil Keseluruhan - Per Eselon"
          iconColor="purple"
          onSelect={setSelectedBatchId}
          goBackToFolders={() => {
            setSelectedBatchId(null);
            setCurrentView("folders");
          }}
        />
      );
    }

    if (!selectedEchelonId) {
      const batch = batches.find((b) => b.id === selectedBatchId);
      const batchEselonGrouped = getBatchEselonGrouped(selectedBatchId);

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Hasil Keseluruhan - Per Eselon</h2>
                <p className="text-xs text-slate-500">{batch?.name}</p>
              </div>
            </div>
          </div>

          {echelons.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Belum ada kategori eselon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchEselonGrouped.map((echelon) => (
                <motion.button
                  key={echelon.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedEchelonId(echelon.id)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:shadow-lg hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{echelon.name}</p>
                      <p className="text-sm text-slate-500">{echelon.resumes.length} file</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      );
    }

    const selectedEchelonObj = selectedEchelonId
      ? getBatchEselonGrouped(selectedBatchId).find((e) => e.id === selectedEchelonId)
      : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{selectedEchelonObj?.name}</h2>
          </div>
        </div>

        {!selectedEchelonObj || selectedEchelonObj.resumes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada resume untuk eselon ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedEchelonObj.resumes.map((file: any) => (
              <ResumeFileCard key={file.id} file={file} color="purple" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentView === "individu") {
    if (!selectedBatchId) {
      return (
        <BatchListView
          batches={batches}
          resumes={individuResumes}
          title="Hasil Per Individu"
          iconColor="green"
          icon={User}
          onSelect={setSelectedBatchId}
          goBackToFolders={() => {
            setSelectedBatchId(null);
            setCurrentView("folders");
          }}
        />
      );
    }

    const batchIndividu = getBatchIndividu(selectedBatchId);
    const batch = batches.find((b) => b.id === selectedBatchId);

    const filteredResumes = searchQuery
      ? batchIndividu.filter((file) =>
          file.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : batchIndividu;

    const totalPages = Math.ceil(filteredResumes.length / perPage);
    const paginated = filteredResumes.slice((page - 1) * perPage, page * perPage);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                goBack();
                setSearchQuery("");
                setPage(1);
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Hasil Per Individu</h2>
                <p className="text-xs text-slate-500">{batch?.name}</p>
              </div>
            </div>
          </div>

          {batchIndividu.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-600"
                title={sortOrder === "asc" ? "Urutkan: Terlama ke Terbaru" : "Urutkan: Terbaru ke Terlama"}
              >
                {sortOrder === "asc" ? (
                  <><ArrowUp className="w-4 h-4" /><span className="hidden sm:inline">Terlama</span></>
                ) : (
                  <><ArrowDown className="w-4 h-4" /><span className="hidden sm:inline">Terbaru</span></>
                )}
              </button>

              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama kandidat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {batchIndividu.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada resume per individu di batch ini</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Tidak ditemukan kandidat dengan nama "{searchQuery}"</p>
            <button onClick={() => setSearchQuery("")} className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium">
              Reset pencarian
            </button>
          </div>
        ) : (
          <>
            {(searchQuery || filteredResumes.length !== batchIndividu.length) && (
              <p className="text-sm text-slate-500">
                Menampilkan {filteredResumes.length} dari {batchIndividu.length} kandidat
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((file) => (
                <ResumeFileCard key={file.id} file={file} color="green" />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  size="sm"
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-slate-600">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  size="sm"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}

// Resume File Card Component
function ResumeFileCard({ file, color }: { file: any; color: "blue" | "purple" | "green" }) {
  const { t } = useLanguage();

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      button: "bg-green-600 hover:bg-green-700",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} rounded-xl p-5 hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">{file.title}</h4>
          <p className="text-sm text-slate-500 truncate">{file.fileName}</p>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={`${file.filePath.startsWith('/api/files') ? file.filePath : `/api/files${file.filePath.replace('/uploads/', '/')}`}?filename=${encodeURIComponent(file.fileName)}`}
          download={file.fileName}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 ${colors.button} text-white rounded-lg font-medium text-sm transition-colors`}
        >
          <Download className="w-4 h-4" />
          {t("assessmentCenter.download")}
        </a>
      </div>
    </motion.div>
  );
}

