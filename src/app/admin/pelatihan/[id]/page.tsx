"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  X,
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
} from "lucide-react";

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
}

interface Registrant {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string | null;
  createdAt: string;
}

const getImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

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
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

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
        alert("Gagal upload gambar");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal upload gambar");
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
        body: JSON.stringify({ ...formData, isActive: training.isActive }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error updating training:", error);
      alert("Gagal menyimpan perubahan");
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
        }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal mengubah status pelatihan");
      }
    } catch (error) {
      console.error("Error toggling active state:", error);
      alert("Gagal mengubah status pelatihan");
    } finally {
      setTogglingActive(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
              <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold bg-slate-800/80 text-white rounded-md">
                Nonaktif
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{training.title}</h1>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={toggleActive}
                  disabled={togglingActive}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Power className="w-4 h-4" />
                  {training.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
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
                {registrants.length} pendaftar
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
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Data Pendaftar ({registrants.length})</h2>
          </div>
          {registrants.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Belum ada pendaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">No. HP</th>
                    <th className="px-5 py-3">Instansi</th>
                    <th className="px-5 py-3">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {registrants.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-800">{r.name}</td>
                      <td className="px-5 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {r.email}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {r.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {r.institution ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {r.institution}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-slate-900">Edit Pelatihan</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Pelatihan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tempat</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga (opsional)</label>
                <input
                  type="text"
                  placeholder='Contoh: "Gratis" atau "Rp 2.500.000"'
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gambar (opsional)</label>
                <input
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
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
