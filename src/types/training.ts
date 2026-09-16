// Sebelumnya interface ini didefinisikan ulang beda-beda di 4 file
// (info-pelatihan/page.tsx, info-pelatihan/[id]/page.tsx,
// admin/pelatihan/page.tsx, admin/pelatihan/[id]/page.tsx) — satu sumber
// kebenaran di sini, dipakai bareng oleh halaman publik & admin.
export interface Training {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  price: string | null;
  description: string;
  imagePath: string | null;
  qrCodeData: string | null;
  isActive: boolean;
  requiresPayment: boolean;
  capacity: number | null;
  createdById?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export interface TrainingWithCount extends Training {
  _count: { registrants: number };
}

