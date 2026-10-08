"use client";

import { motion } from "framer-motion";
import { FileText, FolderOpen, Layers, User, ChevronRight, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Echelon {
  id: string;
  name: string;
  order: number;
}

interface Batch {
  id: string;
  name: string;
  createdAt: string;
}

export interface ResumeItem {
  id: string;
  title?: string;
  fileName?: string;
  filePath?: string;
  category?: string;
  echelonId?: string | null;
  resumeBatch?: { id: string } | null;
}

export function FoldersView({
  umumResumes,
  eselonResumes,
  individuResumes,
  echelons,
  resumes,
  setCurrentView,
  extraSlot,
}: {
  umumResumes: ResumeItem[];
  eselonResumes: ResumeItem[];
  individuResumes: ResumeItem[];
  echelons: Echelon[];
  resumes: ResumeItem[];
  setCurrentView: (v: "umum" | "eselon" | "individu") => void;
  extraSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {extraSlot}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="bg-petrol-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hasil Keseluruhan</h3>
                <p className="text-petrol-100 text-sm">Resume hasil assessment secara umum dan per eselon</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <button
              onClick={() => setCurrentView("umum")}
              className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-petrol-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center group-hover:bg-petrol-200 transition-colors">
                  <FileText className="w-5 h-5 text-petrol-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-stone-900">Secara Umum</p>
                  <p className="text-sm text-stone-500">{umumResumes.length} file</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-petrol-600" />
            </button>

            {echelons.length > 0 && (
              <button
                onClick={() => setCurrentView("eselon")}
                className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-purple-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Layers className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900">Per Eselon</p>
                    <p className="text-sm text-stone-500">{eselonResumes.length} file dalam {echelons.length} eselon</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-600" />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView("individu")}
        >
          <div className="bg-green-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hasil Per Individu</h3>
                <p className="text-green-100 text-sm">Resume hasil per kandidat</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">{individuResumes.length} Resume</p>
                  <p className="text-sm text-stone-500">Resume per kandidat</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-stone-50 rounded-xl p-4">
        <p className="text-sm text-stone-600">
          Total: <span className="font-semibold text-stone-900">{resumes.length}</span> resume tersedia
        </p>
      </div>
    </div>
  );
}

export function BatchListView({
  batches,
  resumes,
  title,
  iconColor,
  icon: Icon,
  goBackToFolders,
  onSelect,
}: {
  batches: Batch[];
  resumes: ResumeItem[];
  title: string;
  iconColor: "blue" | "purple" | "green";
  icon?: LucideIcon;
  goBackToFolders: () => void;
  onSelect: (id: string) => void;
}) {
  const colorClasses = {
    blue: { bg: "bg-petrol-100", text: "text-petrol-600", hover: "hover:bg-petrol-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-200" },
    green: { bg: "bg-green-100", text: "text-green-600", hover: "hover:bg-green-200" },
  };
  const colors = colorClasses[iconColor];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={goBackToFolders} className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
            {Icon ? <Icon className={`w-4 h-4 ${colors.text}`} /> : <FileText className={`w-4 h-4 ${colors.text}`} />}
          </div>
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">Belum ada batch yang tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => {
            const count = resumes.filter((r) => r.resumeBatch?.id === batch.id).length;
            return (
              <motion.button
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelect(batch.id)}
                className="bg-white rounded-xl border border-stone-200 p-6 text-left hover:shadow-lg hover:border-stone-300 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.hover} transition-colors`}>
                    <FolderOpen className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{batch.name}</p>
                    <p className="text-sm text-stone-500">{count} file</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
