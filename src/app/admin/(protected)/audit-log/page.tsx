"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Filter,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  User as UserIcon,
  Key,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { useDebounce } from "@/hooks/use-debounce";

interface AuditLogUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  changes: string | null;
  createdAt: string;
  user: AuditLogUser;
}

interface SubAdminSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalLogs: number;
  lastActivityAt: string | null;
  trainingsCount: number;
}

const ACTION_OPTIONS = [
  { value: "", label: "Semua Aksi" },
  { value: "CREATE", label: "Pembuatan (Create)" },
  { value: "UPDATE", label: "Pengeditan (Update)" },
  { value: "STATUS_CHANGE", label: "Ubah Status" },
  { value: "PASSWORD_RESET", label: "Reset Password" },
  { value: "REVIEW_PAYMENT", label: "Verifikasi Pembayaran" },
  { value: "DELETE", label: "Penghapusan (Delete)" },
];

export default function AdminAuditLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"all" | "users">("all");

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sub Admins Summary State
  const [subAdmins, setSubAdmins] = useState<SubAdminSummary[]>([]);
  const [loadingSubAdmins, setLoadingSubAdmins] = useState(true);

  // Compare Admins Modal State
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareAdminAId, setCompareAdminAId] = useState("");
  const [compareAdminBId, setCompareAdminBId] = useState("");

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (selectedAction) params.set("action", selectedAction);
      if (selectedUserId) params.set("userId", selectedUserId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotalItems(data.total);
      } else if (res.status === 403) {
        toast.error("Hanya Super Admin yang berwenang mengakses halaman ini");
        router.push("/admin");
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      toast.error("Gagal mengambil log aktivitas");
    } finally {
      setLoadingLogs(false);
    }
  }, [page, pageSize, debouncedSearch, selectedAction, selectedUserId, startDate, endDate, router]);

  const fetchSubAdmins = useCallback(async () => {
    setLoadingSubAdmins(true);
    try {
      const res = await fetch("/api/audit-logs/users-summary");
      if (res.ok) {
        const data = await res.json();
        setSubAdmins(data);
      }
    } catch (err) {
      console.error("Error fetching sub-admins summary:", err);
    } finally {
      setLoadingSubAdmins(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }
    fetchLogs();
    fetchSubAdmins();
  }, [session, status, fetchLogs, fetchSubAdmins, router]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedAction("");
    setSelectedUserId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleSelectSubAdmin = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("all");
    setShowAdvancedFilters(true);
    setPage(1);
  };

  const advancedFiltersCount = (selectedUserId ? 1 : 0) + (startDate || endDate ? 1 : 0);
  const isAnyFilterActive = Boolean(searchQuery || selectedAction || selectedUserId || startDate || endDate);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-status-success-bg text-status-success border-status-success-border">DIBUAT</Badge>;
      case "UPDATE":
        return <Badge className="bg-status-info-bg text-status-info border-status-info-border">DIUBAH</Badge>;
      case "STATUS_CHANGE":
        return <Badge className="bg-status-warning-bg text-status-warning border-status-warning-border">STATUS</Badge>;
      case "PASSWORD_RESET":
        return (
          <Badge className="bg-status-warning-bg text-status-warning border-status-warning-border gap-1 font-medium">
            <Key className="w-3 h-3 text-status-warning" />
            RESET PASS
          </Badge>
        );
      case "REVIEW_PAYMENT":
        return <Badge className="bg-status-purple-bg text-status-purple border-status-purple-border">PEMBAYARAN</Badge>;
      case "DELETE":
        return <Badge className="bg-status-danger-bg text-status-danger border-status-danger-border">DIHAPUS</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "TRAINING":
        return "Info Pelatihan";
      case "PAYMENT_SETTING":
        return "Pengaturan Rekening";
      case "USER":
        return "Manajemen Pengguna";
      case "REGISTRANT":
        return "Pendaftar Pelatihan";
      default:
        return entityType;
    }
  };

  const renderDiffModal = () => {
    if (!selectedLog) return null;
    let diff: Record<string, { old: unknown; new: unknown }> | null = null;
    if (selectedLog.changes) {
      try {
        diff = JSON.parse(selectedLog.changes);
      } catch {
        diff = null;
      }
    }

    return (
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Detail Perubahan Aktivitas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Tipe Aksi & Entitas:</span>
                <div className="flex items-center gap-1.5">
                  {getActionBadge(selectedLog.action)}
                  <span className="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                    {getEntityTypeLabel(selectedLog.entityType)}
                  </span>
                </div>
              </div>
              <p className="font-medium text-slate-900 text-sm mt-1">{selectedLog.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Dilakukan Oleh</span>
                <p className="font-semibold text-slate-800">{selectedLog.user.name}</p>
                <p className="text-slate-500">{selectedLog.user.email}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                  {selectedLog.user.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Waktu Eksekusi</span>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedLog.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-slate-500">
                  Pukul {new Date(selectedLog.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </p>
              </div>
            </div>

            {diff && Object.keys(diff).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Perbandingan Data Sebelum vs Sesudah:</p>
                <div className="space-y-2">
                  {Object.entries(diff).map(([field, val]) => (
                    <div key={field} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {field}
                      </span>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="p-2 rounded bg-red-50/80 border border-red-200/60 text-red-900">
                          <span className="text-[10px] uppercase font-bold text-red-500 block mb-0.5">Sebelumnya:</span>
                          <span className="font-mono break-all">{String(val.old ?? "(kosong)")}</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-50/80 border border-emerald-200/60 text-emerald-900">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">Menjadi:</span>
                          <span className="font-mono break-all font-semibold">{String(val.new ?? "(kosong)")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Tidak ada perubahan nilai field individual yang tercatat.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600" />
            Log Aktivitas & Riwayat Perubahan
          </h1>
          <p className="text-slate-500 mt-1">
            Pantau seluruh aktivitas pembuatan, perubahan data, dan verifikasi oleh Sub Admin
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchLogs} aria-label="Muat ulang log aktivitas" className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh Log
          </Button>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          aria-label={`Tampilkan semua log, total ${totalItems}`}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "all"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          Semua Log ({totalItems})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          aria-label={`Tampilkan log per sub admin, total ${subAdmins.length}`}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Log per Sub Admin ({subAdmins.length})
        </button>
      </div>

      {/* TAB 1: SEMUA LOG (GRID VIEW + PAGINATION + FILTERS) */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Compact Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
            {/* Primary Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <Input
                  type="text"
                  placeholder="Cari aktivitas / user..."
                  aria-label="Cari aktivitas atau user"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 h-9.5 text-xs rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    aria-label="Hapus teks pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action dropdown */}
              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={selectedAction || "ALL"}
                  onValueChange={(val) => {
                    setSelectedAction(val === "ALL" ? "" : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-9.5 rounded-xl border-slate-200 text-xs bg-white">
                    <SelectValue placeholder="Semua Aksi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 text-xs font-sans">
                    <SelectItem value="ALL">Semua Aksi</SelectItem>
                    <SelectItem value="CREATE">Pembuatan (Create)</SelectItem>
                    <SelectItem value="UPDATE">Pengeditan (Update)</SelectItem>
                    <SelectItem value="STATUS_CHANGE">Ubah Status</SelectItem>
                    <SelectItem value="PASSWORD_RESET">Reset Password</SelectItem>
                    <SelectItem value="REVIEW_PAYMENT">Verifikasi Pembayaran</SelectItem>
                    <SelectItem value="DELETE">Penghapusan (Delete)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filter Toggle Button */}
              <Button
                variant={showAdvancedFilters || advancedFiltersCount > 0 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                aria-label="Tampilkan atau sembunyikan filter lanjutan"
                className={`h-9.5 rounded-xl text-xs gap-1.5 shrink-0 ${
                  showAdvancedFilters || advancedFiltersCount > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "text-slate-600"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Lanjutan</span>
                {advancedFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {advancedFiltersCount}
                  </span>
                )}
                {showAdvancedFilters ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>

              {/* Reset Button */}
              {isAnyFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9.5 px-2.5 text-xs text-slate-500 hover:text-slate-800 gap-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              )}
            </div>

            {/* Collapsible Advanced Filters */}
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {/* Sub Admin dropdown */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Pelaku / Sub Admin
                  </label>
                  <Select
                    value={selectedUserId || "ALL"}
                    onValueChange={(val) => {
                      setSelectedUserId(val === "ALL" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full h-9 rounded-lg border-slate-200 text-xs bg-white">
                      <SelectValue placeholder="Semua Pelaku / User" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 text-xs font-sans max-h-60">
                      <SelectItem value="ALL">Semua Pelaku / User</SelectItem>
                      {subAdmins.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date pickers */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Rentang Waktu (Dari - Sampai)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 text-xs rounded-lg"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active filter pills */}
            {isAnyFilterActive && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-slate-400">Filter:</span>
                {searchQuery && (
                  <Badge variant="outline" className="bg-slate-50 text-[11px]">
                    &quot;{searchQuery}&quot;
                  </Badge>
                )}
                {selectedAction && (
                  <Badge variant="outline" className="bg-slate-50 text-[11px]">
                    Aksi: {selectedAction}
                  </Badge>
                )}
                {selectedUserId && (
                  <Badge variant="outline" className="bg-slate-50 text-[11px]">
                    User: {subAdmins.find((u) => u.id === selectedUserId)?.name || selectedUserId}
                  </Badge>
                )}
                {(startDate || endDate) && (
                  <Badge variant="outline" className="bg-slate-50 text-[11px]">
                    Tanggal: {startDate || "Awal"} s/d {endDate || "Sekarang"}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Total Counter Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Ditemukan <strong className="text-slate-800 font-semibold">{totalItems}</strong> catatan aktivitas
            </p>
          </div>

          {/* Logs Table View */}
          {loadingLogs ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              <span className="sr-only">Memuat data log aktivitas...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400 space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm">Tidak ada catatan log yang sesuai dengan filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5 w-44">Waktu</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5 w-48">Pelaku / User</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5 w-36">Aksi</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5 w-40">Modul</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5">Ringkasan Aktivitas</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs px-4 py-3.5 text-right w-24">Snapshot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const hasDiff = !!log.changes && log.changes !== "{}" && log.changes !== "null";
                      return (
                        <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="px-4 py-3 text-xs text-slate-600">
                            <div>
                              <p className="font-medium text-slate-800">
                                {new Date(log.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}{" "}
                                WIB
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {log.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate">{log.user.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {log.user.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs">
                            {getActionBadge(log.action)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs">
                            <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {getEntityTypeLabel(log.entityType)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-slate-900 font-medium leading-relaxed">
                            {log.summary}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-right">
                            {hasDiff ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                                aria-label={`Lihat detail snapshot log ${log.summary}`}
                                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detail</span>
                              </Button>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Bar */}
              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  {/* Left: Summary text with bigger font */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-600 font-medium">
                      Menampilkan <strong className="text-slate-900 font-semibold">{Math.min(totalItems, (page - 1) * pageSize + 1)}</strong> -{" "}
                      <strong className="text-slate-900 font-semibold">{Math.min(totalItems, page * pageSize)}</strong> dari{" "}
                      <strong className="text-slate-900 font-semibold">{totalItems}</strong> log aktivitas
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
                        aria-label="Pilih jumlah baris per halaman"
                        className="bg-white border border-slate-200 text-sm font-medium text-slate-800 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
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
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOG PER SUB ADMIN */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Aktivitas Sub Admin & Administrator</p>
                <p className="text-xs text-slate-500">
                  Pilih Sub Admin untuk melihat riwayat log aktivitas atau bandingkan kinerja dua admin secara berdampingan
                </p>
              </div>
            </div>
            {subAdmins.length >= 2 && (
              <Button
                onClick={() => {
                  setCompareAdminAId(subAdmins[0]?.id || "");
                  setCompareAdminBId(subAdmins[1]?.id || "");
                  setShowCompareModal(true);
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs text-xs shrink-0 self-start sm:self-auto"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Bandingkan 2 Admin
              </Button>
            )}
          </div>

          {loadingSubAdmins ? (
            <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              <span className="sr-only">Memuat data aktivitas Sub Admin...</span>
            </div>
          ) : subAdmins.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
              Belum ada data Sub Admin yang terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subAdmins.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">{user.name}</h3>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <Badge
                        className={`shrink-0 ${user.role === "SUPER_ADMIN" ? "bg-status-purple-bg text-status-purple border-status-purple-border" : "bg-status-info-bg text-status-info border-status-info-border"}`}
                      >
                        {user.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                      </Badge>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">Pelatihan Dibuat</span>
                        <span className="text-base font-bold text-blue-600">{user.trainingsCount}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[11px] text-slate-500 block">Total Aksi / Log</span>
                        <span className="text-base font-bold text-slate-800">{user.totalLogs}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Aktivitas terakhir:{" "}
                        <strong>
                          {user.lastActivityAt
                            ? new Date(user.lastActivityAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Belum ada aktivitas"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectSubAdmin(user.id)}
                    className="w-full gap-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <span>Lihat Riwayat Aktivitas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Komparasi 2 Admin Berdampingan */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              Perbandingan Aktivitas Dua Admin
            </DialogTitle>
          </DialogHeader>

          {/* Selector Row */}
          <div className="flex flex-row items-end gap-3 pt-2">
            <div className="flex-1 space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">Pilih Admin 1</label>
              <Select value={compareAdminAId} onValueChange={setCompareAdminAId}>
                <SelectTrigger className="w-full h-10 bg-white border-slate-200 rounded-xl text-sm truncate">
                  <SelectValue placeholder="Pilih Admin 1" />
                </SelectTrigger>
                <SelectContent>
                  {subAdmins.map((u) => (
                    <SelectItem key={u.id} value={u.id} disabled={u.id === compareAdminBId}>
                      {u.name} ({u.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center pb-0.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const temp = compareAdminAId;
                  setCompareAdminAId(compareAdminBId);
                  setCompareAdminBId(temp);
                }}
                aria-label="Tukar posisi admin yang dibandingkan"
                className="h-10 w-10 p-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all shrink-0"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">Pilih Admin 2</label>
              <Select value={compareAdminBId} onValueChange={setCompareAdminBId}>
                <SelectTrigger className="w-full h-10 bg-white border-slate-200 rounded-xl text-sm truncate">
                  <SelectValue placeholder="Pilih Admin 2" />
                </SelectTrigger>
                <SelectContent>
                  {subAdmins.map((u) => (
                    <SelectItem key={u.id} value={u.id} disabled={u.id === compareAdminAId}>
                      {u.name} ({u.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Details Side-by-Side */}
          {(() => {
            const adminA = subAdmins.find((u) => u.id === compareAdminAId);
            const adminB = subAdmins.find((u) => u.id === compareAdminBId);

            if (!adminA || !adminB) {
              return (
                <div className="py-8 text-center text-sm text-slate-500">
                  Silakan pilih dua admin yang ingin Anda bandingkan di atas.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                {/* Admin A Card */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {adminA.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{adminA.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{adminA.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge className={adminA.role === "SUPER_ADMIN" ? "bg-status-purple-bg text-status-purple border-status-purple-border text-[10px]" : "bg-status-info-bg text-status-info border-status-info-border text-[10px]"}>
                            {adminA.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                          </Badge>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${adminA.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                            {adminA.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Pelatihan Dibuat:</span>
                        <span className="font-bold text-sm text-blue-600">{adminA.trainingsCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Total Log / Aksi:</span>
                        <span className="font-bold text-sm text-slate-800">{adminA.totalLogs}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Aktivitas Terakhir:</span>
                        <span className="font-medium text-slate-800 text-right">
                          {adminA.lastActivityAt
                            ? new Date(adminA.lastActivityAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Bergabung Sejak:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(adminA.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setShowCompareModal(false);
                      handleSelectSubAdmin(adminA.id);
                    }}
                    className="w-full mt-3 h-10 gap-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-xs"
                  >
                    <span className="truncate">Lihat Log {adminA.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>
                </div>

                {/* Admin B Card */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {adminB.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{adminB.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{adminB.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge className={adminB.role === "SUPER_ADMIN" ? "bg-status-purple-bg text-status-purple border-status-purple-border text-[10px]" : "bg-status-info-bg text-status-info border-status-info-border text-[10px]"}>
                            {adminB.role === "SUPER_ADMIN" ? "Super Admin" : "Sub Admin"}
                          </Badge>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${adminB.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                            {adminB.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Pelatihan Dibuat:</span>
                        <span className="font-bold text-sm text-blue-600">{adminB.trainingsCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Total Log / Aksi:</span>
                        <span className="font-bold text-sm text-slate-800">{adminB.totalLogs}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Aktivitas Terakhir:</span>
                        <span className="font-medium text-slate-800 text-right">
                          {adminB.lastActivityAt
                            ? new Date(adminB.lastActivityAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium">Bergabung Sejak:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(adminB.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setShowCompareModal(false);
                      handleSelectSubAdmin(adminB.id);
                    }}
                    className="w-full mt-3 h-10 gap-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-xs"
                  >
                    <span className="truncate">Lihat Log {adminB.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Render Detail Changes Modal */}
      {renderDiffModal()}
    </div>
  );
}
