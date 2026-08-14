"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LogOut,
  ArrowLeft,
  Plus,
  CheckCircle,
  Building,
  User,
  AlertCircle,
  Award,
} from "lucide-react";
import ParticipantManager from "@/components/certificate/ParticipantManager";
import CertificateTable, { Certificate } from "@/components/certificate/dashboard/CertificateTable";
import CertificateForm from "@/components/certificate/dashboard/CertificateForm";
import BulkUploadCard from "@/components/certificate/dashboard/BulkUploadCard";
import ParticipantListCard from "@/components/certificate/dashboard/ParticipantListCard";

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // View state
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Creation Type State: INDIVIDU or INSTANSI
  const [type, setType] = useState<"INDIVIDU" | "INSTANSI">("INDIVIDU");

  // Form states
  const [certCode, setCertCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  // Participant management modal
  const [managingCert, setManagingCert] = useState<{ id: string; name: string } | null>(null);

  // Status message
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
    if (status === "authenticated") {
      fetchCertificates();
      // Pre-fill default date (today)
      const today = new Date().toISOString().split("T")[0];
      setIssuedDate(today);
    }
  }, [status, session, router]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      } else {
        showToast("error", "Gagal memuat sertifikat");
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      showToast("error", "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Add participant
  const addParticipantName = (name: string) => {
    if (participants.includes(name)) {
      showToast("warning", "Nama peserta sudah ada di daftar");
      return;
    }
    setParticipants((prev) => [...prev, name]);
  };

  // Remove participant
  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Bulk add participants from excel
  const importParticipants = (names: string[]) => {
    setParticipants((prev) => {
      const combined = [...prev, ...names];
      return Array.from(new Set(combined));
    });
  };

  // Start editing a certificate
  const handleStartEdit = async (cert: Certificate) => {
    setEditingId(cert.id);
    setType(cert.type as "INDIVIDU" | "INSTANSI");
    setCertCode(cert.certCode);
    setRecipientName(cert.recipientName);
    setProgramName(cert.programName);
    setDescription(cert.description);
    setIssuedDate(new Date(cert.issuedDate).toISOString().split("T")[0]);
    setParticipants([]);
    setView("edit");
  };

  // Submit new certificate / Update existing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certCode || !recipientName || !programName || !description || !issuedDate) {
      showToast("error", "Mohon isi semua field wajib");
      return;
    }
    if (view !== "edit" && type === "INSTANSI" && participants.length === 0) {
      showToast("error", "Mohon masukkan minimal 1 peserta untuk tipe Instansi");
      return;
    }

    setSubmitLoading(true);

    try {
      const isEditing = view === "edit" && editingId;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/certificates/${editingId}` : "/api/certificates";
      const body: Record<string, unknown> = {
        certCode,
        recipientName,
        programName,
        description,
        issuedDate,
      };
      if (!isEditing) {
        body.type = type;
        body.participants = type === "INSTANSI" ? participants : [];
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", isEditing ? "Sertifikat berhasil diperbarui!" : "Sertifikat berhasil diterbitkan!");
        // Reset form
        setCertCode("");
        setRecipientName("");
        setProgramName("");
        setDescription("");
        setParticipants([]);
        setEditingId(null);
        setView("list");
        
        // Redirect to preview page
        router.push(`/admin/sertifikat/${data.id}/preview`);
      } else {
        showToast("error", data.error || (isEditing ? "Gagal memperbarui sertifikat" : "Gagal membuat sertifikat"));
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Terjadi kesalahan saat memproses data");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete certificate
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sertifikat ${code}?`)) return;

    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("success", "Sertifikat berhasil dihapus");
        fetchCertificates();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Gagal menghapus sertifikat");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Terjadi kesalahan saat menghapus sertifikat");
    }
  };

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
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white ${
              toast.type === "success" 
                ? "bg-emerald-600" 
                : toast.type === "warning"
                ? "bg-amber-500"
                : "bg-rose-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
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
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
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
        {/* Navigation Bar & Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (view === "create" || view === "edit") {
                  setView("list");
                  setEditingId(null);
                  setCertCode("");
                  setRecipientName("");
                  setProgramName("");
                  setDescription("");
                  setIssuedDate(new Date().toISOString().split("T")[0]);
                  setParticipants([]);
                  setType("INDIVIDU");
                } else {
                  router.push("/admin");
                }
              }}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {view === "create" ? "Terbitkan Sertifikat Baru" : view === "edit" ? "Edit Sertifikat" : "Kelola Sertifikat"}
              </h1>
              <p className="text-slate-500 mt-1">
                {view === "create"
                  ? "Pilih jenis sertifikat, isi formulir utama, dan terbitkan PDF"
                  : view === "edit"
                  ? "Ubah data sertifikat, simpan untuk memperbarui PDF"
                  : "Kelola sertifikat individu & instansi kolektif, unduh berkas, atau hapus"}
              </p>
            </div>
          </div>

          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Sertifikat Baru
            </button>
          )}
        </div>

        {view === "list" ? (
          <CertificateTable
            certificates={certificates}
            loading={loading}
            onEdit={handleStartEdit}
            onManage={setManagingCert}
            onDelete={handleDelete}
          />
        ) : (
          <div className="space-y-6">
            {/* Navigation Tabs between Individu and Instansi */}
            <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl border max-w-md">
              {view === "edit" ? (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-sm">
                  {type === "INSTANSI" ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {type === "INSTANSI" ? "Sertifikat Instansi" : "Sertifikat Individu"}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setType("INDIVIDU")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === "INDIVIDU"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Sertifikat Individu
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("INSTANSI")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === "INSTANSI"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Sertifikat Instansi
                  </button>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields Column */}
              <div className={view === "edit" ? "lg:col-span-3 max-w-4xl w-full" : type === "INDIVIDU" ? "lg:col-span-3 max-w-4xl w-full" : "lg:col-span-2 space-y-6"}>
                <CertificateForm
                  type={type}
                  view={view}
                  certCode={certCode}
                  setCertCode={setCertCode}
                  recipientName={recipientName}
                  setRecipientName={setRecipientName}
                  programName={programName}
                  setProgramName={setProgramName}
                  description={description}
                  setDescription={setDescription}
                  issuedDate={issuedDate}
                  setIssuedDate={setIssuedDate}
                  submitLoading={submitLoading}
                />
              </div>

              {/* Participants column (Instansi only, hide in edit mode — use modal instead) */}
              {type === "INSTANSI" && view !== "edit" && (
                <div className="space-y-6">
                  {/* Excel Bulk Upload Card */}
                  <BulkUploadCard
                    onImport={importParticipants}
                    onError={(msg) => showToast("error", msg)}
                    onSuccess={(msg) => showToast("success", msg)}
                  />

                  {/* Participants list Card */}
                  <ParticipantListCard
                    participants={participants}
                    onAdd={addParticipantName}
                    onRemove={removeParticipant}
                    onClearAll={() => setParticipants([])}
                  />

                  {/* Submit button at bottom of list */}
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Memproses & Menggambar PDF...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Terbitkan
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Participant Management Modal */}
      {managingCert && (
        <ParticipantManager
          certificateId={managingCert.id}
          recipientName={managingCert.name}
          onClose={() => setManagingCert(null)}
          onUpdate={fetchCertificates}
        />
      )}
    </div>
  );
}
