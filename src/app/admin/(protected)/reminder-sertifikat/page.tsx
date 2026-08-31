"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Plus,
  Save,
  Circle,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  BellRing,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import CertificationBulkUploadCard from "@/components/certification-holders/CertificationBulkUploadCard";
import { getCertificationStatus } from "@/lib/certification-status";
import type {
  CertificationHolderWithStatus,
  CertificationStatus,
  CertificationCheckpoint,
} from "@/types/certification-holder";

const STATUS_FILTERS: { value: CertificationStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "AKTIF", label: "Aktif" },
  { value: "MENDEKATI_REFRESHMENT", label: "Mendekati Refreshment" },
  { value: "MENDEKATI_KADALUARSA", label: "Mendekati Kadaluarsa" },
  { value: "KADALUARSA", label: "Kadaluarsa" },
];

const STATUS_BADGE: Record<CertificationStatus, string> = {
  AKTIF: "bg-slate-100 text-slate-600 border-transparent",
  MENDEKATI_REFRESHMENT: "bg-amber-100 text-amber-700 border-transparent",
  MENDEKATI_KADALUARSA: "bg-orange-100 text-orange-700 border-transparent",
  KADALUARSA: "bg-red-100 text-red-700 border-transparent",
};

const STATUS_LABEL: Record<CertificationStatus, string> = {
  AKTIF: "Aktif",
  MENDEKATI_REFRESHMENT: "Mendekati Refreshment",
  MENDEKATI_KADALUARSA: "Mendekati Kadaluarsa",
  KADALUARSA: "Kadaluarsa",
};

// Urutan & bobot visual sengaja by urgency (bukan urutan enum) -- ini tool triase,
// jadi "Kadaluarsa" harus kelihatan beda, bukan cuma beda warna di ukuran yang sama.
const STATUS_SUMMARY_CARDS: {
  status: CertificationStatus;
  icon: typeof CheckCircle2;
  card: string;
  iconBox: string;
  label: string;
  value: string;
}[] = [
  {
    status: "KADALUARSA",
    icon: XCircle,
    card: "bg-red-600 border-red-600",
    iconBox: "bg-white/15 text-white",
    label: "text-red-100",
    value: "text-white text-2xl sm:text-3xl",
  },
  {
    status: "MENDEKATI_KADALUARSA",
    icon: AlertTriangle,
    card: "bg-orange-500 border-orange-500",
    iconBox: "bg-white/15 text-white",
    label: "text-orange-50",
    value: "text-white text-2xl sm:text-3xl",
  },
  {
    status: "MENDEKATI_REFRESHMENT",
    icon: Clock,
    card: "bg-white border-slate-200",
    iconBox: "bg-amber-50 text-amber-600",
    label: "text-slate-500",
    value: "text-slate-900 text-xl sm:text-2xl",
  },
  {
    status: "AKTIF",
    icon: CheckCircle2,
    card: "bg-slate-50 border-slate-200",
    iconBox: "bg-white text-slate-400",
    label: "text-slate-400",
    value: "text-slate-500 text-lg sm:text-xl",
  },
];

