"use client";

import React, { useState } from "react";
import {
  Award,
  Building,
  User,
  Search,
  Pencil,
  Eye,
  Users,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export interface Certificate {
  id: string;
  certCode: string;
  type: string;
  recipientName: string;
  programName: string;
  description: string;
  maturityLevel: string | null;
  issuedDate: string;
  qrCodeData: string | null;
  pdfPath: string | null;
  verifyHash: string;
  createdAt: string;
  template?: string | null;
  templateData?: string | null;
  _count?: {
    participants: number;
  };
}

interface CertificateTableProps {
  certificates: Certificate[];
  loading: boolean;
  onEdit: (cert: Certificate) => void;
  onManage: (cert: { id: string; name: string }) => void;
  onDelete: (id: string, code: string) => void;
}

export default function CertificateTable({
  certificates,
  loading,
  onEdit,
  onManage,
  onDelete,
}: CertificateTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INDIVIDU" | "INSTANSI">("ALL");

  // Filter logic
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.programName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "ALL" || cert.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalCertificates = certificates.length;
  const instansiCount = certificates.filter((c) => c.type === "INSTANSI").length;
  const individuCount = certificates.filter((c) => c.type === "INDIVIDU").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-petrol-50 text-petrol-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Sertifikat</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{totalCertificates}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-petrol-50 text-petrol-600 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Sertifikat Instansi</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{instansiCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Sertifikat Individu</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{individuCount}</p>
          </div>
        </div>
      </div>

      {/* List Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
          <input
            type="text"
            placeholder="Cari kode, nama instansi atau program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-stone-200 bg-white p-1.5 rounded-xl border max-w-md">
        <button
          type="button"
          onClick={() => setFilterType("ALL")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            filterType === "ALL"
              ? "bg-petrol-600 text-white shadow-sm"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Award className="w-4 h-4" />
          Semua
        </button>
        <button
          type="button"
          onClick={() => setFilterType("INSTANSI")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            filterType === "INSTANSI"
              ? "bg-petrol-600 text-white shadow-sm"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Building className="w-4 h-4" />
          Instansi
        </button>
        <button
          type="button"
          onClick={() => setFilterType("INDIVIDU")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            filterType === "INDIVIDU"
              ? "bg-petrol-600 text-white shadow-sm"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <User className="w-4 h-4" />
          Individu
        </button>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                <th className="px-6 py-4">Kode Sertifikat</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Penerima</th>
                <th className="px-6 py-4">Program Sertifikasi</th>
                <th className="px-6 py-4">Peserta Kolektif</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-petrol-600">
                      {cert.certCode}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          cert.type === "INSTANSI"
                            ? "bg-petrol-50 text-petrol-700 border-petrol-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {cert.type === "INSTANSI" ? (
                          <>
                            <Building className="w-3 h-3" />
                            Instansi
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Individu
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900">{cert.recipientName}</span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{cert.programName}</td>
                    <td className="px-6 py-4">
                      {cert.type === "INSTANSI" ? (
                        <button
                          onClick={() => onManage({ id: cert.id, name: cert.recipientName })}
                          className="font-semibold text-stone-900 hover:text-petrol-600 transition-colors underline underline-offset-2 decoration-stone-300 hover:decoration-petrol-400"
                        >
                          {cert._count?.participants || 0} Orang
                        </button>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(cert)}
                          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-stone-200"
                          title="Edit Sertifikat"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/sertifikat/${cert.id}/preview`}
                          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-petrol-600 hover:bg-petrol-50 rounded-lg transition-colors border border-stone-200"
                          title="Lihat Pratinjau Sertifikat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {cert.type === "INSTANSI" && (
                          <button
                            onClick={() => onManage({ id: cert.id, name: cert.recipientName })}
                            className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-petrol-600 hover:bg-petrol-50 rounded-lg transition-colors border border-stone-200"
                            title="Kelola Peserta"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        )}
                        {cert.pdfPath && (
                          <a
                            href={cert.pdfPath}
                            download
                            className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200"
                            title="Unduh Sertifikat PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onDelete(cert.id, cert.certCode)}
                          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-stone-200"
                          title="Hapus Sertifikat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                    {loading ? "Memuat sertifikat..." : "Tidak ada sertifikat yang ditemukan"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
