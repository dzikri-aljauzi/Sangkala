"use client";

import React from "react";
import { FileText, Calendar, Award } from "lucide-react";

interface CertificateFormProps {
  type: "INDIVIDU" | "INSTANSI";
  view: "create" | "edit";
  certCode: string;
  setCertCode: (val: string) => void;
  recipientName: string;
  setRecipientName: (val: string) => void;
  programName: string;
  setProgramName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  issuedDate: string;
  setIssuedDate: (val: string) => void;
  submitLoading: boolean;
}

export default function CertificateForm({
  type,
  view,
  certCode,
  setCertCode,
  recipientName,
  setRecipientName,
  programName,
  setProgramName,
  description,
  setDescription,
  issuedDate,
  setIssuedDate,
  submitLoading,
}: CertificateFormProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-petrol-600" />
        {view === "edit"
          ? "Edit Sertifikat"
          : `Informasi Utama Sertifikat (${
              type === "INDIVIDU" ? "Individu" : "Kolektif Instansi"
            })`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
            Kode Sertifikat <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: SKL/CERT/ERM31K/2026/001"
            required
            value={certCode}
            onChange={(e) => setCertCode(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
            {type === "INSTANSI" ? "Nama Instansi / Penerima Utama" : "Nama Lengkap Penerima"}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder={
              type === "INSTANSI"
                ? "Contoh: Badan Karantina Indonesia"
                : "Contoh: Ahmad Syahrial, MBA"
            }
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
          Program Sertifikasi <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Contoh: Program Sertifikasi Asesmen Kompetensi Eksekutif"
          required
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
          Deskripsi / Ruang Lingkup Program <span className="text-rose-500">*</span>
        </label>
        <textarea
          placeholder="Contoh: Tingkat Kematangan Manajemen Risiko Indeks ERM-31000"
          required
          rows={3}
          value={description}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[\r\n]+/g, " ");
            setDescription(cleaned);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-stone-400" />
            Tanggal Terbit <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
          />
        </div>
      </div>

      {/* Submit Button inside main card if Individu or Edit mode */}
      {(type === "INDIVIDU" || view === "edit") && (
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 bg-petrol-600 hover:bg-petrol-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {submitLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Memproses & Menggambar PDF...
            </>
          ) : (
            <>
              <Award className="w-4 h-4" />
              {view === "edit" ? "Simpan Perubahan" : "Terbitkan"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
