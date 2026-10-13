"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

  const filtered = participants.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="mt-14" aria-labelledby="penerima">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="penerima" className="type-card">Daftar Penerima Sertifikat</h2>
          <p className="mt-1 text-sm text-stone-700">
            Total {participants.length} peserta terdaftar dalam sertifikasi kolektif ini
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600" />
          <input
            type="search"
            aria-label="Cari nama peserta"
            placeholder="Cari nama peserta..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm text-ink outline-none placeholder:text-stone-500 focus-visible:border-petrol-600 focus-visible:ring-2 focus-visible:ring-petrol-600/30"
          />
        </div>
      </div>

      {paginated.length > 0 ? (
        <ul className="border-t border-ink md:grid md:grid-cols-2 md:gap-x-10">
          {paginated.map((p, idx) => (
            <li key={p.id || idx} className="flex items-center justify-between gap-4 border-b border-stone-200 py-3.5">
              <span className="truncate text-[0.9375rem] font-medium text-ink">{p.name}</span>
              <span className="type-meta shrink-0 !tracking-normal text-petrol-600">✓ Terverifikasi</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-ink py-10 text-sm text-stone-700">
          Tidak ada nama peserta yang cocok dengan pencarian &quot;{searchTerm}&quot;
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-stone-700">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} dari {filtered.length} peserta
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-stone-200 p-2 text-ink transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <span className="px-2 text-sm font-medium text-ink">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              type="button"
              aria-label="Halaman berikutnya"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-stone-200 p-2 text-ink transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
