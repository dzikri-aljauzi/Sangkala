"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Clock, ClipboardList, FileText, Download } from "lucide-react";

export interface Progress {
  id: string;
  activityName: string;
  percentage: number;
  description: string | null;
  order: number;
}

export interface Attendance {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  uploadedBy: {
    name: string;
  };
}

// Dipakai bareng oleh KlienDashboard dan StaffKlienDashboard — sebelumnya
// komponen ini di-copy-paste identik (270 baris) di dua file.
export default function ProgressView({ progresses, attendances }: { progresses: Progress[]; attendances: Attendance[] }) {
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
        className="bg-white rounded-xl border border-stone-200 p-12 text-center"
      >
        <BarChart3 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500 text-lg">Belum ada progress yang tersedia</p>
        <p className="text-sm text-stone-400 mt-2">
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
            className="bg-petrol-600 rounded-2xl p-8 text-white shadow-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-medium text-petrol-100 mb-1">Progress Keseluruhan</h3>
                <p className="text-4xl font-bold">{overallProgress}%</p>
                <p className="text-petrol-100 text-sm mt-2">
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
              className="bg-white rounded-xl border border-stone-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{completedCount}</p>
                  <p className="text-sm text-stone-500">Selesai</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-stone-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-petrol-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-petrol-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{inProgressCount}</p>
                  <p className="text-sm text-stone-500">Sedang Berjalan</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-stone-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900">{notStartedCount}</p>
                  <p className="text-sm text-stone-500">Belum Dimulai</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress List with Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-stone-200">
              <h3 className="text-lg font-semibold text-stone-900">Detail Kegiatan</h3>
            </div>
            <div className="divide-y divide-stone-100">
              {progresses.map((progress, index) => (
                <motion.div
                  key={progress.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        progress.percentage === 100
                          ? "bg-green-100 text-green-700"
                          : progress.percentage > 0
                          ? "bg-petrol-100 text-petrol-700"
                          : "bg-stone-100 text-stone-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-900">{progress.activityName}</h4>
                        {progress.description && (
                          <p className="text-sm text-stone-500 mt-0.5">{progress.description}</p>
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
                          ? "text-petrol-600"
                          : "text-stone-400"
                      }`}>
                        {progress.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-stone-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * index, ease: "easeOut" }}
                      className={`h-3 rounded-full ${
                        progress.percentage === 100
                          ? "bg-green-500"
                          : progress.percentage >= 50
                          ? "bg-petrol-500"
                          : progress.percentage > 0
                          ? "bg-orange-400"
                          : "bg-stone-300"
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
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-stone-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">File Absensi</h3>
                <p className="text-sm text-stone-500">Dokumen absensi yang tersedia</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-stone-100">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="p-4 hover:bg-stone-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 truncate">{attendance.title}</p>
                    <p className="text-sm text-stone-500 truncate">{attendance.fileName}</p>
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
