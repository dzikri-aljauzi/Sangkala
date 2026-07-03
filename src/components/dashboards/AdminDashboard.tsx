"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import {
  Users,
  FileText,
  Upload,
  Trash2,
  Plus,
  LogOut,
  Edit,
  X,
  Filter,
  FolderPlus,
  Image as ImageIcon,
  UserPlus,
  BarChart3,
  GripVertical,
  Layers,
  FolderOpen,
  User,
  Download,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface AdminDashboardProps {
  assessmentId: string;
}

interface Assessment {
  id: string;
  name: string;
  description: string | null;
  clientName: string;
  clientLogo: string | null;
  documents: any[];
  resumes: any[];
  documentations: any[];
  users: any[];
  echelons: Echelon[];
}

interface AllAssessment {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
    documents: number;
    resumes: number;
    documentations: number;
  };
}

interface Progress {
  id: string;
  activityName: string;
  percentage: number;
  description: string | null;
  order: number;
  assessmentId: string;
  createdAt: string;
  updatedAt: string;
}

interface Echelon {
  id: string;
  name: string;
  order: number;
  assessmentId: string;
  createdAt: string;
  updatedAt: string;
}

interface Attendance {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  assessmentId: string;
  createdAt: string;
  uploadedBy: {
    name: string;
  };
}

