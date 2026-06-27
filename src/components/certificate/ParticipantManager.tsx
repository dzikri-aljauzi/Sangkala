"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Pencil,
  Upload,
  Download,
  UserPlus,
  Users,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Participant {
  id: string;
  name: string;
  createdAt: string;
}

interface ParticipantManagerProps {
  certificateId: string;
  recipientName: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ParticipantManager({
  certificateId,
  recipientName,
  onClose,
  onUpdate,
}: ParticipantManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Add participant
  const [newName, setNewName] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Excel upload
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/certificates/${certificateId}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [certificateId]);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add participant
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    try {
      const res = await fetch(`/api/certificates/${certificateId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setNewName("");
        showToast("success", "Peserta berhasil ditambahkan");
        await fetchParticipants();
        onUpdate();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Gagal menambahkan peserta");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    }
  };

  // Delete participant
  const handleDelete = async (participantId: string, name: string) => {
    if (!confirm(`Hapus peserta "${name}"?`)) return;

    try {
      const res = await fetch(
        `/api/certificates/${certificateId}/participants?participantId=${participantId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showToast("success", "Peserta berhasil dihapus");
        await fetchParticipants();
        onUpdate();
      } else {
        showToast("error", "Gagal menghapus peserta");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    }
  };

  // Edit participant
  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditValue(p.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (participantId: string) => {
    const name = editValue.trim();
    if (!name) return;

    try {
      const res = await fetch(`/api/certificates/${certificateId}/participants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, name }),
      });
      if (res.ok) {
        showToast("success", "Nama peserta berhasil diubah");
        setEditingId(null);
        await fetchParticipants();
        onUpdate();
      } else {
        showToast("error", "Gagal mengubah nama peserta");
      }
    } catch {
      showToast("error", "Terjadi kesalahan");
    }
  };

  // Excel upload
  const processExcelFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      showToast("error", "Format harus Excel (.xlsx, .xls) atau CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (json.length === 0) {
          showToast("error", "File Excel kosong");
          return;
        }

        const keys = Object.keys(json[0]);
        const nameKey =
          keys.find(
            (k) =>
              k.toLowerCase().includes("nama") ||
              k.toLowerCase().includes("name") ||
              k.toLowerCase().includes("peserta")
          ) || keys[0];

        const names: string[] = json
          .map((row) => String(row[nameKey] || "").trim())
          .filter((n) => n.length > 0);

        if (names.length === 0) {
          showToast("error", "Tidak dapat membaca nama dari file");
          return;
        }

        let added = 0;
        for (const name of names) {
          const res = await fetch(`/api/certificates/${certificateId}/participants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          if (res.ok) added++;
        }

        showToast("success", `Berhasil menambahkan ${added} peserta`);
        await fetchParticipants();
        onUpdate();
      } catch {
        showToast("error", "Gagal memproses file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processExcelFile(files[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-white text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Peserta</h2>
            <p className="text-sm text-slate-500 mt-0.5">{recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          {/* Participant list */}
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Memuat peserta...</div>
          ) : filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 group"
                >
                  {editingId === p.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(p.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(p.id)}
                        className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Simpan"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                        {p.name}
                      </span>
                      <button
                        onClick={() => startEdit(p)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Ubah Nama"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              {searchTerm
                ? `Tidak ada peserta yang cocok dengan "${searchTerm}"`
                : "Belum ada peserta"}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            {/* Manual add */}
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="Nama lengkap peserta..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Tambah
              </button>
            </form>

            {/* Excel upload */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
                dragOver
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) processExcelFile(files[0]);
                  e.target.value = "";
                }}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Upload Excel untuk menambah banyak peserta
              </span>
              <span className="text-[10px] text-slate-400">
                Format: Kolom Nama / Name / Nama Lengkap
              </span>
            </div>

            {/* Download template */}
            <a
              href="/template-excel/template-bulk-nama-peserta.xlsx"
              download
              className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template Excel
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl shrink-0">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{participants.length}</span> peserta
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
