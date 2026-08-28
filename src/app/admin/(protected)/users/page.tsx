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
  Eye,
  EyeOff,
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

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedAssessment, setSelectedAssessment] = useState("ALL");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeUser, setActiveUser] = useState<UserItem | null>(null);

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
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());
      if (selectedRole !== "ALL") queryParams.set("role", selectedRole);
      if (selectedAssessment !== "ALL") queryParams.set("assessmentId", selectedAssessment);

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      if (res.ok) {
        setUsers(await res.json());
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
  }, [searchQuery, selectedRole, selectedAssessment, router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }
    fetchUsers();
    fetchAssessments();
  }, [session, status, fetchUsers, fetchAssessments, router]);

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success("Profil pengguna berhasil diperbarui");
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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(`Status ${user.name} berhasil diubah ke ${!user.isActive ? "Aktif" : "Nonaktif"}`);
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal mengubah status pengguna");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      toast.error("Gagal mengubah status pengguna");
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
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">Sub Admin</Badge>;
      case "ASESOR":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Asesor</Badge>;
      case "KLIEN":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Klien</Badge>;
      case "STAFF_KLIEN":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Staff Klien</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="pl-10 h-10 rounded-xl text-xs"
          />
        </div>

        {/* Assessment Dropdown Filter */}
        <div className="w-full md:w-72 shrink-0">
          <Select
            value={selectedAssessment}
            onValueChange={(val) => setSelectedAssessment(val)}
          >
            <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 text-xs bg-white">
              <SelectValue placeholder="Semua Proyek Assessment" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 text-xs font-sans max-h-64">
              <SelectItem value="ALL">Semua Proyek Assessment</SelectItem>
              <SelectItem value="NONE">Tanpa Assessment (Global Admin)</SelectItem>
              {assessments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.clientName} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">
            Total Pengguna: <span className="text-blue-600">{users.length}</span>
          </p>
          <Button variant="ghost" size="sm" onClick={fetchUsers} className="gap-1.5 text-xs text-slate-500">
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Tidak ada pengguna yang cocok dengan pencarian / filter yang dipilih.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
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
                const isCurrentSelf = user.id === session?.user?.id;

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/70">
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
                      {getRoleBadge(user.role)}
                    </TableCell>

                    <TableCell className="px-4 py-3.5">
                      {user.assessment ? (
                        <Link
                          href={`/assessment-center/${user.assessment.id}/dashboard`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium group"
                          title={`${user.assessment.clientName} - ${user.assessment.name}`}
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
                      <button
                        onClick={() => !isCurrentSelf && handleToggleStatus(user)}
                        disabled={isCurrentSelf}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        } ${isCurrentSelf ? "cursor-default" : "cursor-pointer"}`}
                        title={isCurrentSelf ? "Tidak bisa menonaktifkan akun sendiri" : "Klik untuk toggle status"}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
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
                      <div className="flex items-center justify-end gap-1.5">
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
              <Label htmlFor="create-password">Password Sementara</Label>
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
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showCreatePassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showCreatePassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
              <div className="space-y-1.5">
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
                    className="w-full h-10 rounded-md border-slate-200 text-sm bg-white"
                  >
                    <SelectValue placeholder="Pilih Proyek Assessment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 text-sm font-sans max-h-60">
                    <SelectItem value="NONE">-- Tidak Terkait Assessment --</SelectItem>
                    {assessments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
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
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profil Pengguna</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Alamat Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Role Pengguna</Label>
              <Select
                value={editForm.role}
                onValueChange={(val) => setEditForm((prev) => ({ ...prev, role: val }))}
              >
                <SelectTrigger id="edit-role" className="w-full h-10 rounded-md border-slate-200 text-sm bg-white">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 text-sm font-sans">
                  <SelectItem value="ADMIN">Sub Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ASESOR">Asesor</SelectItem>
                  <SelectItem value="KLIEN">Klien</SelectItem>
                  <SelectItem value="STAFF_KLIEN">Staff Klien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessment selector in Edit Modal */}
            {(editForm.role === "ASESOR" ||
              editForm.role === "KLIEN" ||
              editForm.role === "STAFF_KLIEN") && (
              <div className="space-y-1.5">
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
                    className="w-full h-10 rounded-md border-slate-200 text-sm bg-white"
                  >
                    <SelectValue placeholder="Pilih Proyek Assessment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 text-sm font-sans max-h-60">
                    <SelectItem value="NONE">-- Tidak Terkait Assessment --</SelectItem>
                    {assessments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
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
              <Label htmlFor="reset-new-pass">Password Baru</Label>
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
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showResetPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showResetPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
