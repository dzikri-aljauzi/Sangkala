"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
  Shield,
  LogOut,
  Eye,
  Check,
  X,
  AlertTriangle,
  Download,
  RotateCcw,
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

interface Training {
  id: string;
  title: string;
  location: string;
  startDate: string;
  price: string | null;
  description: string;
  imagePath: string | null;
  isActive: boolean;
  requiresPayment: boolean;
  capacity: number | null;
  createdAt: string;
}

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

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

// Deteksi kemungkinan admin lupa centang "berbayar" — harga diisi tapi checkbox belum dicentang
const isPriceRequiresPaymentMismatch = (price: string, requiresPayment: boolean) =>
  !requiresPayment && price.trim() !== "" && price.trim().toLowerCase() !== "gratis";

export default function AdminPelatihanDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [training, setTraining] = useState<Training | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    price: "",
    description: "",
    imagePath: "",
    requiresPayment: false,
    capacity: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Registrant | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofTarget, setProofTarget] = useState<Registrant | null>(null);

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
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router, fetchData]);

  const openEditModal = () => {
    if (!training) return;
    setFormData({
      title: training.title,
      location: training.location,
      startDate: training.startDate.slice(0, 10),
      price: training.price || "",
      description: training.description,
      imagePath: training.imagePath || "",
      requiresPayment: training.requiresPayment,
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
          isActive: training.isActive,
          capacity: formData.capacity.trim() ? Number(formData.capacity.trim()) : null,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchData();
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
    setTogglingActive(true);
    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: training.title,
          location: training.location,
          startDate: training.startDate,
          price: training.price,
          description: training.description,
          imagePath: training.imagePath,
          isActive: !training.isActive,
          requiresPayment: training.requiresPayment,
          capacity: training.capacity,
        }),
      });
      if (res.ok) {
        fetchData();
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
    return <span className="text-slate-400">-</span>;
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session || !training) return null;

  return (
    <div className="min-h-screen bg-slate-50">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pelatihan"
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detail Pelatihan</h1>
            <p className="text-slate-500 mt-1">Kelola data pelatihan dan lihat daftar pendaftar</p>
          </div>
        </div>

        {/* Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="relative h-56 bg-slate-100 flex items-center justify-center">
            {training.imagePath ? (
              <Image
                src={getImageUrl(training.imagePath) || ""}
                alt={training.title}
                fill
                className="object-cover"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-300" />
            )}
            {!training.isActive && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-slate-800/80 text-white border-transparent"
              >
                Nonaktif
              </Badge>
            )}
            {training.requiresPayment && (
              <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-transparent">
                Berbayar
              </Badge>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{training.title}</h1>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={toggleActive} disabled={togglingActive}>
                  <Power className="w-4 h-4" />
                  {training.isActive ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button onClick={openEditModal}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                {training.location}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                {formatDate(training.startDate)}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                {registrants.filter((r) => r.paymentStatus !== "REJECTED").length}
                {training.capacity !== null ? ` / ${training.capacity}` : ""} pendaftar
              </div>
            </div>

            {training.price && (
              <p className="text-lg font-semibold text-blue-600 mb-4">{training.price}</p>
            )}

            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{training.description}</p>
          </div>
        </motion.div>

        {/* Registrants Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Data Pendaftar ({registrants.length})</h2>
            {registrants.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            )}
          </div>
          {registrants.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Belum ada pendaftar.</div>
          ) : (
            <Table className="text-base">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-16 px-4 text-center text-slate-500 text-sm">No</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Nama</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Email</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">No. HP</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Instansi</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Tanggal Daftar</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Status Pembayaran</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Bukti</TableHead>
                  <TableHead className="px-4 text-slate-500 text-sm">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrants.map((r, index) => (
                  <TableRow key={r.id}>
                    <TableCell className="px-4 py-4 text-slate-400 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium text-slate-800">{r.name}</TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        {r.email}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        {r.phone}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {r.institution ? (
                        <span className="inline-flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          {r.institution}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      {renderPaymentBadge(r.paymentStatus)}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      {r.paymentProofPath ? (
                        <Button variant="outline" size="sm" onClick={() => openProofDialog(r)}>
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Bukti
                        </Button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      {r.paymentStatus === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(r.id)}
                            disabled={reviewingId === r.id}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setujui
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectDialog(r)}
                            disabled={reviewingId === r.id}
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </Button>
                        </div>
                      )}
                      {(r.paymentStatus === "APPROVED" || r.paymentStatus === "REJECTED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReset(r.id)}
                          disabled={reviewingId === r.id}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Batalkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </div>

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
            <div className="space-y-1.5">
              <Label htmlFor="edit-startDate">Tanggal Pelaksanaan</Label>
              <Input
                id="edit-startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-price">Harga (opsional)</Label>
              <Input
                id="edit-price"
                placeholder='Contoh: "Gratis" atau "Rp 2.500.000"'
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-requiresPayment"
                type="checkbox"
                checked={formData.requiresPayment}
                onChange={(e) => setFormData((prev) => ({ ...prev, requiresPayment: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="edit-requiresPayment" className="cursor-pointer">
                Training ini berbayar (wajib upload bukti transfer saat daftar)
              </Label>
            </div>
            {isPriceRequiresPaymentMismatch(formData.price, formData.requiresPayment) && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Kamu mengisi harga tapi belum centang &quot;Training ini berbayar&quot; — peserta tidak akan diminta upload bukti pembayaran.</span>
              </div>
            )}
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
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm file:font-medium hover:file:bg-blue-100"
              />
              {uploading && <p className="text-xs text-slate-400 mt-1">Mengunggah...</p>}
              {formData.imagePath && (
                <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden bg-slate-100">
                  <Image src={getImageUrl(formData.imagePath) || ""} alt="Preview" fill className="object-cover" />
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
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              Nominal seharusnya: <span className="font-semibold text-slate-900">{training.price}</span>
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
              <div className="relative w-full h-96 rounded-lg overflow-hidden bg-slate-100">
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
    </div>
  );
}
