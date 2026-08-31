"use client";

import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Check, X, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportRecord {
  bsmrId: string;
  name: string;
  institution: string;
  level: string;
  certificationName: string;
  email: string;
  examDate: string;
  expiryDate: string;
  refreshment1Date: string;
  refreshment2Date: string;
}

interface CertificationBulkUploadCardProps {
  onImport: (records: ImportRecord[]) => void;
  onError: (msg: string) => void;
  importing: boolean;
}

// Header persis dari Sampel Data J7.xlsx -- strict mapping, bukan fuzzy, karena
// data ini 10 kolom terstruktur (bukan 1 kolom nama bebas seperti BulkUploadCard).
const COLUMN_MAP: Record<string, keyof ImportRecord> = {
  "ID BSMR": "bsmrId",
  "Nama": "name",
  "Instansi": "institution",
  "Jenjang Terakhir": "level",
  "Tanggal Ujian": "examDate",
  "Masa Berakhir": "expiryDate",
  "Jadwal Terakhir Refreshment Thn Pertama": "refreshment1Date",
  "Jadwal Terakhir Refreshment Thn Kedua": "refreshment2Date",
  "Email": "email",
  "Sertifikasi yang Diambil": "certificationName",
};

const REQUIRED_HEADERS = Object.keys(COLUMN_MAP);
const DATE_FIELDS: (keyof ImportRecord)[] = ["examDate", "expiryDate", "refreshment1Date", "refreshment2Date"];

export default function CertificationBulkUploadCard({
  onImport,
  onError,
  importing,
}: CertificationBulkUploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<ImportRecord[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processExcelFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      onError("Format berkas harus berupa Excel (.xlsx, .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        // cellDates WAJIB di sini (saat XLSX.read), bukan di sheet_to_json --
        // kalau kelewat, semua kolom tanggal balik jadi angka serial mentah.
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null });

        if (rows.length === 0) {
          onError("File Excel kosong");
          return;
        }

        const headers = Object.keys(rows[0]);
        const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
        if (missingHeaders.length > 0) {
          onError(`Kolom berikut tidak ditemukan di file: ${missingHeaders.join(", ")}`);
          return;
        }

        const records: ImportRecord[] = rows.map((row) => {
          const record: Partial<ImportRecord> = {};
          for (const [header, field] of Object.entries(COLUMN_MAP)) {
            const value = row[header];
            if (DATE_FIELDS.includes(field)) {
              record[field] = value instanceof Date ? value.toISOString() : "";
            } else {
              record[field] = value !== null && value !== undefined ? String(value).trim() : "";
            }
          }
          return record as ImportRecord;
        });

        // Preview dulu sebelum commit -- sebelumnya file yang di-drop langsung
        // upsert ke data live tanpa konfirmasi, jadi file salah/basi bisa
        // menimpa data existing tanpa disadari.
        setPendingRecords(records);
      } catch (err) {
        console.error("Error reading excel:", err);
        onError("Gagal memproses file Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processExcelFile(files[0]);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processExcelFile(files[0]);
    }
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  if (pendingRecords) {
    const previewNames = pendingRecords.slice(0, 5);
    const remaining = pendingRecords.length - previewNames.length;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            {pendingRecords.length} baris siap diimport
          </p>
          <ul className="mt-2 space-y-1">
            {previewNames.map((record, i) => (
              <li key={i} className="text-xs text-slate-500 truncate">
                {record.name || "(nama kosong)"} — {record.bsmrId || "(ID BSMR kosong)"}
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <p className="mt-1 text-xs text-slate-400">+{remaining} baris lainnya</p>
          )}
          <p className="mt-3 text-[10px] text-slate-400">
            Data dengan ID BSMR yang sudah terdaftar akan diperbarui (bukan diduplikasi).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPendingRecords(null)}
            disabled={importing}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onImport(pendingRecords);
              setPendingRecords(null);
            }}
            disabled={importing}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {importing ? "Mengimport..." : "Konfirmasi Import"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Unggah berkas Excel (.xlsx, .xls) dengan kolom sesuai template untuk menambahkan banyak data sekaligus.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleDropZoneKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Pilih atau tarik berkas Excel untuk diimport"
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          dragOver
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleExcelUpload}
          accept=".xlsx,.xls"
          className="hidden"
        />
        <Upload className="w-8 h-8 text-slate-400" />
        <span className="text-xs font-semibold text-slate-700">Pilih berkas atau tarik ke sini</span>
        <span className="text-[10px] text-slate-400">Gunakan template resmi supaya kolom terbaca benar</span>
      </div>

      <a
        href="/template-excel/template-reminder-sertifikat.xlsx"
        download
        className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200"
      >
        <Download className="w-3.5 h-3.5" />
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Unduh Template Excel
      </a>
    </div>
  );
}
