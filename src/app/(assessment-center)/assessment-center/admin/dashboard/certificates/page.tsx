"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LogOut,
  ArrowLeft,
  Award,
  Plus,
  Search,
  Trash2,
  Download,
  FileSpreadsheet,
  Upload,
  UserPlus,
  X,
  Eye,
  Calendar,
  FileText,
  Users,
  CheckCircle,
  Building,
  User,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface Participant {
  id: string;
  name: string;
  createdAt: string;
}

interface Certificate {
  id: string;
  certCode: string;
  type: string;
  recipientName: string;
  programName: string;
  description: string;
  maturityLevel: string | null;
  issuedDate: string;
  qrCodeData: string | null;
  pdfPath: string | null;
  verifyHash: string;
  createdAt: string;
  _count?: {
    participants: number;
  };
}

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // View state
  const [view, setView] = useState<"list" | "create">("list");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INDIVIDU" | "INSTANSI">("ALL");

  // Creation Type State: INDIVIDU or INSTANSI
  const [type, setType] = useState<"INDIVIDU" | "INSTANSI">("INDIVIDU");

  // Form states
  const [certCode, setCertCode] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [manualParticipantName, setManualParticipantName] = useState("");

  // File Upload Drag & Drop State
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status message
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/assessment-center/admin-login");
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

  // Excel parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processExcelFile(files[0]);
  };

  const processExcelFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      showToast("error", "Format berkas harus berupa Excel (.xlsx, .xls) atau CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (json.length === 0) {
          showToast("error", "File Excel kosong");
          return;
        }

        // Find best column matching name
        const keys = Object.keys(json[0]);
        const nameKey = keys.find(
          (k) =>
            k.toLowerCase().includes("nama") ||
            k.toLowerCase().includes("name") ||
            k.toLowerCase().includes("peserta")
        ) || keys[0];

        const names: string[] = json
          .map((row) => String(row[nameKey] || "").trim())
          .filter((name) => name.length > 0);

        if (names.length === 0) {
          showToast("error", "Tidak dapat membaca nama peserta dari berkas");
          return;
        }

        setParticipants((prev) => {
          const combined = [...prev, ...names];
          return Array.from(new Set(combined));
        });
        showToast("success", `Berhasil mengimpor ${names.length} peserta dari ${file.name}`);
      } catch (err) {
        console.error("Error reading excel:", err);
        showToast("error", "Gagal memproses file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processExcelFile(files[0]);
    }
  };

  const addManualParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const name = manualParticipantName.trim();
    if (!name) return;
    if (participants.includes(name)) {
      showToast("error", "Nama peserta sudah ada di daftar");
      return;
    }
    setParticipants((prev) => [...prev, name]);
    setManualParticipantName("");
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const clearParticipants = () => {
    setParticipants([]);
  };

  // Submit new certificate
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certCode || !recipientName || !programName || !description || !issuedDate) {
      showToast("error", "Mohon isi semua field wajib");
      return;
    }
    if (type === "INSTANSI" && participants.length === 0) {
      showToast("error", "Mohon masukkan minimal 1 peserta untuk tipe Instansi");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certCode,
          type,
          recipientName,
          programName,
          description,
          issuedDate,
          participants: type === "INSTANSI" ? participants : [],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Sertifikat berhasil diterbitkan!");
        // Reset form
        setCertCode("");
        setRecipientName("");
        setProgramName("");
        setDescription("");
        setParticipants([]);
        setView("list");
        
        // Redirect to preview page
        router.push(`/assessment-center/admin/dashboard/certificates/${data.id}/preview`);
      } else {
        showToast("error", data.error || "Gagal membuat sertifikat");
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

  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      c.certCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.programName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalCertificates = certificates.length;

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
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
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
        {/* Navigation Bar & Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (view === "create") {
                  setView("list");
                } else {
                  router.push("/assessment-center/admin/dashboard");
                }
              }}
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {view === "create" ? "Terbitkan Sertifikat Baru" : "Kelola Sertifikat"}
              </h1>
              <p className="text-slate-500 mt-1">
                {view === "create"
                  ? "Pilih jenis sertifikat, isi formulir utama, dan terbitkan PDF"
                  : "Kelola sertifikat individu & instansi kolektif, unduh berkas, atau hapus"}
              </p>
            </div>
          </div>

          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              Sertifikat Baru
            </button>
          )}
        </div>

        {view === "list" ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Sertifikat</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalCertificates}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Sertifikat Instansi</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {certificates.filter((c) => c.type === "INSTANSI").length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Sertifikat Individu</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {certificates.filter((c) => c.type === "INDIVIDU").length}
                  </p>
                </div>
              </div>
            </div>

            {/* List Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode, nama instansi atau program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl border max-w-md">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  filterType === "ALL"
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Award className="w-4 h-4" />
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INSTANSI")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  filterType === "INSTANSI"
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Building className="w-4 h-4" />
                Instansi
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INDIVIDU")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  filterType === "INDIVIDU"
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4" />
                Individu
              </button>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="px-6 py-4">Kode Sertifikat</th>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4">Penerima</th>
                      <th className="px-6 py-4">Program Sertifikasi</th>
                      <th className="px-6 py-4">Peserta Kolektif</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredCertificates.length > 0 ? (
                      filteredCertificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-blue-600">{cert.certCode}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                cert.type === "INSTANSI"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {cert.type === "INSTANSI" ? (
                                <>
                                  <Building className="w-3 h-3" />
                                  Instansi
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3" />
                                  Individu
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{cert.recipientName}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{cert.programName}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {cert.type === "INSTANSI" ? `${cert._count?.participants || 0} Orang` : "-"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/assessment-center/admin/dashboard/certificates/${cert.id}/preview`}
                                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                                title="Lihat Pratinjau Sertifikat"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {cert.pdfPath && (
                                <a
                                  href={cert.pdfPath}
                                  download
                                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                                  title="Unduh Sertifikat PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(cert.id, cert.certCode)}
                                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                                title="Hapus Sertifikat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          {loading ? "Memuat sertifikat..." : "Tidak ada sertifikat yang ditemukan"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Navigation Tabs between Individu and Instansi */}
            <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl border max-w-md">
              <button
                type="button"
                onClick={() => setType("INDIVIDU")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  type === "INDIVIDU"
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
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
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Building className="w-4 h-4" />
                Sertifikat Instansi
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields Column */}
              <div className={type === "INDIVIDU" ? "lg:col-span-3 max-w-4xl mx-auto w-full" : "lg:col-span-2 space-y-6"}>
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Informasi Utama Sertifikat ({type === "INDIVIDU" ? "Individu" : "Kolektif Instansi"})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        Kode Sertifikat <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: LNA/CERT/ERM31K/2026/001"
                        required
                        value={certCode}
                        onChange={(e) => setCertCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        {type === "INSTANSI" ? "Nama Instansi / Penerima Utama" : "Nama Lengkap Penerima"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={type === "INSTANSI" ? "Contoh: Badan Karantina Indonesia" : "Contoh: Ahmad Syahrial, MBA"}
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Program Sertifikasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Program Sertifikasi Asesmen Kompetensi Eksekutif"
                      required
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Deskripsi / Ruang Lingkup Program <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      placeholder="Contoh: Tingkat Kematangan Manajemen Risiko Indeks ERM-31000"
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Tanggal Terbit <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={issuedDate}
                        onChange={(e) => setIssuedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Submit Button inside main card if Individu */}
                  {type === "INDIVIDU" && (
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
                  )}
                </div>
              </div>

              {/* Participants column (Instansi only) */}
              {type === "INSTANSI" && (
                <div className="space-y-6">
                  {/* Excel Bulk Upload Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      Bulk Upload Peserta
                    </h3>
                    <p className="text-xs text-slate-500">
                      Unggah berkas Excel (.xlsx, .xls) atau CSV untuk mengekstrak nama peserta secara massal.
                    </p>

                    {/* Drag and Drop Box */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        dragOver
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleExcelUpload}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">Pilih berkas atau tarik ke sini</span>
                      <span className="text-[10px] text-slate-400">Kolom dibaca: Nama, Name, Nama Lengkap</span>
                    </div>

                    {/* Download Template Button */}
                    <a
                      href="/template-bulk-nama-peserta.xlsx"
                      download
                      className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Template Excel Peserta
                    </a>
                  </div>

                  {/* Participants list Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col max-h-[500px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Peserta ({participants.length})
                      </h3>
                      {participants.length > 0 && (
                        <button
                          type="button"
                          onClick={clearParticipants}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Hapus Semua
                        </button>
                      )}
                    </div>

                    {/* Manual entry */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama lengkap peserta..."
                        value={manualParticipantName}
                        onChange={(e) => setManualParticipantName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={addManualParticipant}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center"
                        title="Tambah Manual"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* List container */}
                    <div className="flex-1 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50 min-h-[150px]">
                      {participants.length > 0 ? (
                        participants.map((name, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs text-slate-800 shadow-sm hover:border-slate-200 transition-all group"
                          >
                            <span className="font-medium truncate max-w-[180px]">{name}</span>
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs italic py-8">
                          Belum ada peserta
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
