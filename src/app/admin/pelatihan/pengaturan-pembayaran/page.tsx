"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes: string | null;
}

const emptySettings: PaymentSettings = {
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  notes: "",
};

export default function PengaturanPembayaranPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "SUPER_ADMIN") {
      toast.error("Hanya Super Admin yang berwenang mengakses Pengaturan Rekening");
      router.push("/admin/pelatihan");
      return;
    }
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/payment-settings");
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...data, notes: data.notes || "" });
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (session?.user?.role !== "SUPER_ADMIN") {
      toast.error("Hanya Super Admin yang berwenang mengubah rekening");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Pengaturan rekening tersimpan");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-petrol-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">Admin Dashboard</p>
                <p className="text-xs text-stone-500">Sangkala</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-700">{session.user?.name}</p>
                <p className="text-xs text-stone-500">
                  {session.user?.email} ({isSuperAdmin ? "Super Admin" : "Sub Admin"})
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <Link
            href="/admin/pelatihan"
            className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Pengaturan Rekening</h1>
            <p className="text-stone-500 mt-1">Info rekening ini ditampilkan di form pendaftaran training berbayar</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-stone-200 p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input
              id="bankName"
              required
              placeholder="Contoh: Bank Mandiri"
              value={formData.bankName}
              onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Nomor Rekening</Label>
            <Input
              id="accountNumber"
              required
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
            <Input
              id="accountHolder"
              required
              placeholder="Contoh: Sangkala Technology"
              value={formData.accountHolder}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Contoh: konfirmasi transfer via WhatsApp 08xx-xxxx-xxxx"
              value={formData.notes || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="bg-petrol-600 hover:bg-petrol-700 text-white">
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
