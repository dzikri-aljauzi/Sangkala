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
  const [pageSize] = useState(12);
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
        return <Badge className="bg-emerald-100 text-emerald-800 border-transparent">DIBUAT</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-100 text-blue-800 border-transparent">DIUBAH</Badge>;
      case "STATUS_CHANGE":
        return <Badge className="bg-amber-100 text-amber-800 border-transparent">STATUS</Badge>;
      case "PASSWORD_RESET":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 gap-1 font-medium">
            <Key className="w-3 h-3 text-amber-700" />
            RESET PASS
          </Badge>
        );
      case "REVIEW_PAYMENT":
        return <Badge className="bg-purple-100 text-purple-800 border-transparent">PEMBAYARAN</Badge>;
      case "DELETE":
        return <Badge variant="destructive">DIHAPUS</Badge>;
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
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh Log
          </Button>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
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
            <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500">
                Menampilkan halaman <strong className="text-slate-800">{page}</strong> dari{" "}
                <strong className="text-slate-800">{totalPages}</strong> (Total {totalItems} log)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-8 gap-1 text-xs"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOG PER SUB ADMIN */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Aktivitas Sub Admin & Administrator</p>
                <p className="text-xs text-slate-500">
                  Pilih Sub Admin untuk melihat riwayat log aktivitas yang dilakukan secara spesifik
                </p>
              </div>
            </div>
          </div>

          {loadingSubAdmins ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
                        className={`shrink-0 ${user.role === "SUPER_ADMIN" ? "bg-indigo-100 text-indigo-800" : "bg-sky-100 text-sky-800"}`}
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

      {/* Render Detail Changes Modal */}
      {renderDiffModal()}
    </div>
  );
}
