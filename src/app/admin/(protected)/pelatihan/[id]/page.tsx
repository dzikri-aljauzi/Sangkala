"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Save,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Building2,
  Power,
  Eye,
  Check,
  X,
  AlertTriangle,
  Download,
  RotateCcw,
  Maximize2,
  History,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { formatRupiah, formatRupiahInput, formatTrainingDateRange } from "@/lib/utils";
import type { Training } from "@/types/training";

type PaymentStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";

interface Registrant {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string | null;
  createdAt: string;
  paymentProofPath: string | null;
  paymentStatus: PaymentStatus;
  rejectionReason: string | null;
}

interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  changes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

// Judul pelatihan bisa mengandung karakter yang tidak aman buat nama file
// (spasi, "/", tanda baca) -- disederhanakan jadi slug biar unduhan tetap rapi.
const toFileNameSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pelatihan";

export default function AdminPelatihanDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [training, setTraining] = useState<Training | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<"registrants" | "history">("registrants");
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    price: "",
    description: "",
    imagePath: "",
    requiresPayment: true,
    capacity: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [regeneratingQr, setRegeneratingQr] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Registrant | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofTarget, setProofTarget] = useState<Registrant | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Confirmation Modal States
  const [showToggleActiveModal, setShowToggleActiveModal] = useState(false);
  const [confirmApproveRegistrant, setConfirmApproveRegistrant] = useState<Registrant | null>(null);
  const [confirmResetRegistrant, setConfirmResetRegistrant] = useState<Registrant | null>(null);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canModify = isSuperAdmin || (training && training.createdById === session?.user?.id);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/trainings/${id}/audit-logs`);
      if (res.ok) {
        setAuditLogs(await res.json());
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [id]);

  const fetchData = useCallback(async () => {
    try {
      const [trainingRes, registrantsRes] = await Promise.all([
        fetch(`/api/trainings/${id}`),
        fetch(`/api/trainings/${id}/registrants`),
      ]);

      if (trainingRes.ok) {
        const data = await trainingRes.json();
        setTraining(data);
      } else if (trainingRes.status === 404) {
        router.push("/admin/pelatihan");
        return;
      }

      if (registrantsRes.ok) {
        setRegistrants(await registrantsRes.json());
      }
    } catch (error) {
      console.error("Error fetching training detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
    fetchAuditLogs();
  }, [fetchData, fetchAuditLogs]);

  const openEditModal = () => {
    if (!training) return;
    setFormData({
      title: training.title,
      location: training.location,
      startDate: training.startDate.slice(0, 10),
      endDate: training.endDate ? training.endDate.slice(0, 10) : "",
      price: training.price ? formatRupiahInput(training.price) : "",
      description: training.description,
      imagePath: training.imagePath || "",
      requiresPayment: true,
      capacity: training.capacity !== null ? String(training.capacity) : "",
    });
    setShowEditModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload/training", {
        method: "POST",
        body: formDataUpload,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, imagePath: data.filePath }));
      } else {
        toast.error("Gagal upload gambar");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate ? formData.endDate : null,
          requiresPayment: true,
          isActive: training.isActive,
          capacity: formData.capacity.trim() ? Number(formData.capacity.trim()) : null,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchData();
        fetchAuditLogs();
        toast.success("Perubahan pelatihan berhasil disimpan");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error updating training:", error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!training) return;
    if (!canModify) {
      toast.error("Anda hanya dapat mengubah pelatihan yang Anda buat sendiri");
      return;
    }
    setTogglingActive(true);
    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !training.isActive,
        }),
      });
      if (res.ok) {
        toast.success(training.isActive ? "Pelatihan dinonaktifkan" : "Pelatihan diaktifkan");
        setShowToggleActiveModal(false);
        fetchData();
        fetchAuditLogs();
      } else {
        toast.error("Gagal mengubah status pelatihan");
      }
    } catch (error) {
      console.error("Error toggling active state:", error);
      toast.error("Gagal mengubah status pelatihan");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleRegenerateQr = async () => {
    if (!canModify) return;
    setRegeneratingQr(true);
    try {
      const res = await fetch(`/api/trainings/${id}/regenerate-qr`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("QR code berhasil dibuat ulang");
        fetchData();
      } else {
        toast.error("Gagal membuat ulang QR code");
      }
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      toast.error("Gagal membuat ulang QR code");
    } finally {
      setRegeneratingQr(false);
    }
  };

  const handleDeleteTraining = async () => {
    if (!training) return;
    if (!canModify) {
      toast.error("Anda hanya dapat menghapus pelatihan yang Anda buat sendiri");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Pelatihan berhasil dihapus");
        router.push("/admin/pelatihan");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menghapus pelatihan");
      }
    } catch (err) {
      console.error("Error deleting training:", err);
      toast.error("Gagal menghapus pelatihan");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const renderDiffContent = (changesStr: string | null) => {
    if (!changesStr) return null;
    try {
      const diff: Record<string, { old: unknown; new: unknown }> = JSON.parse(changesStr);
      return (
        <div className="mt-2 space-y-1.5 bg-stone-50 rounded-lg p-3 text-xs border border-stone-200">
          <p className="font-semibold text-stone-700">Perubahan Data:</p>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(diff).map(([field, value]) => (
              <div key={field} className="flex flex-wrap items-center gap-1.5 text-stone-600">
                <span className="font-mono bg-stone-200 px-1 py-0.5 rounded text-stone-800">{field}:</span>
                <span className="line-through text-red-600 bg-red-50 px-1 rounded">{String(value.old ?? "kosong")}</span>
                <span>→</span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-1 rounded">{String(value.new ?? "kosong")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch {
      return null;
    }
  };

  const handleApprove = async (registrantId: string) => {
    setReviewingId(registrantId);
    try {
      const res = await fetch(`/api/trainings/${id}/registrants/${registrantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        toast.success("Bukti pembayaran disetujui");
        setConfirmApproveRegistrant(null);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyetujui bukti pembayaran");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Gagal menyetujui bukti pembayaran");
    } finally {
      setReviewingId(null);
    }
  };

  const openRejectDialog = (registrant: Registrant) => {
    setRejectTarget(registrant);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectSubmitting(true);

    try {
      const res = await fetch(`/api/trainings/${id}/registrants/${rejectTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectReason.trim() }),
      });
      if (res.ok) {
        toast.success("Bukti pembayaran ditolak");
        setShowRejectDialog(false);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menolak bukti pembayaran");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Gagal menolak bukti pembayaran");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const openProofDialog = (registrant: Registrant) => {
    setProofTarget(registrant);
    setShowProofDialog(true);
  };

  const handleReset = async (registrantId: string) => {
    setReviewingId(registrantId);
    try {
      const res = await fetch(`/api/trainings/${id}/registrants/${registrantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        toast.success("Status pembayaran dikembalikan ke Menunggu");
        setConfirmResetRegistrant(null);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal membatalkan keputusan");
      }
    } catch (error) {
      console.error("Error resetting payment status:", error);
      toast.error("Gagal membatalkan keputusan");
    } finally {
      setReviewingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ["Nama", "Email", "No. HP", "Instansi", "Tanggal Daftar", "Status Pembayaran", "Alasan Ditolak"];
    const statusLabel: Record<PaymentStatus, string> = {
      NOT_REQUIRED: "-",
      PENDING: "Menunggu",
      APPROVED: "Disetujui",
      REJECTED: "Ditolak",
    };
    const rows = registrants.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.institution || "-",
      new Date(r.createdAt).toLocaleDateString("id-ID"),
      statusLabel[r.paymentStatus],
      r.rejectionReason || "-",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pendaftar-${training?.title || "pelatihan"}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const renderPaymentBadge = (status: PaymentStatus) => {
    if (status === "PENDING") {
      return <Badge className="bg-amber-100 text-amber-700 border-transparent">Menunggu</Badge>;
    }
    if (status === "APPROVED") {
      return <Badge className="bg-green-100 text-green-700 border-transparent">Disetujui</Badge>;
    }
    if (status === "REJECTED") {
      return <Badge variant="destructive">Ditolak</Badge>;
    }
    return <span className="text-stone-400">-</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600" />
        <span className="sr-only">Memuat detail pelatihan...</span>
      </div>
    );
  }

  if (!training) return null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pelatihan"
            aria-label="Kembali ke daftar pelatihan"
            className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Detail Pelatihan</h1>
            <p className="text-stone-500 mt-1">Kelola data pelatihan dan lihat daftar pendaftar</p>
          </div>
        </div>

        {/* Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden"
        >
          <div className="relative h-56 bg-stone-100 flex items-center justify-center group">
            {training.imagePath ? (
              <>
                <Image
                  src={getImageUrl(training.imagePath) || ""}
                  alt={training.title}
                  fill
                  className="object-cover"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewImageUrl(getImageUrl(training.imagePath))}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white border-0 h-8 px-2.5 text-xs shadow-md backdrop-blur-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <ImageIcon className="w-12 h-12 text-stone-300" />
            )}
            {!training.isActive && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-stone-800/80 text-white border-transparent"
              >
                Nonaktif
              </Badge>
            )}
            {training.requiresPayment && (
              <Badge className="absolute top-3 left-3 bg-petrol-600 text-white border-transparent">
                Berbayar
              </Badge>
            )}
          </div>          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{training.title}</h1>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
                  <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Dibuat oleh: <strong className="text-stone-700">{training.createdBy?.name || "Admin"}</strong>
                    {training.createdBy?.role && (
                      <span className="ml-1 text-[11px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                        {training.createdBy.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {canModify ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!canModify) {
                          toast.error("Anda hanya dapat mengubah pelatihan yang Anda buat sendiri");
                          return;
                        }
                        setShowToggleActiveModal(true);
                      }}
                      disabled={togglingActive}
                    >
                      <Power className="w-4 h-4" />
                      {training.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button variant="outline" onClick={openEditModal}>
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 py-1.5 px-3">
                    Mode Hanya Lihat (Dibuat oleh Sub Admin lain)
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-petrol-500 shrink-0" />
                {training.location}
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="w-4 h-4 text-petrol-500 shrink-0" />
                {formatTrainingDateRange(training.startDate, training.endDate)}
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Users className="w-4 h-4 text-petrol-500 shrink-0" />
                {registrants.filter((r) => r.paymentStatus !== "REJECTED").length}
                {training.capacity !== null ? ` / ${training.capacity}` : ""} pendaftar
              </div>
            </div>

            {training.price && (
              <p className="text-lg font-semibold text-petrol-600 mb-4">{formatRupiah(training.price)}</p>
            )}

            <p className="text-stone-600 leading-relaxed whitespace-pre-line">{training.description}</p>
          </div>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 p-6"
        >
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            QR Code Pelatihan
          </h3>
          <div className="flex justify-center mb-4">
            {training.qrCodeData ? (
              <img
                src={training.qrCodeData}
                alt="QR Code Pelatihan"
                width={180}
                height={180}
                className="rounded-xl"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 text-xs text-center px-4">
                Tidak Ada QR Code
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {training.qrCodeData && (
              <a
                href={training.qrCodeData}
                download={`qrcode-${toFileNameSlug(training.title)}.png`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Download className="w-4 h-4" />
                Unduh QR Code
              </a>
            )}
            {canModify && (
              <Button variant="outline" onClick={handleRegenerateQr} disabled={regeneratingQr}>
                <RotateCcw className={`w-3.5 h-3.5 ${regeneratingQr ? "animate-spin" : ""}`} />
                {regeneratingQr ? "Membuat ulang..." : "Buat Ulang QR Code"}
              </Button>
            )}
          </div>
          <p className="text-xs text-stone-400 text-center mt-4">
            Scan QR code untuk membuka halaman pelatihan ini di sisi user.
          </p>
        </motion.div>

        {/* Tab Switcher: Pendaftar vs Riwayat */}
        <div className="flex items-center gap-2 border-b border-stone-200">
          <button
            onClick={() => setActiveTab("registrants")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "registrants"
                ? "border-petrol-600 text-petrol-600 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Data Pendaftar ({registrants.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "history"
                ? "border-petrol-600 text-petrol-600 font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Perubahan ({auditLogs.length})
          </button>
        </div>

        {/* Tab Content: Registrants */}
        {activeTab === "registrants" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden"
          >
            <div className="p-5 border-b border-stone-100 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-stone-900">Data Pendaftar ({registrants.length})</h2>
              {registrants.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              )}
            </div>
            {registrants.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-sm">Belum ada pendaftar.</div>
            ) : (
              <Table className="text-base">
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="w-16 px-4 text-center text-stone-500 text-sm">No</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Nama</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Email</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">No. HP</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Instansi</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Tanggal Daftar</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Status Pembayaran</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Bukti</TableHead>
                    <TableHead className="px-4 text-stone-500 text-sm">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrants.map((r, index) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-4 py-4 text-stone-400 text-center">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-medium text-stone-800">{r.name}</TableCell>
                      <TableCell className="px-4 py-4 text-stone-600">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                          {r.email}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-stone-600">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                          {r.phone}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-stone-600">
                        {r.institution ? (
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
                            {r.institution}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-stone-500">
                        {new Date(r.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {renderPaymentBadge(r.paymentStatus)}
                          {r.paymentStatus === "REJECTED" && r.rejectionReason && (
                            <span className="text-xs text-red-600 max-w-[200px] truncate" title={r.rejectionReason}>
                              {r.rejectionReason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {r.paymentProofPath ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProofDialog(r)}
                            className="h-8 gap-1.5 text-xs text-petrol-600 border-petrol-200 hover:bg-petrol-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Bukti
                          </Button>
                        ) : (
                          <span className="text-xs text-stone-400">Tidak ada</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {r.paymentStatus === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                disabled={reviewingId === r.id}
                                onClick={() => setConfirmApproveRegistrant(r)}
                                className="h-8 gap-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Terima
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reviewingId === r.id}
                                onClick={() => openRejectDialog(r)}
                                className="h-8 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Tolak
                              </Button>
                            </>
                          )}
                          {(r.paymentStatus === "APPROVED" || r.paymentStatus === "REJECTED") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={reviewingId === r.id}
                              onClick={() => setConfirmResetRegistrant(r)}
                              className="h-8 gap-1 text-xs text-stone-600 hover:text-stone-900"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </motion.div>
        )}

        {/* Tab Content: Riwayat Perubahan (Audit Logs) */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden p-6"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-semibold text-stone-900">Riwayat Perubahan & Aktivitas</h2>
                <p className="text-xs text-stone-500 mt-0.5">Catatan log aktivitas pembuatan, pengeditan, dan verifikasi</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAuditLogs} disabled={loadingLogs}>
                <RotateCcw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                Muat Ulang
              </Button>
            </div>

            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petrol-600" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-sm">
                Belum ada catatan riwayat perubahan untuk pelatihan ini.
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => {
                  const actionBadge = {
                    CREATE: <Badge className="bg-emerald-100 text-emerald-800 border-transparent">DIBUAT</Badge>,
                    UPDATE: <Badge className="bg-petrol-100 text-petrol-800 border-transparent">DIUBAH</Badge>,
                    STATUS_CHANGE: <Badge className="bg-amber-100 text-amber-800 border-transparent">STATUS</Badge>,
                    DELETE: <Badge variant="destructive">DIHAPUS</Badge>,
                    REVIEW_PAYMENT: <Badge className="bg-purple-100 text-purple-800 border-transparent">PEMBAYARAN</Badge>,
                  }[log.action] || <Badge variant="secondary">{log.action}</Badge>;

                  return (
                    <div key={log.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {actionBadge}
                          <span className="text-sm font-semibold text-stone-900">{log.summary}</span>
                        </div>
                        <span className="text-xs text-stone-400">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          Oleh <strong className="text-stone-700">{log.user?.name || "Admin"}</strong> ({log.user?.email} - {log.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"})
                        </span>
                      </div>
                      {renderDiffContent(log.changes)}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Hapus Pelatihan
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-stone-600 space-y-2">
            <p>Apakah Anda yakin ingin menghapus pelatihan <strong>{training?.title}</strong>?</p>
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              Tindakan ini permanen. Semua data pendaftar pelatihan ini juga akan dihapus.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteTraining}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Ya, Hapus Pelatihan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pelatihan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Judul Pelatihan</Label>
              <Input
                id="edit-title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-location">Tempat</Label>
              <Input
                id="edit-location"
                required
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-startDate">Tanggal Mulai</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-endDate">Tanggal Selesai</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-price">Harga</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-500 text-sm font-medium select-none pointer-events-none">
                  Rp
                </span>
                <Input
                  id="edit-price"
                  required
                  placeholder="Contoh: 2.500.000"
                  value={formData.price}
                  onChange={(e) => {
                    const formatted = formatRupiahInput(e.target.value);
                    setFormData((prev) => ({ ...prev, price: formatted }));
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-capacity">Kuota Peserta (opsional)</Label>
              <Input
                id="edit-capacity"
                type="number"
                min={1}
                placeholder="Kosongkan kalau tidak terbatas"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-image">Gambar (opsional)</Label>
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-petrol-50 file:text-petrol-600 file:text-sm file:font-medium hover:file:bg-petrol-100"
              />
              {uploading && <p className="text-xs text-stone-400 mt-1">Mengunggah...</p>}
              {formData.imagePath && (
                <div className="relative w-full h-36 mt-2 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                  <Image src={getImageUrl(formData.imagePath) || ""} alt="Preview" fill className="object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPreviewImageUrl(getImageUrl(formData.imagePath))}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white border-0 h-7 px-2 text-xs shadow"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tolak Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rejectReason">Alasan Penolakan</Label>
              <Textarea
                id="rejectReason"
                required
                rows={3}
                placeholder="Contoh: Nominal transfer tidak sesuai / bukti kurang jelas"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={rejectSubmitting || !rejectReason.trim()}>
                {rejectSubmitting ? "Menolak..." : "Tolak Pendaftaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Proof Viewing Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran — {proofTarget?.name}</DialogTitle>
          </DialogHeader>
          {training.price && (
            <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
              Nominal seharusnya: <span className="font-semibold text-stone-900">{formatRupiah(training.price)}</span>
            </p>
          )}
          {proofTarget?.paymentProofPath && (
            proofTarget.paymentProofPath.toLowerCase().endsWith(".pdf") ? (
              <div className="text-center py-8">
                <a
                  href={getImageUrl(proofTarget.paymentProofPath) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Buka PDF di tab baru
                </a>
              </div>
            ) : (
              <div className="relative w-full h-96 rounded-lg overflow-hidden bg-stone-100">
                <Image
                  src={getImageUrl(proofTarget.paymentProofPath) || ""}
                  alt="Bukti pembayaran"
                  fill
                  className="object-contain"
                />
              </div>
            )
          )}
          {proofTarget?.paymentStatus === "REJECTED" && proofTarget.rejectionReason && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              Alasan ditolak: {proofTarget.rejectionReason}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Toggle Active Confirmation Modal */}
      <Dialog open={showToggleActiveModal} onOpenChange={setShowToggleActiveModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${training?.isActive ? "text-amber-600" : "text-petrol-600"}`}>
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Status Pelatihan
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-stone-600 space-y-2">
            <p>
              Apakah Anda yakin ingin{" "}
              <strong>{training?.isActive ? "menonaktifkan" : "mengaktifkan dan mempublikasikan"}</strong> pelatihan{" "}
              <strong>&ldquo;{training?.title}&rdquo;</strong>?
            </p>
            {training?.isActive ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Pelatihan yang dinonaktifkan tidak akan muncul di halaman publik dan tidak dapat menerima pendaftaran baru.
              </p>
            ) : (
              <p className="text-xs text-petrol-700 bg-petrol-50 p-2.5 rounded-lg border border-petrol-100">
                Pelatihan akan langsung tampil di website dan peserta dapat melakukan pendaftaran.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowToggleActiveModal(false)} disabled={togglingActive}>
              Batal
            </Button>
            <Button
              className={
                training?.isActive
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-petrol-600 hover:bg-petrol-700 text-white"
              }
              onClick={toggleActive}
              disabled={togglingActive}
            >
              {togglingActive
                ? "Memproses..."
                : training?.isActive
                ? "Ya, Nonaktifkan Pelatihan"
                : "Ya, Publikasikan Pelatihan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Approve Payment Modal */}
      <Dialog open={!!confirmApproveRegistrant} onOpenChange={(open) => !open && setConfirmApproveRegistrant(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Konfirmasi Persetujuan Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-stone-600 space-y-2">
            <p>
              Apakah Anda yakin ingin menyetujui bukti pembayaran dari peserta{" "}
              <strong>{confirmApproveRegistrant?.name}</strong>?
            </p>
            {training.price && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-700 space-y-1">
                <p>Email: <strong className="font-mono">{confirmApproveRegistrant?.email}</strong></p>
                <p>Nominal: <strong className="text-green-700">{formatRupiah(training.price)}</strong></p>
              </div>
            )}
            <p className="text-xs text-stone-500">
              Status pendaftar akan berubah menjadi <strong>Disetujui (APPROVED)</strong> dan tercatat pada riwayat log.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmApproveRegistrant(null)} disabled={!!reviewingId}>
              Batal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => confirmApproveRegistrant && handleApprove(confirmApproveRegistrant.id)}
              disabled={!!reviewingId}
            >
              {reviewingId ? "Memproses..." : "Ya, Setujui Pembayaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Reset Payment Modal */}
      <Dialog open={!!confirmResetRegistrant} onOpenChange={(open) => !open && setConfirmResetRegistrant(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-stone-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-stone-600" />
              Konfirmasi Reset Status Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-stone-600 space-y-2">
            <p>
              Apakah Anda yakin ingin mereset keputusan verifikasi untuk peserta{" "}
              <strong>{confirmResetRegistrant?.name}</strong> kembali ke status <strong>Menunggu (PENDING)</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmResetRegistrant(null)} disabled={!!reviewingId}>
              Batal
            </Button>
            <Button
              className="bg-stone-800 hover:bg-stone-900 text-white"
              onClick={() => confirmResetRegistrant && handleReset(confirmResetRegistrant.id)}
              disabled={!!reviewingId}
            >
              {reviewingId ? "Mereset..." : "Ya, Kembalikan ke Menunggu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