const emptyForm = {
  bsmrId: "",
  name: "",
  institution: "",
  level: "",
  certificationName: "",
  email: "",
  examDate: "",
  expiryDate: "",
  refreshment1Date: "",
  refreshment2Date: "",
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const PAGE_SIZE = 20;

export default function ReminderSertifikatPage() {
  const [holders, setHolders] = useState<CertificationHolderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | "">("");
  const [levelFilter, setLevelFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [levelOptions, setLevelOptions] = useState<string[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<CertificationStatus, number>>({
    AKTIF: 0,
    MENDEKATI_REFRESHMENT: 0,
    MENDEKATI_KADALUARSA: 0,
    KADALUARSA: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "import">("manual");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<{ row: number; reason: string }[]>([]);
  const [detailHolder, setDetailHolder] = useState<CertificationHolderWithStatus | null>(null);

  // Nyimpen AbortController request yang lagi jalan -- kalau search/filter/page
  // ganti cepat (misal ngetik), request lama dibatalin biar response yang
  // nyusul telat nggak nimpa state dengan hasil query yang udah nggak relevan.
  const fetchAbortRef = useRef<AbortController | null>(null);

  const fetchHolders = async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (levelFilter) params.set("level", levelFilter);
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/certification-holders?${params.toString()}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setHolders(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setStatusCounts(data.statusCounts);
        setLevelOptions(data.levelOptions);
        // Row terakhir di halaman ini kehapus/kefilter -> mundur ke halaman
        // valid terakhir alih-alih nyangkut di halaman kosong.
        if (data.page > data.totalPages) setPage(data.totalPages);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Error fetching certification holders:", error);
    } finally {
      if (fetchAbortRef.current === controller) setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchHolders, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, levelFilter, page]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/certification-holders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData(emptyForm);
        fetchHolders();
        toast.success("Berhasil menambahkan data");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menambahkan data");
      }
    } catch (error) {
      console.error("Error creating certification holder:", error);
      toast.error("Gagal menambahkan data");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (holder: CertificationHolderWithStatus) => {
    setEditingId(holder.id);
    setFormData({
      bsmrId: holder.bsmrId,
      name: holder.name,
      institution: holder.institution,
      level: holder.level,
      certificationName: holder.certificationName,
      email: holder.email,
      examDate: holder.examDate.slice(0, 10),
      expiryDate: holder.expiryDate.slice(0, 10),
      refreshment1Date: holder.refreshment1Date.slice(0, 10),
      refreshment2Date: holder.refreshment2Date.slice(0, 10),
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/certification-holders/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingId(null);
        fetchHolders();
        toast.success("Berhasil menyimpan perubahan");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error updating certification holder:", error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (holder: CertificationHolderWithStatus): Promise<boolean> => {
    if (!confirm(`Hapus data ${holder.name}?`)) return false;
    try {
      const res = await fetch(`/api/certification-holders/${holder.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchHolders();
        toast.success("Berhasil dihapus");
        return true;
      }
      toast.error("Gagal menghapus data");
      return false;
    } catch (error) {
      console.error("Error deleting certification holder:", error);
      toast.error("Gagal menghapus data");
      return false;
    }
  };

  const handleImport = async (records: unknown[]) => {
    setImporting(true);
    setImportErrors([]);
    try {
      const res = await fetch("/api/certification-holders/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
      if (res.ok) {
        const result = await res.json();
        fetchHolders();
        toast.success(
          `${result.created} data baru, ${result.updated} data diupdate` +
            (result.errors.length > 0 ? `, ${result.errors.length} baris gagal` : "")
        );
        if (result.errors.length > 0) {
          // Modal tetap terbuka supaya admin bisa lihat baris mana yang gagal dan
          // kenapa -- sebelumnya alasan per-baris cuma masuk console, tidak pernah
          // sampai ke UI.
          setImportErrors(result.errors);
        } else {
          setShowAddModal(false);
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal mengimport data");
      }
    } catch (error) {
      console.error("Error importing certification holders:", error);
      toast.error("Gagal mengimport data");
    } finally {
      setImporting(false);
    }
  };

  const toggleCheckpoint = async (
    holder: CertificationHolderWithStatus,
    checkpoint: CertificationCheckpoint,
    completed: boolean
  ) => {
    try {
      const res = await fetch(`/api/certification-holders/${holder.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkpoint, completed }),
      });
      if (res.ok) {
        const updated = await res.json();
        fetchHolders();
        // `detailHolder` itu snapshot terpisah dari `holders` -- kalau modal
        // Detail lagi kebuka buat holder yang sama, sync manual di sini biar
        // icon/tombol checkpoint-nya nggak nyangkut nampilin state sebelum
        // toggle sampai modal ditutup-buka lagi.
        setDetailHolder((prev) => {
          if (!prev || prev.id !== holder.id) return prev;
          const merged = { ...prev, ...updated };
          return { ...merged, status: getCertificationStatus(merged) };
        });
      } else {
        toast.error("Gagal mengubah status checkpoint");
      }
    } catch (error) {
      console.error("Error toggling checkpoint:", error);
      toast.error("Gagal mengubah status checkpoint");
    }
  };

  // Dipakai di panel Detail -- satu baris per checkpoint (Refreshment Thn 1/2,
  // Sertifikasi Ulang), bukan lagi di tabel. Icon nunjukin status selesai/belum
  // di sekilas pandang, tombol aksinya pakai komponen Button yang sama kayak
  // tombol lain di modal (bukan link teks polos).
  const renderCheckpointRow = (
    holder: CertificationHolderWithStatus,
    checkpoint: CertificationCheckpoint,
    label: string,
    date: string,
    completedAt: string | null
  ) => (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2.5 min-w-0">
        {completedAt ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{label}</p>
          <p className="text-xs text-slate-400">{formatDate(date)}</p>
        </div>
      </div>
      <Button
        type="button"
        variant={completedAt ? "ghost" : "outline"}
        size="sm"
        onClick={() => toggleCheckpoint(holder, checkpoint, !completedAt)}
        className="shrink-0"
      >
        {completedAt ? "Batalkan" : "Tandai Selesai"}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              aria-label="Kembali ke Admin"
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-600" />
                Reminder Sertifikasi & Refreshment
              </h1>
              <p className="text-slate-500 mt-1">
                Kelola data kadaluarsa sertifikasi dan jadwal refreshment
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setAddMode("manual");
              setFormData(emptyForm);
              setImportErrors([]);
              setShowAddModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Peserta
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STATUS_SUMMARY_CARDS.map(({ status, icon: Icon, card, iconBox, label, value }) => (
            <div
              key={status}
              className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex items-center gap-3 ${card}`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBox} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-medium truncate ${label}`}>{STATUS_LABEL[status]}</p>
                <p className={`font-bold mt-0.5 ${value}`}>{statusCounts[status]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, ID BSMR, atau instansi..."
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <Select
            value={statusFilter || "semua"}
            onValueChange={(v) => {
              setStatusFilter(v === "semua" ? "" : (v as CertificationStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value || "semua"} value={f.value || "semua"}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {levelOptions.length > 0 && (
            <Select
              value={levelFilter || "semua"}
              onValueChange={(v) => {
                setLevelFilter(v === "semua" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue placeholder="Jenjang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Jenjang</SelectItem>
                {levelOptions.map((level) => (
                  <SelectItem key={level} value={level}>
                    Jenjang {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {total === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada data. Klik &quot;Tambah Peserta&quot; untuk mulai.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID BSMR</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Instansi</TableHead>
                  <TableHead>Masa Berakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holders.map((holder) => (
                  <TableRow key={holder.id}>
                    <TableCell className="font-medium">{holder.bsmrId}</TableCell>
                    <TableCell>{holder.name}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[holder.status]}>{STATUS_LABEL[holder.status]}</Badge>
                    </TableCell>
                    <TableCell>{holder.institution}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(holder.expiryDate)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setDetailHolder(holder)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">
              Halaman {page} dari {totalPages} &mdash; {total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Peserta</DialogTitle>
          </DialogHeader>

          <ToggleGroup
            type="single"
            variant="outline"
            value={addMode}
            onValueChange={(v) => {
              if (!v) return;
              setAddMode(v as "manual" | "import");
              setImportErrors([]);
            }}
            className="grid grid-cols-2"
          >
            <ToggleGroupItem value="manual">Input Manual</ToggleGroupItem>
            <ToggleGroupItem value="import">Import Excel</ToggleGroupItem>
          </ToggleGroup>

          {addMode === "manual" ? (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <CertificationHolderFields formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <CertificationBulkUploadCard
              onImport={handleImport}
              onError={(msg) => toast.error(msg)}
              importing={importing}
            />
          )}
          {importErrors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-red-700 mb-1.5">
                {importErrors.length} baris gagal diimport:
              </p>
              <ul className="space-y-1">
                {importErrors.map((err) => (
                  <li key={err.row} className="text-xs text-red-600">
                    Baris {err.row}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <CertificationHolderFields formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!detailHolder} onOpenChange={(open) => !open && setDetailHolder(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          {detailHolder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{detailHolder.name}</DialogTitle>
                  <Badge className={STATUS_BADGE[detailHolder.status]}>
                    {STATUS_LABEL[detailHolder.status]}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">ID BSMR</p>
                  <p className="font-medium text-slate-700">{detailHolder.bsmrId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Jenjang</p>
                  <p className="font-medium text-slate-700">{detailHolder.level}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Instansi</p>
                  <p className="font-medium text-slate-700">{detailHolder.institution}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Sertifikasi yang Diambil</p>
                  <p className="font-medium text-slate-700">{detailHolder.certificationName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-700">{detailHolder.email}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">
                  Checkpoint
                </p>
                <div className="divide-y divide-slate-50">
                  {/* Urutan kronologis kejadian aslinya: refreshment thn 1 -> thn 2 ->
                      baru sertifikasi ulang di akhir masa berlaku. */}
                  {renderCheckpointRow(
                    detailHolder,
                    "refreshment1",
                    "Refreshment Tahun 1",
                    detailHolder.refreshment1Date,
                    detailHolder.refreshment1CompletedAt
                  )}
                  {renderCheckpointRow(
                    detailHolder,
                    "refreshment2",
                    "Refreshment Tahun 2",
                    detailHolder.refreshment2Date,
                    detailHolder.refreshment2CompletedAt
                  )}
                  {renderCheckpointRow(
                    detailHolder,
                    "recert",
                    "Sertifikasi Ulang",
                    detailHolder.expiryDate,
                    detailHolder.recertCompletedAt
                  )}
                </div>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={async () => {
                    if (await handleDelete(detailHolder)) setDetailHolder(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    openEditModal(detailHolder);
                    setDetailHolder(null);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CertificationHolderFields({
  formData,
  setFormData,
}: {
  formData: typeof emptyForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}) {
  const update = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bsmrId">ID BSMR</Label>
          <Input id="bsmrId" required value={formData.bsmrId} onChange={update("bsmrId")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Jenjang</Label>
          <Input id="level" required value={formData.level} onChange={update("level")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" required value={formData.name} onChange={update("name")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="institution">Instansi</Label>
        <Input id="institution" required value={formData.institution} onChange={update("institution")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="certificationName">Sertifikasi yang Diambil</Label>
        <Input id="certificationName" required value={formData.certificationName} onChange={update("certificationName")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={formData.email} onChange={update("email")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="examDate">Tanggal Ujian</Label>
          <Input id="examDate" type="date" required value={formData.examDate} onChange={update("examDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiryDate">Masa Berakhir</Label>
          <Input id="expiryDate" type="date" value={formData.expiryDate} onChange={update("expiryDate")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="refreshment1Date">Refreshment Thn 1</Label>
          <Input id="refreshment1Date" type="date" value={formData.refreshment1Date} onChange={update("refreshment1Date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="refreshment2Date">Refreshment Thn 2</Label>
          <Input id="refreshment2Date" type="date" value={formData.refreshment2Date} onChange={update("refreshment2Date")} />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Kosongkan Masa Berakhir/Refreshment untuk otomatis dihitung 3/1/2 tahun dari Tanggal Ujian.
      </p>
    </>
  );
}
