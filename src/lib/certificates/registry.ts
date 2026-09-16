export type TemplateId = "template-1" | "template-2";

export interface TemplateField {
  key: string;
  label: string;
  required: boolean;
  default: string;
}

export interface TemplateDef {
  id: TemplateId;
  label: string;
  bg: string;
  preview: string;
  qrPosition: string;
  fields: TemplateField[];
}

export const TEMPLATE_REGISTRY: TemplateDef[] = [
  {
    id: "template-1",
    label: "Template 1",
    bg: "/certificate-assets/templates/bg-template.png",
    preview: "/certificate-assets/templates/bg-template.png",
    qrPosition: "Tengah kanan",
    fields: [],
  },
  {
    id: "template-2",
    label: "Template 2",
    bg: "/certificate-assets/templates/template-2/bg-template-2.jpg",
    preview: "/certificate-assets/templates/template-2/bg-template-2.jpg",
    qrPosition: "Pojok kiri bawah",
    fields: [
      {
        key: "signerRightName",
        label: "Nama Penandatangan Kanan",
        required: true,
        default: "",
      },
    ],
  },
];

export function getTemplate(id: string | null | undefined): TemplateDef {
  return (
    TEMPLATE_REGISTRY.find((t) => t.id === id) ?? TEMPLATE_REGISTRY[0]
  );
}

export function parseTemplateData(json: string | null | undefined): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    // abaikan JSON rusak, anggap kosong
  }
  return {};
}

// Validasi field wajib per-template. Return pesan error atau null jika valid.
export function validateTemplateData(
  templateId: string,
  data: Record<string, string | undefined>
): string | null {
  const template = getTemplate(templateId);
  for (const field of template.fields) {
    if (field.required && !(data[field.key] ?? "").trim()) {
      return `${field.label} wajib diisi untuk ${template.label}`;
    }
  }
  return null;
}
