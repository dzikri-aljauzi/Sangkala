"use client";

import React from "react";
import { LayoutTemplate } from "lucide-react";
import { TEMPLATE_REGISTRY, TemplateId, getTemplate } from "@/lib/certificates/registry";

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  fields: Record<string, string>;
  onFieldChange: (key: string, val: string) => void;
}

export default function TemplatePicker({ value, onChange, fields, onFieldChange }: TemplatePickerProps) {
  const active = getTemplate(value);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-petrol-600" />
        Template Sertifikat
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATE_REGISTRY.map((t) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                selected
                  ? "border-petrol-600 ring-2 ring-petrol-500/20"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="aspect-[1.414/1] bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.preview} alt={t.label} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-stone-900">
                  {t.label}
                  {selected && <span className="ml-2 text-xs font-semibold text-petrol-600">Dipilih</span>}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">QR: {t.qrPosition}</p>
              </div>
            </button>
          );
        })}
      </div>

      {active.fields.length > 0 && (
        <div className="space-y-4 pt-2">
          {active.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                {f.label} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required={f.required}
                value={fields[f.key] ?? ""}
                onChange={(e) => onFieldChange(f.key, e.target.value)}
                placeholder={`Contoh: Nama Lengkap, Gelar`}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500/20 focus:border-petrol-500 transition-all text-stone-900 placeholder-stone-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
