"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Save,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowLeft,
  AlertTriangle,
  Maximize2,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  TRAINING_DATE_FILTERS,
  TrainingDateFilter,
  getTrainingDateRange,
  isTrainingDateFilter,
} from "@/lib/training-filters";
import { formatRupiahInput, formatTrainingDateRange } from "@/lib/utils";
import type { TrainingWithCount as Training } from "@/types/training";

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

const emptyForm = {
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  price: "",
  description: "",
  imagePath: "",
  requiresPayment: true,
  capacity: "",
};

export default function AdminPelatihanPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<TrainingDateFilter | "">("");
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const res = await fetch("/api/trainings?includeInactive=true");
      if (res.ok) {
        setTrainings(await res.json());
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setLoading(false);
    }
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
        toast.success("Foto berhasil diupload");
      } else {
        toast.error("Gagal mengupload foto");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate ? formData.endDate : null,
          requiresPayment: true,
          capacity: formData.capacity.trim() ? Number(formData.capacity.trim()) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData(emptyForm);
        fetchTrainings();
        toast.success("Pelatihan berhasil dibuat");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyimpan pelatihan");
      }
    } catch (error) {
      console.error("Error saving training:", error);
      toast.error("Gagal menyimpan pelatihan");
    } finally {
      setSaving(false);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (!dateFilter) return true;

    const range = getTrainingDateRange(dateFilter);
    if (!range) return true;

    const trainingStart = new Date(t.startDate).getTime();
    return trainingStart >= range.start.getTime() && trainingStart <= range.end.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="sr-only">Memuat data pelatihan...</span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Data Pelatihan</h1>
              <p className="text-slate-500 mt-1">Kelola daftar pelatihan yang tampil di /info-pelatihan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link href="/admin/pelatihan/pengaturan-pembayaran">
                <Button variant="outline">Pengaturan Rekening</Button>
              </Link>
            )}
            <Button
              onClick={() => {
                setFormData(emptyForm);
                setShowModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Tambah Pelatihan
            </Button>
          </div>
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pelatihan..."
              aria-label="Cari judul atau lokasi pelatihan"
              className="pl-10 h-10 rounded-xl bg-white border border-slate-200 text-sm shadow-xs"
            />
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={2}
            value={dateFilter || "semua"}
            onValueChange={(v) => {
              if (!v) return;
              setDateFilter(v !== "semua" && isTrainingDateFilter(v) ? v : "");
            }}
            className="flex-wrap justify-start gap-2"
          >
            <ToggleGroupItem
              value="semua"
              className="rounded-full border-slate-200 px-3 text-xs font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
            >
              Semua
            </ToggleGroupItem>
            {TRAINING_DATE_FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                className="rounded-full border-slate-200 px-3 text-xs font-medium data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600"
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Cards */}
        {filteredTrainings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            {trainings.length === 0
              ? <>Belum ada pelatihan. Klik &quot;Tambah Pelatihan&quot; untuk membuat yang pertama.</>
              : <>Tidak ada pelatihan yang cocok dengan pencarian/filter saat ini.</>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrainings.map((training) => (
              <Link
                key={training.id}
                href={`/admin/pelatihan/${training.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="relative h-40 bg-slate-100 flex items-center justify-center">
                  {training.imagePath ? (
                    <Image
                      src={getImageUrl(training.imagePath) || ""}
                      alt={training.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  )}
                  {!training.isActive && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold bg-slate-800/80 text-white rounded-md">
                      Nonaktif
                    </span>
                  )}
                  {training.requiresPayment && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white border-transparent">
                      Berbayar
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">{training.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{training.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {formatTrainingDateRange(training.startDate, training.endDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {training._count.registrants}
                    {training.capacity !== null ? ` / ${training.capacity}` : ""} pendaftar
                  </div>
                  {training.createdBy && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Oleh: <strong className="text-slate-600 font-medium">{training.createdBy.name}</strong></span>
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                        {training.createdBy.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Pelatihan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul Pelatihan</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Tempat</Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-500 text-sm font-medium select-none pointer-events-none">
                  Rp
                </span>
                <Input
                  id="price"
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
              <Label htmlFor="capacity">Kuota Peserta (opsional)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="Kosongkan kalau tidak terbatas"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Gambar (opsional)</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm file:font-medium hover:file:bg-blue-100"
              />
              {uploading && <p className="text-xs text-slate-400 mt-1">Mengunggah...</p>}
              {formData.imagePath && (
                <div className="relative w-full h-36 mt-2 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
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
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Full Preview Modal */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Preview Gambar Pelatihan</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <div className="relative w-full flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Preview Full"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
