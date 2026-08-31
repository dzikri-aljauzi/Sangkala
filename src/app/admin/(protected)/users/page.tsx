"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface AssessmentOption {
  id: string;
  name: string;
  clientName: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  assessmentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assessment?: {
    id: string;
    name: string;
    clientName: string;
  } | null;
  _count?: {
    trainings: number;
    auditLogs: number;
  };
}

const ROLES = [
  { value: "ALL", label: "Semua Role" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Sub Admin" },
  { value: "ASESOR", label: "Asesor" },
  { value: "KLIEN", label: "Klien" },
  { value: "STAFF_KLIEN", label: "Staff Klien" },
];

// Issue #17: sebelumnya Super Admin harus mikirin & ngetik sendiri password
// sementara tiap kali bikin/reset akun. Exclude karakter yang gampang ketuker
// (0/O, 1/l/I) karena password ini kadang perlu disampein manual ke user.
function generateSecurePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (n) => chars[n % chars.length]).join("");
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedAssessment, setSelectedAssessment] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmToggleUser, setConfirmToggleUser] = useState<UserItem | null>(null);

  const [activeUser, setActiveUser] = useState<UserItem | null>(null);

  // Bulk action: pilih beberapa akun sekaligus buat aktifkan/nonaktifkan bareng --
  // sebelumnya harus satu-satu klik toggle per baris.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirmActive, setBulkConfirmActive] = useState<boolean | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    assessmentId: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "ADMIN",
    assessmentId: "",
    isActive: true,
  });
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", page.toString());
      queryParams.set("pageSize", pageSize.toString());
      if (debouncedSearch.trim()) queryParams.set("search", debouncedSearch.trim());
      if (selectedRole !== "ALL") queryParams.set("role", selectedRole);
      if (selectedAssessment !== "ALL") queryParams.set("assessmentId", selectedAssessment);

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.pagination) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalItems(data.pagination.total || 0);
        } else if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
          setTotalItems(data.length);
        }
      } else if (res.status === 403) {
        toast.error("Hanya Super Admin yang berwenang mengakses halaman ini");
        router.push("/admin");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, selectedRole, selectedAssessment, router]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedRole, selectedAssessment]);

  // Selection bulk-action nggak relevan lagi begitu halaman/filter ganti (baris
  // yang keliatan udah beda) -- bersihin biar nggak nyangkut nunjuk row lama.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, pageSize, debouncedSearch, selectedRole, selectedAssessment]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }
    fetchUsers();
    fetchAssessments();
  }, [session, status, fetchUsers, fetchAssessments, router]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRole("ALL");
    setSelectedAssessment("ALL");
    setPage(1);
  };

  const isSelfUser = useCallback(
    (user: UserItem) =>
      (!!session?.user?.id && user.id === session.user.id) ||
      (!!session?.user?.email && user.email.toLowerCase() === session.user.email.toLowerCase()),
    [session]
  );

  const selectableUsers = users.filter((u) => !isSelfUser(u));
  const allSelectableSelected =
    selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));
  const someSelectableSelected = selectableUsers.some((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const executeBulkToggle = async (activate: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkSubmitting(true);
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: activate }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok).length;
      const succeeded = results.length - failed;
      if (succeeded > 0) {
        toast.success(
          `${succeeded} akun berhasil di${activate ? "aktifkan" : "nonaktifkan"}`
        );
      }
      if (failed > 0) {
        toast.error(`${failed} akun gagal diproses`);
      }
      setSelectedIds(new Set());
      setBulkConfirmActive(null);
      fetchUsers();
    } catch (err) {
      console.error("Error processing bulk status change:", err);
      toast.error("Gagal memproses aksi massal");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          assessmentId:
            createForm.role === "ASESOR" ||
            createForm.role === "KLIEN" ||
            createForm.role === "STAFF_KLIEN"
              ? createForm.assessmentId
              : null,
        }),
      });
      if (res.ok) {
        toast.success(`Pengguna ${createForm.name} berhasil dibuat`);
        setShowCreateModal(false);
        setCreateForm({ name: "", email: "", password: "", role: "ADMIN", assessmentId: "" });
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal membuat pengguna");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Gagal membuat pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setShowConfirmEditModal(true);
  };

  const executeEditSubmit = async () => {
    if (!activeUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          assessmentId:
            editForm.role === "ASESOR" ||
            editForm.role === "KLIEN" ||
            editForm.role === "STAFF_KLIEN"
              ? editForm.assessmentId
              : null,
        }),
      });
      if (res.ok) {
        const isSelf =
          (!!session?.user?.id && activeUser.id === session.user.id) ||
          (!!session?.user?.email && activeUser.email.toLowerCase() === session.user.email.toLowerCase());

        if (isSelf && editForm.email.toLowerCase().trim() !== activeUser.email.toLowerCase()) {
          toast.success("Profil berhasil diperbarui. Gunakan email baru saat login berikutnya.");
        } else {
          toast.success("Profil pengguna berhasil diperbarui");
        }
        setShowConfirmEditModal(false);
        setShowEditModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal memperbarui pengguna");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Gagal memperbarui pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !resetPasswordValue.trim() || resetPasswordValue.trim().length < 6) return;
    setShowConfirmResetModal(true);
  };

  const executeResetPassword = async () => {
    if (!activeUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPasswordValue }),
      });
      if (res.ok) {
        toast.success(`Password untuk ${activeUser.name} berhasil direset`);
        setShowConfirmResetModal(false);
        setShowResetModal(false);
        setResetPasswordValue("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal mereset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error("Gagal mereset password");
    } finally {
      setSubmitting(false);
    }
  };

  const executeToggleStatus = async (user: UserItem) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(`Status ${user.name} berhasil diubah ke ${!user.isActive ? "Aktif" : "Nonaktif"}`);
        setConfirmToggleUser(null);
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal mengubah status pengguna");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      toast.error("Gagal mengubah status pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Pengguna ${activeUser.name} berhasil dihapus`);
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menghapus pengguna");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Gagal menghapus pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-status-purple-bg text-status-purple border-status-purple-border">Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-status-info-bg text-status-info border-status-info-border">Sub Admin</Badge>;
      case "ASESOR":
        return <Badge className="bg-status-success-bg text-status-success border-status-success-border">Asesor</Badge>;
      case "KLIEN":
        return <Badge className="bg-status-warning-bg text-status-warning border-status-warning-border">Klien</Badge>;
      case "STAFF_KLIEN":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Staff Klien</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="sr-only">Memuat data pengguna...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            Manajemen Pengguna
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola seluruh akun Super Admin, Sub Admin, Asesor, Klien, dan hak akses sistem
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateForm({ name: "", email: "", password: "", role: "ADMIN", assessmentId: "" });
            setShowCreateModal(true);
          }}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </Button>
      </motion.div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            aria-label="Cari nama atau email pengguna"
            className="pl-9 pr-8 h-10 rounded-xl text-sm bg-white border-slate-200 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Hapus teks pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assessment Dropdown Filter */}
        <div className="w-full sm:w-64 lg:w-72 shrink-0">
          <Select
            value={selectedAssessment}
            onValueChange={(val) => setSelectedAssessment(val)}
          >
            <SelectTrigger className="w-full h-9.5 rounded-xl border-slate-200 text-xs bg-white">
              <SelectValue placeholder="Semua Proyek Assessment" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 text-xs font-sans max-h-64">
              <SelectItem value="ALL">Semua Proyek Assessment</SelectItem>
              <SelectItem value="NONE">Tanpa Assessment (Global Admin)</SelectItem>
              {assessments.map((a) => (
                <SelectItem key={a.id} value={a.id} className="truncate">
                  {a.clientName} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedRole === r.value
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Reset Filter Button */}
        {(selectedRole !== "ALL" || selectedAssessment !== "ALL" || searchQuery.trim() !== "") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-800 gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
      >
        {selectedIds.size > 0 ? (
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60">
            <p className="text-sm font-semibold text-blue-900">
              {selectedIds.size} akun dipilih
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkConfirmActive(true)}
                disabled={bulkSubmitting}
                className="h-8 text-xs gap-1.5 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aktifkan Terpilih
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkConfirmActive(false)}
                disabled={bulkSubmitting}
                className="h-8 text-xs gap-1.5 bg-white border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Nonaktifkan Terpilih
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                disabled={bulkSubmitting}
                className="h-8 text-xs text-slate-500"
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Total Pengguna: <span className="text-blue-600">{totalItems}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              aria-label="Muat ulang daftar pengguna"
              className="gap-1.5 text-xs text-slate-500"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Muat Ulang
            </Button>
          </div>
        )}

        {users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Tidak ada pengguna yang cocok dengan pencarian / filter yang dipilih.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelectableSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allSelectableSelected && someSelectableSelected;
                    }}
                    onChange={toggleSelectAll}
                    disabled={selectableUsers.length === 0}
                    aria-label="Pilih semua pengguna di halaman ini"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs">Pengguna</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs">Role</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs">Proyek Assessment</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs">Status Akun</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs">Aktivitas & Data</TableHead>
                <TableHead className="px-4 py-3 text-slate-600 text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isCurrentSelf = isSelfUser(user);

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/70">
                    <TableCell className="px-4 py-3.5">
                      {!isCurrentSelf && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelectOne(user.id)}
                          aria-label={`Pilih ${user.name}`}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                            {isCurrentSelf && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-status-purple-bg text-status-purple border border-status-purple-border"
                            : user.role === "ADMIN"
                            ? "bg-status-info-bg text-status-info border border-status-info-border"
                            : user.role === "ASESOR"
                            ? "bg-status-success-bg text-status-success border border-status-success-border"
                            : user.role === "KLIEN"
                            ? "bg-status-warning-bg text-status-warning border border-status-warning-border"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {user.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : user.role === "ADMIN"
                          ? "Sub Admin"
                          : user.role === "ASESOR"
                          ? "Asesor"
                          : user.role === "KLIEN"
                          ? "Klien"
                          : "Staff Klien"}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3.5">
                      {user.assessment ? (
                        <Link
                          href={`/assessment-center/${user.assessment.id}/dashboard`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium group"
                          title={`${user.assessment.clientName} - ${user.assessment.name}`}
                          aria-label={`Buka dashboard assessment ${user.assessment.clientName} - ${user.assessment.name}`}
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-blue-600" />
                          <span className="truncate max-w-[200px]">
                            {user.assessment.clientName} - {user.assessment.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 opacity-70" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => !isCurrentSelf && setConfirmToggleUser(user)}
                          disabled={isCurrentSelf}
                          role="switch"
                          aria-checked={user.isActive}
                          aria-label={`Ubah status aktif pengguna ${user.name}`}
                          className={`
                            relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                            transition-colors duration-200 ease-in-out
                            ${user.isActive ? "bg-green-500" : "bg-red-500"}
                            ${isCurrentSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          `}
                          title={
                            isCurrentSelf
                              ? "Tidak bisa menonaktifkan akun sendiri"
                              : user.isActive
                              ? "Klik untuk menonaktifkan user"
                              : "Klik untuk mengaktifkan kembali user"
                          }
                        >
                          <span
                            className={`
                              inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0
                              transition-transform duration-200 ease-in-out
                              ${user.isActive ? "translate-x-[22px]" : "translate-x-[2px]"}
                            `}
                          />
                        </button>
                        <span className={`text-xs font-medium ${user.isActive ? "text-green-700" : "text-red-600"}`}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3.5 text-xs text-slate-600">
                      <div className="space-y-0.5">
                        {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
                          <>
                            <p>{user._count?.trainings || 0} pelatihan dibuat</p>
                            <p className="text-slate-400">{user._count?.auditLogs || 0} aksi tercatat</p>
                          </>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveUser(user);
                            setEditForm({
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              assessmentId: user.assessment?.id || "",
                              isActive: user.isActive,
                            });
                            setShowEditModal(true);
                          }}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                          title="Edit Profil/Role/Assessment"
                          aria-label={`Edit profil ${user.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveUser(user);
                            setResetPasswordValue("");
                            setShowResetModal(true);
                          }}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Reset Password"
                          aria-label={`Reset password ${user.name}`}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </Button>

                        {!isCurrentSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus Akun"
                            aria-label={`Hapus akun ${user.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {/* Left: Summary text with bigger font */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 font-medium">
                Menampilkan <strong className="text-slate-900 font-semibold">{Math.min(totalItems, (page - 1) * pageSize + 1)}</strong> -{" "}
                <strong className="text-slate-900 font-semibold">{Math.min(totalItems, page * pageSize)}</strong> dari{" "}
                <strong className="text-slate-900 font-semibold">{totalItems}</strong> pengguna
              </p>
            </div>

            {/* Right: Baris selector + Prev / Next Controls */}
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <span>Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 text-sm font-medium text-slate-800 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  aria-label="Halaman sebelumnya"
                  className="h-9 px-3 text-sm font-medium gap-1.5 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-slate-700 px-2 font-semibold">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  aria-label="Halaman berikutnya"
                  className="h-9 px-3 text-sm font-medium gap-1.5 bg-white disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Tambah User */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Tambah Pengguna Baru
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nama Lengkap</Label>
              <Input
                id="create-name"
                required
                placeholder="Contoh: Budi Santoso"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Alamat Email</Label>
              <Input
                id="create-email"
                type="email"
                required
                placeholder="nama@email.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-password">Password Sementara</Label>
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({ ...prev, password: generateSecurePassword() }));
                    setShowCreatePassword(true);
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Buat Otomatis
                </button>
              </div>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showCreatePassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                />
                <PasswordToggleButton
                  visible={showCreatePassword}
                  onToggle={() => setShowCreatePassword(!showCreatePassword)}
                  size="sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-role">Role Pengguna</Label>
              <Select
                value={createForm.role}
                onValueChange={(val) => setCreateForm((prev) => ({ ...prev, role: val }))}
              >
                <SelectTrigger id="create-role" className="w-full h-10 rounded-md border-slate-200 text-sm bg-white">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 text-sm font-sans">
                  <SelectItem value="ADMIN">Sub Admin (Hanya Kelola Pelatihan Sendiri)</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin (Akses Penuh Semua Modul)</SelectItem>
                  <SelectItem value="ASESOR">Asesor (Assessment Center)</SelectItem>
                  <SelectItem value="KLIEN">Klien (Assessment Center)</SelectItem>
                  <SelectItem value="STAFF_KLIEN">Staff Klien (Assessment Center)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessment selector for Assessment Roles */}
            {(createForm.role === "ASESOR" ||
              createForm.role === "KLIEN" ||
              createForm.role === "STAFF_KLIEN") && (
              <div className="space-y-1.5 min-w-0 w-full">
                <Label htmlFor="create-assessment">Proyek Assessment Terkait</Label>
                <Select
                  value={createForm.assessmentId || "NONE"}
                  onValueChange={(val) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      assessmentId: val === "NONE" ? "" : val,
                    }))
                  }
                >
                  <SelectTrigger
                    id="create-assessment"
                    className="w-full min-w-0 max-w-full h-10 rounded-md border-slate-200 text-sm bg-white overflow-hidden"
                  >
                    <SelectValue placeholder="Pilih Proyek Assessment" className="truncate text-left" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 text-sm font-sans max-h-60 max-w-sm sm:max-w-md">
                    <SelectItem value="NONE">-- Tidak Terkait Assessment --</SelectItem>
                    {assessments.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="truncate">
                        {a.clientName} — {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? "Menyimpan..." : "Buat Akun"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edit User */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md rounded-2xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Profil Pengguna</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 w-full min-w-0">
            <div className="space-y-1.5 min-w-0 w-full">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                required
                className="w-full min-w-0"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 min-w-0 w-full">
              <Label htmlFor="edit-email">Alamat Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                className="w-full min-w-0"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {(() => {
              const isEditingSelf =
                (!!session?.user?.id && activeUser?.id === session.user.id) ||
                (!!session?.user?.email && activeUser?.email.toLowerCase() === session.user.email.toLowerCase());

              return (
                <div className="space-y-1.5 min-w-0 w-full">
                  <Label htmlFor="edit-role">Role Pengguna</Label>
                  {isEditingSelf ? (
                    <div className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-slate-100 text-slate-700 flex items-center justify-between cursor-not-allowed select-none">
                      <span className="font-semibold text-slate-800">Super Admin (Akses Penuh)</span>
                      <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">
                        Terkunci
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={editForm.role}
                      onValueChange={(val) => setEditForm((prev) => ({ ...prev, role: val }))}
                    >
                      <SelectTrigger
                        id="edit-role"
                        className="w-full min-w-0 max-w-full h-10 rounded-md border-slate-200 text-sm bg-white overflow-hidden"
                      >
                        <SelectValue placeholder="Pilih Role" className="truncate text-left" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 text-sm font-sans max-w-sm sm:max-w-md">
                        <SelectItem value="ADMIN">Sub Admin</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="ASESOR">Asesor</SelectItem>
                        <SelectItem value="KLIEN">Klien</SelectItem>
                        <SelectItem value="STAFF_KLIEN">Staff Klien</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {isEditingSelf && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Untuk mencegah penguncian akses sistem, Anda tidak dapat mengubah role akun Super Admin Anda sendiri.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Assessment selector in Edit Modal */}
            {(editForm.role === "ASESOR" ||
              editForm.role === "KLIEN" ||
              editForm.role === "STAFF_KLIEN") && (
              <div className="space-y-1.5 min-w-0 w-full">
                <Label htmlFor="edit-assessment">Proyek Assessment Terkait</Label>
                <Select
                  value={editForm.assessmentId || "NONE"}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assessmentId: val === "NONE" ? "" : val,
                    }))
                  }
                >
                  <SelectTrigger
                    id="edit-assessment"
                    className="w-full min-w-0 max-w-full h-10 rounded-md border-slate-200 text-sm bg-white overflow-hidden"
                  >
                    <SelectValue placeholder="Pilih Proyek Assessment" className="truncate text-left" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 text-sm font-sans max-h-60 max-w-sm sm:max-w-md">
                    <SelectItem value="NONE">-- Tidak Terkait Assessment --</SelectItem>
                    {assessments.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="truncate">
                        {a.clientName} — {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Reset Password */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Key className="w-5 h-5 text-amber-600" />
              Reset Password — {activeUser?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-500">
              Masukkan password baru untuk pengguna <strong>{activeUser?.email}</strong>.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reset-new-pass">Password Baru</Label>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordValue(generateSecurePassword());
                    setShowResetPassword(true);
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Buat Otomatis
                </button>
              </div>
              <div className="relative">
                <Input
                  id="reset-new-pass"
                  type={showResetPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="pr-10"
                />
                <PasswordToggleButton
                  visible={showResetPassword}
                  onToggle={() => setShowResetPassword(!showResetPassword)}
                  size="sm"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowResetModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting || !resetPasswordValue.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
                {submitting ? "Mereset..." : "Konfirmasi Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Edit Profil */}
      <Dialog open={showConfirmEditModal} onOpenChange={setShowConfirmEditModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Konfirmasi Perubahan Profil
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 space-y-3">
            <p>
              Apakah Anda yakin ingin menyimpan perubahan pada akun <strong>{activeUser?.name}</strong>?
            </p>
            {activeUser && editForm.email.toLowerCase().trim() !== activeUser.email.toLowerCase().trim() && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Perubahan Alamat Email:</p>
                <p className="font-mono">
                  {activeUser.email} → <strong className="text-blue-700">{editForm.email}</strong>
                </p>
                <p className="text-[11px] text-amber-700">
                  User akan menggunakan email baru ini untuk login berikutnya.
                </p>
              </div>
            )}
            {activeUser && editForm.name.trim() !== activeUser.name.trim() && (
              <p className="text-xs text-slate-500">
                Nama lengkap akan diubah menjadi: <strong>{editForm.name}</strong>
              </p>
            )}
            {activeUser && editForm.role !== activeUser.role && (
              <p className="text-xs text-slate-500">
                Role pengguna akan diubah menjadi: <strong>{editForm.role}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmEditModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={executeEditSubmit}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Ya, Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Reset Password */}
      <Dialog open={showConfirmResetModal} onOpenChange={setShowConfirmResetModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Key className="w-5 h-5 text-amber-600" />
              Konfirmasi Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 space-y-2">
            <p>
              Apakah Anda yakin ingin mengganti password untuk akun <strong>{activeUser?.name}</strong> ({activeUser?.email})?
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Password lama tidak akan dapat digunakan lagi setelah reset dikonfirmasi.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmResetModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={executeResetPassword}
              disabled={submitting}
            >
              {submitting ? "Mereset..." : "Ya, Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Toggle Status */}
      <Dialog open={!!confirmToggleUser} onOpenChange={(open) => !open && setConfirmToggleUser(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${confirmToggleUser?.isActive ? "text-red-600" : "text-emerald-600"}`}>
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Status Akun
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 space-y-2">
            <p>
              Apakah Anda yakin ingin{" "}
              <strong>{confirmToggleUser?.isActive ? "menonaktifkan" : "mengaktifkan kembali"}</strong> akun{" "}
              <strong>{confirmToggleUser?.name}</strong> ({confirmToggleUser?.email})?
            </p>
            {confirmToggleUser?.isActive ? (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                Pengguna yang dinonaktifkan tidak akan dapat masuk (login) ke dalam sistem sampai diaktifkan kembali.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                Pengguna akan dapat masuk kembali ke sistem seperti biasa.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmToggleUser(null)} disabled={submitting}>
              Batal
            </Button>
            <Button
              className={
                confirmToggleUser?.isActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
              onClick={() => confirmToggleUser && executeToggleStatus(confirmToggleUser)}
              disabled={submitting}
            >
              {submitting
                ? "Memproses..."
                : confirmToggleUser?.isActive
                ? "Ya, Nonaktifkan Akun"
                : "Ya, Aktifkan Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Aksi Massal */}
      <Dialog open={bulkConfirmActive !== null} onOpenChange={(open) => !open && setBulkConfirmActive(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${bulkConfirmActive ? "text-emerald-600" : "text-red-600"}`}>
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Aksi Massal
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 space-y-2">
            <p>
              Apakah Anda yakin ingin{" "}
              <strong>{bulkConfirmActive ? "mengaktifkan kembali" : "menonaktifkan"}</strong>{" "}
              <strong>{selectedIds.size} akun</strong> yang dipilih sekaligus?
            </p>
            {bulkConfirmActive === false && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                Semua akun yang dinonaktifkan tidak akan dapat masuk (login) ke dalam sistem sampai diaktifkan kembali.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirmActive(null)} disabled={bulkSubmitting}>
              Batal
            </Button>
            <Button
              className={
                bulkConfirmActive
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={() => bulkConfirmActive !== null && executeBulkToggle(bulkConfirmActive)}
              disabled={bulkSubmitting}
            >
              {bulkSubmitting
                ? "Memproses..."
                : bulkConfirmActive
                ? "Ya, Aktifkan Semua"
                : "Ya, Nonaktifkan Semua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Hapus Akun Pengguna
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600 space-y-2">
            <p>
              Apakah Anda yakin ingin menghapus akun <strong>{activeUser?.name}</strong> ({activeUser?.email})?
            </p>
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            {!!activeUser?._count?.trainings && activeUser._count.trainings > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <strong>{activeUser.name}</strong> sudah membuat{" "}
                <strong>{activeUser._count.trainings} pelatihan</strong>. Setelah akun ini dihapus,
                pelatihan-pelatihan tersebut hanya bisa diedit oleh Super Admin — Sub Admin lain tidak akan
                pernah bisa mengelolanya lagi, karena pembuat aslinya sudah tidak ada.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteSubmit}
              disabled={submitting}
            >
              {submitting ? "Menghapus..." : "Ya, Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
