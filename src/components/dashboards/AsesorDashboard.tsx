"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { FileText, Upload, LogOut, X, Trash2, Download } from "lucide-react";

interface AsesorDashboardProps {
  assessmentId: string;
  embedded?: boolean;
  initialTab?: "overview" | "upload" | "history";
}

interface Assessment {
  id: string;
  name: string;
  clientName: string;
  documents: any[];
}

export default function AsesorDashboard({
  assessmentId,
  embedded,
  initialTab,
}: AsesorDashboardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [myDocuments, setMyDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "upload" | "history">(initialTab ?? "overview");

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (assessmentId && session?.user?.id) {
      fetchAssessment();
    }
  }, [assessmentId, session]);

  const fetchAssessment = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);

        // Filter only my documents
        const myDocs = data.documents.filter(
          (doc: any) => doc.uploadedById === session?.user?.id
        );
        setMyDocuments(myDocs);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  const header = (
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-stone-900">
            {activeTab === "overview" && "Dashboard Asesor"}
            {activeTab === "upload" && "Upload Dokumen"}
            {activeTab === "history" && "Riwayat Upload"}
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {activeTab === "overview" && "Overview dokumen dan statistik Anda"}
            {activeTab === "upload" && "Upload laporan assessment Anda"}
            {activeTab === "history" && "Lihat semua dokumen yang telah diupload"}
          </p>
        </div>
      </div>
  );

  const content = (
      <div className={embedded ? "" : "p-4 sm:p-6 lg:p-8"}>
        {activeTab === "overview" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-stone-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-petrol-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-stone-900">
                  {myDocuments.length}
                </p>
                <p className="text-sm text-stone-600 mt-1">
                  {t("assessmentCenter.myDocuments")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-petrol-600 rounded-xl p-6 col-span-1 md:col-span-2"
              >
                <h3 className="text-white text-lg font-semibold mb-2">
                  {t("assessmentCenter.uploadDocument")}
                </h3>
                <p className="text-petrol-100 text-sm mb-4">
                  Upload laporan assessment Anda dalam format Word atau PDF
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t("assessmentCenter.upload")}
                </Button>
              </motion.div>
            </div>

            {/* My Documents List */}
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-4">
                {t("assessmentCenter.myDocuments")}
              </h2>

              {myDocuments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border border-stone-200 p-12 text-center"
                >
                  <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-2">
                    Anda belum mengupload laporan
                  </p>
                  <p className="text-sm text-stone-400">
                    Klik tombol upload di atas untuk menambahkan laporan
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myDocuments.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-petrol-100 flex items-center justify-center group-hover:bg-petrol-200 transition-colors">
                          <FileText className="w-6 h-6 text-petrol-600" />
                        </div>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                "Apakah Anda yakin ingin menghapus dokumen ini?"
                              )
                            ) {
                              await fetch(`/api/documents/${doc.id}`, {
                                method: "DELETE",
                              });
                              fetchAssessment();
                            }
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-stone-900 mb-2">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-stone-600 mb-1">{doc.fileName}</p>
                      <p className="text-xs text-stone-400 mb-4">
                        {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <a
                        href={`${doc.filePath.startsWith('/api/files') ? doc.filePath : `/api/files${doc.filePath.replace('/uploads/', '/')}`}?filename=${encodeURIComponent(doc.fileName)}`}
                        download={doc.fileName}
                        className="flex items-center gap-2 text-sm text-petrol-600 hover:text-petrol-800 font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        {t("assessmentCenter.download")}
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-petrol-600 rounded-xl p-8 mb-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-2">
                {t("assessmentCenter.uploadDocument")}
              </h3>
              <p className="text-petrol-100 mb-6">
                Upload laporan assessment Anda dalam format Word atau PDF (Max 10MB)
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t("assessmentCenter.upload")}
              </Button>
            </motion.div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-4">
              {t("assessmentCenter.myDocuments")}
            </h2>
            {myDocuments.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 mb-2">
                  Anda belum mengupload laporan
                </p>
                <p className="text-sm text-stone-400">
                  Klik tombol upload di sidebar untuk mulai upload dokumen
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-petrol-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-stone-900">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-stone-500">{doc.fileName}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm("Hapus dokumen ini?")) {
                            await fetch(`/api/documents/${doc.id}`, {
                              method: "DELETE",
                            });
                            fetchAssessment();
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-500 mb-3">
                      {new Date(doc.uploadedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <a
                      href={`${doc.filePath.startsWith('/api/files') ? doc.filePath : `/api/files${doc.filePath.replace('/uploads/', '/')}`}?filename=${encodeURIComponent(doc.fileName)}`}
                      download={doc.fileName}
                      className="flex items-center gap-2 text-sm text-petrol-600 hover:text-petrol-800 font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t("assessmentCenter.download")}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );

  const modals = (
    <>
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          assessmentId={assessmentId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchAssessment();
          }}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {content}
        {modals}
      </>
    );
  }

  return (
    <DashboardWrapper
      assessmentName={`${assessment.name} - ${assessment.clientName}`}
      assessmentId={assessmentId}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as any)}
    >
      {header}
      {content}
      {modals}
    </DashboardWrapper>
  );
}

// Upload Modal Component
function UploadModal({
  assessmentId,
  onClose,
  onSuccess,
}: {
  assessmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Hanya file Word (.doc, .docx) atau PDF yang diperbolehkan");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "document");
    formData.append("assessmentId", assessmentId);
    formData.append("title", title);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Upload gagal");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">
            {t("assessmentCenter.uploadDocument")}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              {t("assessmentCenter.documentTitle")}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Laporan Assessment Kepemimpinan"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              File (Word/PDF, max 10MB)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError("");
              }}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-petrol-50 file:text-petrol-700 file:font-medium hover:file:bg-petrol-100"
            />
            {file && (
              <p className="mt-2 text-xs text-stone-600">
                Selected: {file.name} (
                {(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t("assessmentCenter.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              {t("assessmentCenter.upload")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
