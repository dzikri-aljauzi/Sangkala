"use client";

import { useEffect, useState } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  TRAINING_DATE_FILTERS,
  TrainingDateFilter,
  getTrainingDateRange,
  isTrainingDateFilter,
} from "@/lib/training-filters";

interface Training {
  id: string;
  title: string;
  location: string;
  startDate: string;
  price: string | null;
  description: string;
  imagePath: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { registrants: number };
}

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
  price: "",
  description: "",
  imagePath: "",
};

export default function AdminPelatihanPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<TrainingDateFilter | "">("");
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);

    try {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData(emptyForm);
        fetchTrainings();
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
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (dateFilter) {
      const { start, end } = getTrainingDateRange(dateFilter);
      const startDate = new Date(t.startDate);
      if (startDate < start || startDate > end) return false;
    }

    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
        {/* Page Title + Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Data Pelatihan</h1>
              <p className="text-slate-500 mt-1">Kelola daftar pelatihan yang tampil di /info-pelatihan</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setFormData(emptyForm);
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Pelatihan
          </Button>
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
              className="pl-10 h-10 rounded-xl"
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">{training.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{training.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {formatDate(training.startDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {training._count.registrants} pendaftar
                  </div>
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
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Tanggal Pelaksanaan</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (opsional)</Label>
              <Input
                id="price"
                placeholder='Contoh: "Gratis" atau "Rp 2.500.000"'
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
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
                <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden bg-slate-100">
                  <Image src={getImageUrl(formData.imagePath) || ""} alt="Preview" fill className="object-cover" />
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
    </>
  );
}
