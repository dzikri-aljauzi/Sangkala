"use client";

import React, { useState } from "react";
import { Users, UserPlus, X } from "lucide-react";

interface ParticipantListCardProps {
  participants: string[];
  onAdd: (name: string) => void;
  onRemove: (idx: number) => void;
  onClearAll: () => void;
}

export default function ParticipantListCard({
  participants,
  onAdd,
  onRemove,
  onClearAll,
}: ParticipantListCardProps) {
  const [manualParticipantName, setManualParticipantName] = useState("");

  const handleAdd = () => {
    const trimmed = manualParticipantName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setManualParticipantName("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Peserta ({participants.length})
        </h3>
        {participants.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Manual entry */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nama lengkap peserta..."
          value={manualParticipantName}
          onChange={(e) => setManualParticipantName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center"
          title="Tambah Manual"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* List container */}
      <div className="flex-1 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50 min-h-[150px]">
        {participants.length > 0 ? (
          participants.map((name, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs text-slate-800 shadow-sm hover:border-slate-200 transition-all group"
            >
              <span className="font-medium truncate max-w-[180px]">{name}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
                title="Hapus"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic py-8">
            Belum ada peserta
          </div>
        )}
      </div>
    </div>
  );
}
