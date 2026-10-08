"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import ProgressView, { type Progress, type Attendance } from "@/components/shared/ProgressView";
import { BarChart3, CheckCircle2, Clock } from "lucide-react";

interface StaffKlienDashboardProps {
  assessmentId: string;
  embedded?: boolean;
  initialTab?: "overview" | "progress";
}

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
}

export default function StaffKlienDashboard({ assessmentId, embedded, initialTab }: StaffKlienDashboardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "progress">(initialTab ?? "overview");

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  // Calculate stats
  const overallProgress = progresses.length > 0
    ? Math.round(progresses.reduce((acc, p) => acc + p.percentage, 0) / progresses.length)
    : 0;
  const completedCount = progresses.filter(p => p.percentage === 100).length;
  const inProgressCount = progresses.filter(p => p.percentage > 0 && p.percentage < 100).length;

  const header = (
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            {assessment.clientLogo && (
              <div className="w-16 h-16 rounded-lg bg-white border border-stone-200 p-2 flex items-center justify-center">
                <img
                  src={assessment.clientLogo}
                  alt={assessment.clientName}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "progress" && "Progress Pelaksanaan"}
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                {activeTab === "overview" && "Selamat datang di portal assessment"}
                {activeTab === "progress" && "Pantau progress pelaksanaan assessment"}
              </p>
            </div>
          </div>
        </div>
      </div>
  );

  const content = (
      <div className={embedded ? "" : "p-4 sm:p-6 lg:p-8"}>
        {activeTab === "overview" && (
          <div>
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-petrol-600 rounded-xl p-8 mb-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-2">
                {t("assessmentCenter.welcome")}, {session?.user?.name}!
              </h2>
              <p className="text-petrol-100">
                Anda dapat memantau progress pelaksanaan assessment di halaman ini.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-stone-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-petrol-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-stone-900">{overallProgress}%</p>
                    <p className="text-sm text-stone-600">Progress Keseluruhan</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-stone-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-stone-900">{completedCount}</p>
                    <p className="text-sm text-stone-600">Kegiatan Selesai</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-stone-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-stone-900">{inProgressCount}</p>
                    <p className="text-sm text-stone-600">Sedang Berjalan</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Progress Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-stone-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">Progress Terkini</h3>
                <button
                  onClick={() => setActiveTab("progress")}
                  className="text-sm text-petrol-600 hover:text-petrol-800 font-medium"
                >
                  Lihat Detail →
                </button>
              </div>

              {progresses.length === 0 ? (
                <p className="text-stone-500 text-center py-8">
                  Belum ada progress yang tersedia
                </p>
              ) : (
                <div className="space-y-4">
                  {progresses.slice(0, 5).map((progress) => (
                    <div key={progress.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {progress.activityName}
                        </p>
                        <div className="mt-1 w-full bg-stone-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress.percentage === 100
                                ? "bg-green-500"
                                : progress.percentage >= 50
                                ? "bg-petrol-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-stone-600 w-12 text-right">
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
  );

  if (embedded) return content;

  return (
    <DashboardWrapper
      assessmentName={`${assessment.name} - ${assessment.clientName}`}
      assessmentId={assessmentId}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
    >
      {header}
      {content}
    </DashboardWrapper>
  );
}
