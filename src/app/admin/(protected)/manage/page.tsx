"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  X,
  Save,
  Image as ImageIcon,
  FileText,
  Calendar,
  User,
  Tag,
  Layout,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";

interface Article {
  id: string;
  slug: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  excerptId: string | null;
  excerptEn: string | null;
  authorName: string;
  authorPosition: string | null;
  category: string;
  coverImage: string | null;
  imagePosition: string;
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "ARTICLE", label: "Article" },
  { value: "WHITEPAPER", label: "Whitepaper" },
  { value: "WEBINAR", label: "Webinar & Event" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "TEMPLATE", label: "Tools & Template" },
];

const IMAGE_POSITIONS = [
  { value: "TOP", label: "Atas (Full Width)" },
  { value: "LEFT", label: "Kiri" },
  { value: "RIGHT", label: "Kanan" },
  { value: "CENTER", label: "Tengah" },
];

// Helper to convert upload path to API path for serving images
const getImageUrl = (path: string | null) => {
  if (!path) return null;
  // If it's an external URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Convert /uploads/articles/... to /api/public/images/uploads/articles/...
  if (path.startsWith("/uploads/")) {
    return `/api/public/images${path}`;
  }
  return path;
};

export default function AdminInsightsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    slug: "",
    titleId: "",
    titleEn: "",
    contentId: "",
    contentEn: "",
    excerptId: "",
    excerptEn: "",
    authorName: "",
    authorPosition: "",
    category: "ARTICLE",
    coverImage: "",
    imagePosition: "TOP",
    status: "DRAFT",
    isFeatured: false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (field: "titleId" | "titleEn", value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Auto-generate slug from Indonesian title if slug is empty
      if (field === "titleId" && !prev.slug) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("type", "article");

    try {
      const res = await fetch("/api/upload/article", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, coverImage: data.filePath }));
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
    setSaving(true);

    try {
      const url = editingArticle
        ? `/api/articles/${editingArticle.id}`
        : "/api/articles";
      const method = editingArticle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.status === "PUBLISHED" ? new Date().toISOString() : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingArticle(null);
        resetForm();
        fetchArticles();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan artikel");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Gagal menyimpan artikel");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      slug: article.slug,
      titleId: article.titleId,
      titleEn: article.titleEn,
      contentId: article.contentId,
      contentEn: article.contentEn,
      excerptId: article.excerptId || "",
      excerptEn: article.excerptEn || "",
      authorName: article.authorName,
      authorPosition: article.authorPosition || "",
      category: article.category,
      coverImage: article.coverImage || "",
      imagePosition: article.imagePosition,
      status: article.status,
      isFeatured: article.isFeatured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchArticles();
      } else {
        alert("Gagal menghapus artikel");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Gagal menghapus artikel");
    }
  };

  const toggleStatus = async (article: Article) => {
    const newStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : null,
        }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const toggleFeatured = async (article: Article) => {
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !article.isFeatured }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      titleId: "",
      titleEn: "",
      contentId: "",
      contentEn: "",
      excerptId: "",
      excerptEn: "",
      authorName: "",
      authorPosition: "",
      category: "ARTICLE",
      coverImage: "",
      imagePosition: "TOP",
      status: "DRAFT",
      isFeatured: false,
    });
  };

  const openCreateModal = () => {
    setEditingArticle(null);
    resetForm();
    setShowModal(true);
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.titleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || article.category === filterCategory;
    const matchesStatus = !filterStatus || article.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Kelola Insights</h1>
                <p className="text-sm text-slate-500">Manage articles & content</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Artikel Baru
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total Artikel</p>
            <p className="text-2xl font-bold text-slate-900">{articles.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {articles.filter((a) => a.status === "PUBLISHED").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">
              {articles.filter((a) => a.status === "DRAFT").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Featured</p>
            <p className="text-2xl font-bold text-purple-600">
              {articles.filter((a) => a.isFeatured).length}
            </p>
          </div>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Belum ada artikel</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat Artikel Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Cover Image */}
                  {article.coverImage ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={getImageUrl(article.coverImage) || ""}
                        alt={article.titleId}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 truncate">
                          {article.titleId}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{article.titleEn}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            article.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {article.status === "PUBLISHED" ? "Published" : "Draft"}
                        </span>
                        {/* Category Badge */}
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {CATEGORIES.find((c) => c.value === article.category)?.label}
                        </span>
                        {/* Featured Badge */}
                        {article.isFeatured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.authorName}
                        {article.authorPosition && ` - ${article.authorPosition}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(article)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          article.status === "PUBLISHED"
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {article.status === "PUBLISHED" ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Publish
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleFeatured(article)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          article.isFeatured
                            ? "text-purple-600 hover:bg-purple-50"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {article.isFeatured ? (
                          <>
                            <StarOff className="w-4 h-4" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4" />
                            Feature
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingArticle ? "Edit Artikel" : "Artikel Baru"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingArticle(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Judul (ID) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleId}
                    onChange={(e) => handleTitleChange("titleId", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title (EN) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => handleTitleChange("titleEn", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL: /insights/{formData.slug || "..."}
                </p>
              </div>

              {/* Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Penulis *
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Jabatan Penulis
                  </label>
                  <input
                    type="text"
                    value={formData.authorPosition}
                    onChange={(e) => setFormData({ ...formData, authorPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Opsional"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Posisi Gambar
                  </label>
                  <select
                    value={formData.imagePosition}
                    onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {IMAGE_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="text-sm text-slate-700">
                  Tampilkan sebagai Featured Article
                </label>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cover Image
                </label>
                <div className="flex items-start gap-4">
                  {formData.coverImage ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(formData.coverImage) || ""}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: "" })}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                      <span className="text-xs text-slate-500 mt-1">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">
                      Atau masukkan URL gambar:
                    </p>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ringkasan (ID)
                  </label>
                  <textarea
                    value={formData.excerptId}
                    onChange={(e) => setFormData({ ...formData, excerptId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Ringkasan singkat untuk preview..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Excerpt (EN)
                  </label>
                  <textarea
                    value={formData.excerptEn}
                    onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Short excerpt for preview..."
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Konten (ID) *
                </label>
                <textarea
                  value={formData.contentId}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                  placeholder="Tulis konten artikel dalam bahasa Indonesia...&#10;&#10;Gunakan format:&#10;**teks tebal**&#10;*teks miring*&#10;- list item"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content (EN) *
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                  placeholder="Write article content in English...&#10;&#10;Use format:&#10;**bold text**&#10;*italic text*&#10;- list item"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
