"use client";

import React, { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkUploadCardProps {
  onImport: (names: string[]) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export default function BulkUploadCard({
  onImport,
  onError,
  onSuccess,
}: BulkUploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processExcelFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      onError("Format berkas harus berupa Excel (.xlsx, .xls) atau CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (json.length === 0) {
          onError("File Excel kosong");
          return;
        }

        // Find best column matching name
        const keys = Object.keys(json[0]);
        const nameKey = keys.find(
          (k) =>
            k.toLowerCase().includes("nama") ||
            k.toLowerCase().includes("name") ||
            k.toLowerCase().includes("peserta")
        ) || keys[0];

        const names: string[] = json
          .map((row) => String(row[nameKey] || "").trim())
          .filter((name) => name.length > 0);

        if (names.length === 0) {
          onError("Tidak dapat membaca nama peserta dari berkas");
          return;
        }

        onImport(names);
        onSuccess(`Berhasil mengimpor ${names.length} peserta dari ${file.name}`);
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
    e.target.value = ""; // Reset file input
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        Bulk Upload Peserta
      </h3>
      <p className="text-xs text-stone-500">
        Unggah berkas Excel (.xlsx, .xls) atau CSV untuk mengekstrak nama peserta secara massal.
      </p>

      {/* Drag and Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          dragOver
            ? "border-petrol-500 bg-petrol-50/50"
            : "border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-stone-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleExcelUpload}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />
        <Upload className="w-8 h-8 text-stone-400" />
        <span className="text-xs font-semibold text-stone-700">Pilih berkas atau tarik ke sini</span>
        <span className="text-[10px] text-stone-400">Kolom dibaca: Nama, Name, Nama Lengkap</span>
      </div>

      {/* Download Template Button */}
      <a
        href="/template-excel/template-bulk-nama-peserta.xlsx"
        download
        className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors border border-stone-200"
      >
        <Download className="w-3.5 h-3.5" />
        Unduh Template Excel Peserta
      </a>
    </div>
  );
}