export default function AdminDashboard({ assessmentId }: AdminDashboardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [allAssessments, setAllAssessments] = useState<AllAssessment[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "documents" | "resumes" | "documentations" | "progress" | "echelons"
  >("overview");
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateAssessmentModal, setShowCreateAssessmentModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AllAssessment | null>(null);
  const [uploadType, setUploadType] = useState<"resume" | "documentation">(
    "resume"
  );

  // Filters
  const [selectedAsesor, setSelectedAsesor] = useState<string>("all");

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
      fetchAllAssessments();
      fetchProgresses();
    }
  }, [assessmentId]);

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

  const fetchAllAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAllAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching all assessments:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/assessment-center" });
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus assessment ini? Semua data terkait akan dihapus.")) return;
    try {
      const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllAssessments();
        if (id === assessmentId) {
          router.push("/assessment-center");
        }
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const asesors = assessment.users.filter((u) => u.role === "ASESOR");
  const kliens = assessment.users.filter((u) => u.role === "KLIEN");

  const filteredDocuments =
    selectedAsesor === "all"
      ? assessment.documents
      : assessment.documents.filter(
          (doc) => doc.uploadedById === selectedAsesor
        );

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
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === "overview" && "Overview"}
            {activeTab === "users" && t("assessmentCenter.manageUsers")}
            {activeTab === "documents" && t("assessmentCenter.allDocuments")}
            {activeTab === "resumes" && t("assessmentCenter.resumes")}
            {activeTab === "documentations" && t("assessmentCenter.documentations")}
            {activeTab === "progress" && "Progress Pelaksanaan"}
            {activeTab === "echelons" && "Kelola Eselon"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {activeTab === "overview" && "Dashboard overview dan statistik"}
            {activeTab === "users" && "Kelola user asesor dan klien"}
            {activeTab === "documents" && "Semua dokumen dari asesor"}
            {activeTab === "resumes" && "Kelola resume untuk klien"}
            {activeTab === "documentations" && "Kelola dokumentasi untuk klien"}
            {activeTab === "echelons" && "Kelola kategori eselon untuk resume"}
            {activeTab === "progress" && "Kelola progress pelaksanaan asesmen"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value={assessment.users.length}
                icon={Users}
                color="blue"
              />
              <StatsCard
                title={t("assessmentCenter.allDocuments")}
                value={assessment.documents.length}
                icon={FileText}
                color="green"
              />
              <StatsCard
                title={t("assessmentCenter.resumes")}
                value={assessment.resumes.length}
                icon={Upload}
                color="purple"
              />
              <StatsCard
                title={t("assessmentCenter.documentations")}
                value={assessment.documentations.length}
                icon={Upload}
                color="orange"
              />
            </div>

            {/* All Assessments Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Semua Assessment
                </h2>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateAssessmentModal(true)}
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Buat Assessment Baru
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAssessments.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl border p-5 hover:shadow-lg transition-all ${
                      a.id === assessmentId
                        ? "border-blue-300 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {a.clientLogo ? (
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1.5 flex-shrink-0">
                            <img
                              src={a.clientLogo}
                              alt={a.clientName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg font-bold">
                              {a.clientName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {a.name}
                          </h3>
                          <p className="text-xs text-slate-500">{a.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingAssessment(a)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit assessment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(a.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus assessment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-800">{a._count.users}</p>
                        <p className="text-[10px] text-slate-500">Users</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-800">{a._count.documents}</p>
                        <p className="text-[10px] text-slate-500">Docs</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-800">{a._count.resumes}</p>
                        <p className="text-[10px] text-slate-500">Resume</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-slate-800">{a._count.documentations}</p>
                        <p className="text-[10px] text-slate-500">Foto</p>
                      </div>
                    </div>

                    {a.id !== assessmentId ? (
                      <button
                        onClick={() => router.push(`/assessment-center/${a.id}/dashboard`)}
                        className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Buka Dashboard →
                      </button>
                    ) : (
                      <div className="w-full py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg text-center">
                        ● Sedang Aktif
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UserManagement
            assessmentId={assessmentId}
            users={assessment.users}
            onRefresh={fetchAssessment}
          />
        )}

        {activeTab === "documents" && (
          <div>
            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={selectedAsesor}
                onChange={(e) => setSelectedAsesor(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Asesor</option>
                {asesors.map((asesor) => (
                  <option key={asesor.id} value={asesor.id}>
                    {asesor.name}
                  </option>
                ))}
              </select>
            </div>

            <DocumentList
              documents={filteredDocuments}
              onRefresh={fetchAssessment}
              canDelete={true}
              type="documents"
            />
          </div>
        )}

        {activeTab === "resumes" && (
          <div>
            <div className="mb-6">
              <Button
                variant="primary"
                onClick={() => {
                  setUploadType("resume");
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("assessmentCenter.uploadResume")}
              </Button>
            </div>
            <DocumentList
              documents={assessment.resumes}
              onRefresh={fetchAssessment}
              canDelete={true}
              type="resumes"
            />
          </div>
        )}

        {activeTab === "documentations" && (
          <div>
            <div className="mb-6">
              <Button
                variant="primary"
                onClick={() => {
                  setUploadType("documentation");
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("assessmentCenter.uploadDocumentation")}
              </Button>
            </div>
            <DocumentList
              documents={assessment.documentations}
              onRefresh={fetchAssessment}
              canDelete={true}
              type="documentations"
            />
          </div>
        )}

        {activeTab === "progress" && (
          <ProgressManagement
            assessmentId={assessmentId}
            progresses={progresses}
            onRefresh={fetchProgresses}
          />
        )}

        {activeTab === "echelons" && (
          <EchelonManagement
            assessmentId={assessmentId}
            echelons={assessment.echelons || []}
            onRefresh={fetchAssessment}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          assessmentId={assessmentId}
          type={uploadType}
          echelons={assessment.echelons || []}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchAssessment();
          }}
        />
      )}

      {/* Create Assessment Modal */}
      {showCreateAssessmentModal && (
        <CreateAssessmentModal
          onClose={() => setShowCreateAssessmentModal(false)}
          onSuccess={() => {
            setShowCreateAssessmentModal(false);
            fetchAllAssessments();
          }}
        />
      )}

      {/* Edit Assessment Modal */}
      {editingAssessment && (
        <EditAssessmentModal
          assessment={editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onSuccess={() => {
            setEditingAssessment(null);
            fetchAllAssessments();
            fetchAssessment();
          }}
        />
      )}
    </DashboardWrapper>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colors: any = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-yellow-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600 mt-1">{title}</p>
    </motion.div>
  );
}

// User Management Component
function UserManagement({
  assessmentId,
  users,
  onRefresh,
}: {
  assessmentId: string;
  users: any[];
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const handleToggleActive = async (userId: string, currentIsActive: boolean) => {
    const action = currentIsActive ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} user ini?`)) return;

    setTogglingUserId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentIsActive }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengubah status user");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Terjadi kesalahan");
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("assessmentCenter.createUser")}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                {t("assessmentCenter.userName")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => {
              const isActive = user.isActive !== false;
              return (
                <tr key={user.id} className={`hover:bg-slate-50 ${!isActive ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      {user.name}
                      {!isActive && (
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 text-red-600">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "ASESOR"
                          ? "bg-blue-100 text-blue-700"
                          : user.role === "STAFF_KLIEN"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role === "STAFF_KLIEN" ? "STAFF KLIEN" : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isActive ? (
                        <><ToggleRight className="w-4 h-4" /> Aktif</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Nonaktif</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id, isActive)}
                        disabled={togglingUserId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        } ${togglingUserId === user.id ? "opacity-50 cursor-wait" : ""}`}
                        title={isActive ? "Nonaktifkan user tanpa menghapus data" : "Aktifkan kembali user"}
                      >
                        {isActive ? (
                          <><ToggleLeft className="w-4 h-4" /> Nonaktifkan</>
                        ) : (
                          <><ToggleRight className="w-4 h-4" /> Aktifkan</>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            confirm("Hapus permanen user ini?\n\nGunakan Nonaktifkan jika hanya ingin mencabut akses. Delete permanen dapat menghapus data assessment yang diunggah user karena relasi cascade.\n\nLanjut hapus permanen?")
                          ) {
                            await fetch(`/api/users/${user.id}`, {
                              method: "DELETE",
                            });
                            onRefresh();
                          }
                        }}
                        className="text-slate-300 hover:text-red-600 transition-colors"
                        title="Hapus permanen user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateUserModal
          assessmentId={assessmentId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          assessmentId={assessmentId}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Document List Component
function DocumentList({
  documents,
  onRefresh,
  canDelete,
  type,
}: {
  documents: any[];
  onRefresh: () => void;
  canDelete: boolean;
  type: "documents" | "resumes" | "documentations";
}) {
  const { t } = useLanguage();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort documents by createdAt descending (newest first)
  const sortedDocuments = [...documents].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleToggleSelect = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === sortedDocuments.length) {
      setSelectedDocs([]); // Deselect all
    } else {
      setSelectedDocs(sortedDocuments.map((doc) => doc.id)); // Select all
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedDocs.length} file terpilih?`)) return;

    setIsDeleting(true);
    try {
      // Delete multiple files concurrently using Promise.all
      await Promise.all(
        selectedDocs.map((id) =>
          fetch(`/api/${type}/${id}`, {
            method: "DELETE",
          })
        )
      );
      setSelectedDocs([]);
      onRefresh();
    } catch (error) {
      console.error("Error bulk deleting documents:", error);
      alert("Terjadi kesalahan saat menghapus beberapa file.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Belum ada file</p>
      </div>
    );
  }

  return (
    <div>
      {canDelete && (
        <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={selectedDocs.length === sortedDocuments.length && sortedDocuments.length > 0}
              onChange={handleSelectAll}
            />
            Pilih Semua
          </label>

          {selectedDocs.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-white transition-colors ${
                isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Hapus Terpilih ({selectedDocs.length})
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-lg border ${
              selectedDocs.includes(doc.id) ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200"
            } p-4 hover:shadow-md transition-all relative group`}
          >
            {canDelete && (
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => handleToggleSelect(doc.id)}
                />
              </div>
            )}
            
            <div className={`flex items-start justify-between mb-3 ${canDelete ? "ml-8" : ""}`}>
              <FileText className={`w-8 h-8 ${selectedDocs.includes(doc.id) ? "text-blue-600" : "text-blue-500"}`} />
              {canDelete && (
                <button
                  onClick={async () => {
                    if (confirm("Hapus file ini?")) {
                      await fetch(`/api/${type}/${doc.id}`, {
                        method: "DELETE",
                      });
                      onRefresh();
                    }
                  }}
                  disabled={isDeleting}
                  className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className={canDelete ? "ml-8" : ""}>
              <h3 className="font-medium text-slate-900 mb-1 line-clamp-1" title={doc.title}>{doc.title}</h3>
              <p className="text-xs text-slate-600 mb-2 truncate" title={doc.fileName}>{doc.fileName}</p>
              {doc.uploadedBy && (
                <p className="text-xs text-slate-500 mb-3">
                  By: {doc.uploadedBy.name}
                </p>
              )}
              <a
                href={`${doc.filePath.startsWith('/api/files') ? doc.filePath : `/api/files${doc.filePath.replace('/uploads/', '/')}`}?filename=${encodeURIComponent(doc.fileName)}`}
                download={doc.fileName}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                {t("assessmentCenter.download")} →
              </a>
            </div>
            
            {/* Clickable overlay for the card (optional, makes it easier to select) */}
            {canDelete && (
              <div 
                className="absolute inset-0 cursor-pointer rounded-lg z-0" 
                onClick={() => handleToggleSelect(doc.id)}
              />
            )}
            <div className="relative z-10 pointer-events-none">
              {/* This ensures links and buttons are clickable above the overlay */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Create User Modal — with Batch Create for Klien
function CreateUserModal({
  assessmentId,
  onClose,
  onSuccess,
}: {
  assessmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [role, setRole] = useState("ASESOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Single user form (for ASESOR)
  const [singleUser, setSingleUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Batch users form (for KLIEN)
  const [klienMembers, setKlienMembers] = useState([
    { name: "", email: "", password: "" },
  ]);

  const addKlienMember = () => {
    setKlienMembers([...klienMembers, { name: "", email: "", password: "" }]);
  };

  const removeKlienMember = (index: number) => {
    if (klienMembers.length > 1) {
      setKlienMembers(klienMembers.filter((_, i) => i !== index));
    }
  };

  const updateKlienMember = (index: number, field: string, value: string) => {
    const updated = [...klienMembers];
    (updated[index] as any)[field] = value;
    setKlienMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (role === "ASESOR" || role === "STAFF_KLIEN") {
        // Single create for ASESOR or STAFF_KLIEN
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...singleUser,
            role: role,
            assessmentId,
          }),
        });

        if (res.ok) {
          onSuccess();
        } else {
          const data = await res.json();
          setError(data.error || "Gagal membuat user");
        }
      } else {
        // Batch create klien
        const validMembers = klienMembers.filter(
          (m) => m.name && m.email && m.password
        );
        if (validMembers.length === 0) {
          setError("Minimal 1 anggota klien harus diisi");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/users/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            users: validMembers.map((m) => ({
              ...m,
              role: "KLIEN",
              assessmentId,
            })),
          }),
        });

        if (res.ok) {
          onSuccess();
        } else {
          const data = await res.json();
          setError(data.error || "Gagal membuat user");
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-900">
            {t("assessmentCenter.createUser")}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("ASESOR")}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === "ASESOR"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Asesor
              </button>
              <button
                type="button"
                onClick={() => setRole("KLIEN")}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === "KLIEN"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Klien
              </button>
              <button
                type="button"
                onClick={() => setRole("STAFF_KLIEN")}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === "STAFF_KLIEN"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Staff Klien
              </button>
            </div>
          </div>

          {/* ASESOR/STAFF_KLIEN: Single User Form */}
          {(role === "ASESOR" || role === "STAFF_KLIEN") && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  value={singleUser.name}
                  onChange={(e) =>
                    setSingleUser({ ...singleUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={role === "ASESOR" ? "Nama asesor" : "Nama staff klien"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={singleUser.email}
                  onChange={(e) =>
                    setSingleUser({ ...singleUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={singleUser.password}
                  onChange={(e) =>
                    setSingleUser({ ...singleUser, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>
            </div>
          )}

          {/* KLIEN: Batch User Form */}
          {role === "KLIEN" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Anggota Klien ({klienMembers.length})
                </p>
                <button
                  type="button"
                  onClick={addKlienMember}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah Anggota
                </button>
              </div>

              {klienMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Anggota #{index + 1}
                    </span>
                    {klienMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKlienMember(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Nama"
                    value={member.name}
                    onChange={(e) =>
                      updateKlienMember(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) =>
                      updateKlienMember(index, "email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={member.password}
                    onChange={(e) =>
                      updateKlienMember(index, "password", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("assessmentCenter.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              {role === "KLIEN" ? `Buat ${klienMembers.length} Anggota` : t("assessmentCenter.create")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Create Assessment Modal
function CreateAssessmentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientName: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let clientLogoPath = null;

      // Upload logo first if provided
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("file", logoFile);
        logoFormData.append("type", "logo");
        logoFormData.append("assessmentId", "temp");
        logoFormData.append("title", "Client Logo");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: logoFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          clientLogoPath = uploadData.filePath;
        }
      }

      // Create assessment
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientLogo: clientLogoPath,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal membuat assessment");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
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
          <h2 className="text-xl font-bold text-slate-900">
            Buat Assessment Baru
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Assessment
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Assessment Center 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Klien
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Bank Kaltimtara"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Deskripsi assessment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Logo Klien (Opsional)
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="w-16 h-16 rounded-lg border border-slate-300 p-2 flex items-center justify-center bg-white">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format: JPG, PNG, SVG
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              Buat Assessment
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Upload Modal
function UploadModal({
  assessmentId,
  type,
  echelons = [],
  onClose,
  onSuccess,
}: {
  assessmentId: string;
  type: "resume" | "documentation";
  echelons?: Echelon[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Resume classification
  const [category, setCategory] = useState<"UMUM" | "ESELON" | "INDIVIDU">("UMUM");
  const [selectedEchelonId, setSelectedEchelonId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validate echelon selection
    if (type === "resume" && category === "ESELON" && !selectedEchelonId) {
      alert("Pilih eselon terlebih dahulu");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("assessmentId", assessmentId);

    // For INDIVIDU category, use filename without extension as title
    let finalTitle = title;
    if (type === "resume" && category === "INDIVIDU") {
      // Remove file extension from filename
      finalTitle = file.name.replace(/\.[^/.]+$/, "");
    }
    formData.append("title", finalTitle);

    // Add resume classification
    if (type === "resume") {
      formData.append("category", category);
      if (category === "ESELON" && selectedEchelonId) {
        formData.append("echelonId", selectedEchelonId);
      }
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {type === "resume"
              ? t("assessmentCenter.uploadResume")
              : t("assessmentCenter.uploadDocumentation")}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resume Category Selection */}
          {type === "resume" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Kategori Resume
              </label>
              <div className="grid grid-cols-1 gap-2">
                {/* Hasil Keseluruhan - Umum */}
                <button
                  type="button"
                  onClick={() => {
                    setCategory("UMUM");
                    setSelectedEchelonId("");
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    category === "UMUM"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category === "UMUM" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${category === "UMUM" ? "text-blue-700" : "text-slate-700"}`}>
                      Hasil Keseluruhan - Umum
                    </p>
                    <p className="text-xs text-slate-500">Resume hasil secara umum</p>
                  </div>
                </button>

                {/* Hasil Keseluruhan - Per Eselon */}
                <button
                  type="button"
                  onClick={() => setCategory("ESELON")}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    category === "ESELON"
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category === "ESELON" ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${category === "ESELON" ? "text-purple-700" : "text-slate-700"}`}>
                      Hasil Keseluruhan - Per Eselon
                    </p>
                    <p className="text-xs text-slate-500">Resume hasil per tingkat eselon</p>
                  </div>
                </button>

                {/* Hasil Per Individu */}
                <button
                  type="button"
                  onClick={() => {
                    setCategory("INDIVIDU");
                    setSelectedEchelonId("");
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    category === "INDIVIDU"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category === "INDIVIDU" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${category === "INDIVIDU" ? "text-green-700" : "text-slate-700"}`}>
                      Hasil Per Individu
                    </p>
                    <p className="text-xs text-slate-500">Resume per kandidat (nama dari file)</p>
                  </div>
                </button>
              </div>

              {/* Echelon Selection - only show if ESELON category */}
              {category === "ESELON" && (
                <div className="mt-3 pl-4 border-l-2 border-purple-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pilih Eselon
                  </label>
                  {echelons.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {echelons.map((echelon) => (
                        <button
                          key={echelon.id}
                          type="button"
                          onClick={() => setSelectedEchelonId(echelon.id)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedEchelonId === echelon.id
                              ? "border-purple-500 bg-purple-100 text-purple-700"
                              : "border-slate-200 text-slate-600 hover:border-purple-300"
                          }`}
                        >
                          {echelon.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      Belum ada eselon. Tambahkan eselon di menu "Kelola Eselon" terlebih dahulu.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Title input - hide for INDIVIDU category */}
          {!(type === "resume" && category === "INDIVIDU") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Judul dokumen"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              File {type === "resume" && category === "INDIVIDU" && <span className="text-slate-500 font-normal">(nama file = nama kandidat)</span>}
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {type === "resume" && category === "INDIVIDU" && (
              <p className="text-xs text-slate-500 mt-1">
                Contoh: "Budi Santoso.pdf" akan menjadi nama kandidat "Budi Santoso"
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("assessmentCenter.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={type === "resume" && category === "ESELON" && !selectedEchelonId}
            >
              {t("assessmentCenter.upload")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit Assessment Modal
function EditAssessmentModal({
  assessment,
  onClose,
  onSuccess,
}: {
  assessment: AllAssessment;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: assessment.name,
    description: "",
    clientName: assessment.clientName,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    assessment.clientLogo
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let clientLogoPath = assessment.clientLogo;

      // Upload new logo if provided
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("file", logoFile);
        logoFormData.append("type", "logo");
        logoFormData.append("assessmentId", assessment.id);
        logoFormData.append("title", "Client Logo");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: logoFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          clientLogoPath = uploadData.filePath;
        }
      }

      const res = await fetch(`/api/assessments/${assessment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientLogo: clientLogoPath,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengupdate assessment");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
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
          <h2 className="text-xl font-bold text-slate-900">Edit Assessment</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Assessment
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Klien
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Logo Klien
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="w-16 h-16 rounded-lg border border-slate-300 p-2 flex items-center justify-center bg-white">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({
  user,
  assessmentId,
  onClose,
  onSuccess,
}: {
  user: any;
  assessmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    isActive: user.isActive !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = {
        name: formData.name,
        email: formData.email,
        role: user.role,
        assessmentId,
        isActive: formData.isActive,
      };

      // Only include password if changed
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengupdate user");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
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
          <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Role:</span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                user.role === "ASESOR"
                  ? "bg-blue-100 text-blue-700"
                  : user.role === "STAFF_KLIEN"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {user.role === "STAFF_KLIEN" ? "STAFF KLIEN" : user.role}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Status Akses</p>
                <p className="text-xs text-slate-500 mt-1">
                  Nonaktifkan user untuk memblokir login tanpa menghapus data assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  formData.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                {formData.isActive ? (
                  <><ToggleRight className="w-4 h-4" /> Aktif</>
                ) : (
                  <><ToggleLeft className="w-4 h-4" /> Nonaktif</>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password Baru
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Kosongkan jika tidak ingin mengubah password
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t("assessmentCenter.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Progress Management Component
function ProgressManagement({
  assessmentId,
  progresses,
  onRefresh,
}: {
  assessmentId: string;
  progresses: Progress[];
  onRefresh: () => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgress, setEditingProgress] = useState<Progress | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [uploadingAttendance, setUploadingAttendance] = useState(false);
  const [attendanceTitle, setAttendanceTitle] = useState("");

  // Fetch attendances
  useEffect(() => {
    fetchAttendances();
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

  const handleAttendanceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!attendanceTitle.trim()) {
      alert("Masukkan judul absensi terlebih dahulu");
      return;
    }

    setUploadingAttendance(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", attendanceTitle);
    formData.append("assessmentId", assessmentId);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setAttendanceTitle("");
        fetchAttendances();
        // Reset file input
        e.target.value = "";
      } else {
        const data = await res.json();
        alert(data.error || "Gagal upload absensi");
      }
    } catch (error) {
      console.error("Error uploading attendance:", error);
      alert("Gagal upload absensi");
    } finally {
      setUploadingAttendance(false);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file absensi ini?")) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAttendances();
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus progress ini?")) return;
    try {
      const res = await fetch(`/api/progress/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting progress:", error);
    }
  };

  // Calculate overall progress
  const overallProgress = progresses.length > 0
    ? Math.round(progresses.reduce((acc, p) => acc + p.percentage, 0) / progresses.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Progress Keseluruhan</h3>
            <p className="text-blue-100 text-sm">Rata-rata dari semua kegiatan</p>
          </div>
          <div className="text-4xl font-bold">{overallProgress}%</div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Progress Table */}
      {progresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Belum ada progress kegiatan</p>
          <p className="text-sm text-slate-400 mt-1">
            Klik tombol "Tambah Kegiatan" untuk menambahkan
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Nama Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase w-48">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {progresses.map((progress, index) => (
                <tr key={progress.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {progress.activityName}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
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
                      <span className="text-sm font-medium text-slate-700 w-12 text-right">
                        {progress.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {progress.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProgress(progress)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(progress.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">File Absensi</h3>
              <p className="text-sm text-slate-500">Upload file absensi (PDF/Word)</p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={attendanceTitle}
              onChange={(e) => setAttendanceTitle(e.target.value)}
              placeholder="Judul absensi (contoh: Absensi Hari 1)"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
              uploadingAttendance || !attendanceTitle.trim()
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}>
              <Upload className="w-4 h-4" />
              {uploadingAttendance ? "Uploading..." : "Upload File"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleAttendanceUpload}
                disabled={uploadingAttendance || !attendanceTitle.trim()}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Attendance List */}
        {attendances.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada file absensi</p>
          </div>
        ) : (
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/api/files${attendance.filePath.replace('/uploads/', '/')}?filename=${encodeURIComponent(attendance.fileName)}`}
                    download={attendance.fileName}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteAttendance(attendance.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ProgressModal
          assessmentId={assessmentId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingProgress && (
        <ProgressModal
          assessmentId={assessmentId}
          progress={editingProgress}
          onClose={() => setEditingProgress(null)}
          onSuccess={() => {
            setEditingProgress(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Progress Modal (Create/Edit)
function ProgressModal({
  assessmentId,
  progress,
  onClose,
  onSuccess,
}: {
  assessmentId: string;
  progress?: Progress;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!progress;
  const [formData, setFormData] = useState({
    activityName: progress?.activityName || "",
    percentage: progress?.percentage || 0,
    description: progress?.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/progress/${progress.id}` : "/api/progress";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assessmentId,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan progress");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
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
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Kegiatan
            </label>
            <input
              type="text"
              required
              value={formData.activityName}
              onChange={(e) =>
                setFormData({ ...formData, activityName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Pelaksanaan In-Tray"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Progress (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: parseInt(e.target.value) })
                }
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-16 relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded-lg text-center text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  formData.percentage === 100
                    ? "bg-green-500"
                    : formData.percentage >= 50
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${formData.percentage}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Deskripsi kegiatan..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              {isEdit ? "Simpan Perubahan" : "Tambah Kegiatan"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Echelon Management Component
function EchelonManagement({
  assessmentId,
  echelons,
  onRefresh,
}: {
  assessmentId: string;
  echelons: Echelon[];
  onRefresh: () => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEchelon, setEditingEchelon] = useState<Echelon | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus eselon ini? Resume yang terkait akan kehilangan kategori eselon.")) return;
    try {
      const res = await fetch(`/api/echelons/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting echelon:", error);
    }
  };

  return (
    <div>
      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Kelola Kategori Eselon</h3>
            <p className="text-purple-100 text-sm">
              Kategori eselon digunakan untuk mengklasifikasikan resume hasil keseluruhan per tingkat eselon
            </p>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Eselon
        </Button>
      </div>

      {/* Echelon List */}
      {echelons.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Belum ada kategori eselon</p>
          <p className="text-sm text-slate-400 mt-1">
            Klik tombol "Tambah Eselon" untuk menambahkan
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase w-16">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Nama Eselon
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {echelons.map((echelon, index) => (
                <tr key={echelon.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {echelon.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEchelon(echelon)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(echelon.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <EchelonModal
          assessmentId={assessmentId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingEchelon && (
        <EchelonModal
          assessmentId={assessmentId}
          echelon={editingEchelon}
          onClose={() => setEditingEchelon(null)}
          onSuccess={() => {
            setEditingEchelon(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Echelon Modal (Create/Edit)
function EchelonModal({
  assessmentId,
  echelon,
  onClose,
  onSuccess,
}: {
  assessmentId: string;
  echelon?: Echelon;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!echelon;
  const [name, setName] = useState(echelon?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/echelons/${echelon.id}` : "/api/echelons";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          assessmentId,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan eselon");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
      console.error(error);
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
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Eselon" : "Tambah Eselon"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nama Eselon
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Contoh: Eselon 2, Eselon 3, etc"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
            >
              {isEdit ? "Simpan Perubahan" : "Tambah Eselon"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
