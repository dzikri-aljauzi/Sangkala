"use client";

import React, { useState } from "react";
import { Search, Users, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  createdAt: string | Date;
}

interface ParticipantsSearchProps {
  participants: Participant[];
}

export default function ParticipantsSearch({ participants }: ParticipantsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-petrol-50 text-petrol-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Daftar Penerima Sertifikat</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Total {participants.length} peserta terdaftar dalam sertifikasi kolektif ini
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-800"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-stone-100">
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            {paginated.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-stone-800 truncate">
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                  Terverifikasi
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400 text-sm">
            Tidak ada nama peserta yang cocok dengan pencarian &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 bg-stone-50/30 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} dari {filtered.length} peserta
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-stone-200 rounded-lg hover:bg-white text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-stone-700 px-2">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-stone-200 rounded-lg hover:bg-white text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
