"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Landmark,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoogleTranslateWidget from "@/components/google-translate/GoogleTranslateWidget";
import { formatRupiah, formatTrainingDateRange } from "@/lib/utils";
import type { Training as BaseTraining } from "@/types/training";

interface Training extends BaseTraining {
  activeRegistrantsCount: number;
}

interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes: string | null;
}

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `/api/public/images${path}`;
  return path;
};

export default function DetailPelatihanPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Payment state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentProofPath, setPaymentProofPath] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/trainings/${id}`);
        if (res.ok) {
          const data: Training = await res.json();
          setTraining(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading training detail:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!training?.requiresPayment || paymentSettings) return;
    async function fetchPaymentSettings() {
      try {
        const res = await fetch("/api/payment-settings");
        if (res.ok) {
          setPaymentSettings(await res.json());
        }
      } catch (err) {
        console.error("Error loading payment settings:", err);
      }
    }
    fetchPaymentSettings();
  }, [training?.requiresPayment, paymentSettings]);

  const locale = language === "en" ? "en-US" : "id-ID";

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload/payment-proof", {
        method: "POST",
        body: formDataUpload,
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentProofPath(data.filePath);
      } else {
        const data: { error?: string } = await res.json();
        setSubmitError(data.error || t("registrationModal.errorMsg"));
      }
    } catch (err) {
      console.error("Error uploading payment proof:", err);
      setSubmitError(t("registrationModal.errorMsg"));
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (training?.requiresPayment && !paymentProofPath) {
      setSubmitError(t("registrationModal.proofRequiredError"));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/trainings/${id}/registrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, paymentProofPath }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", phone: "", institution: "" });
        setPaymentProofPath("");
      } else {
        const data: { error?: string } = await res.json();
        setSubmitError(data.error || t("registrationModal.errorMsg"));
      }
    } catch (err) {
      console.error("Registration submit error:", err);
      setSubmitError(t("registrationModal.errorMsg"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetModalState = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setPaymentProofPath("");
  };

  if (loading) {
    return (
      <Section variant="gradient" padding="xl" className="pt-32 sm:pt-36 min-h-screen">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Section>
    );
  }

  if (error || !training) {
    return (
      <Section variant="gradient" padding="xl" className="pt-32 sm:pt-36 min-h-screen">
        <div className="max-w-4xl mx-auto text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
          <p className="mb-4">{t("trainingDetail.notFound")}</p>
          <Link
            href="/info-pelatihan"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("trainingDetail.back")}
          </Link>
        </div>
      </Section>
    );
  }

  const date = new Date(training.startDate);
  const day = date.toLocaleDateString(locale, { day: "2-digit" });
  const month = date.toLocaleDateString(locale, { month: "short" });
  const year = date.getFullYear();

  const slotsLeft = training.capacity !== null ? training.capacity - training.activeRegistrantsCount : null;
  const isFull = slotsLeft !== null && slotsLeft <= 0;

  return (
    <Section variant="gradient" padding="xl" className="pt-32 sm:pt-36">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/info-pelatihan"
          className="notranslate inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t("trainingDetail.back")}
        </Link>

        {/* Centered title */}
        <div className="text-center space-y-3 pt-2">
          <p className="notranslate text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            {t("trainingDetail.program")}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            {training.title}
          </h1>
          <div className="notranslate flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {training.location}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatTrainingDateRange(training.startDate, training.endDate, locale)}
            </span>
          </div>
        </div>

        {/* Poster Banner (Full Width / Natural Aspect Ratio) */}
        {training.imagePath ? (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 w-full bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(training.imagePath) ?? ""}
              alt={training.title}
              className="w-full h-auto block"
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col items-center justify-center text-slate-300 py-24">
            <ImageIcon className="w-16 h-16 mb-2" />
            <span className="text-sm">{t("trainingDetail.noImage")}</span>
          </div>
        )}

        {/* Quick Info & Action CTA */}
        <Card className="notranslate border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          {/* 3-Column Info Grid: Jadwal, Tempat, Biaya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  {t("trainingDetail.scheduleLabel")}
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {formatTrainingDateRange(training.startDate, training.endDate, locale)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  {t("trainingDetail.locationLabel")}
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                  {training.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  {t("trainingDetail.priceLabel")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-blue-600 mt-0.5">
                  {training.price ? formatRupiah(training.price) : t("trainingDetail.contactUs")}
                </p>
              </div>
            </div>
          </div>

          {/* Sisa Kuota & Button Daftar Sekarang */}
          <div className="space-y-3 pt-1">
            {slotsLeft !== null && (
              <p className={`text-xs sm:text-sm text-center font-medium ${isFull ? "text-red-600" : "text-slate-500"}`}>
                {isFull
                  ? t("trainingDetail.quotaFull")
                  : `${t("trainingDetail.quotaLeft")}: ${slotsLeft}`}
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              disabled={isFull}
              onClick={() => {
                resetModalState();
                setIsModalOpen(true);
              }}
            >
              {isFull ? t("trainingDetail.quotaFull") : t("trainingDetail.register")}
              {!isFull && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </Card>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <p className="notranslate text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 mb-4">
            {t("trainingDetail.about")}
          </p>
          <div className="text-slate-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
            {training.description}
          </div>
        </div>
      </div>

      {/* Registration Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="notranslate sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {submitSuccess ? (
            <div className="py-8 px-2 text-center space-y-5">
              <div className="w-14 h-14 bg-green-600 text-white rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900">
                  {t("registrationModal.successTitle")}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {training.requiresPayment
                    ? t("registrationModal.successDescPending")
                    : t("registrationModal.successDesc")}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-8"
                >
                  {t("registrationModal.closeBtn")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="pt-2 pr-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-600">
                  {t("registrationModal.eyebrow")}
                </p>
                <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
                  {t("registrationModal.title")}
                </DialogTitle>
              </DialogHeader>

              {/* Program strip — signature carried into the form */}
              <div className="flex items-stretch rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center w-16 bg-primary text-white py-3 shrink-0">
                  <span className="text-lg font-bold leading-none">{day}</span>
                  <span className="text-[9px] uppercase tracking-widest mt-1">
                    {month}
                  </span>
                  <span className="text-[9px] mt-0.5 opacity-80">{year}</span>
                </div>
                <div className="px-3.5 py-3 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">
                    {t("trainingDetail.scheduleLabel")}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-1">
                    {training.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="line-clamp-1">{training.location}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                    {t("registrationModal.nameLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    placeholder={t("registrationModal.namePlaceholder")}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                    {t("registrationModal.emailLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("registrationModal.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Phone / WA */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                    {t("registrationModal.phoneLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder={t("registrationModal.phonePlaceholder")}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Institution (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-institution" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                    {t("registrationModal.institutionLabel")}
                  </Label>
                  <Input
                    id="reg-institution"
                    name="institution"
                    type="text"
                    placeholder={t("registrationModal.institutionPlaceholder")}
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Payment info + proof upload (training berbayar) */}
                {training.requiresPayment && (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                      <Landmark className="w-3.5 h-3.5 text-slate-400" />
                      {t("registrationModal.paymentTitle")}
                    </div>
                    {paymentSettings && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
                        <p className="flex justify-between">
                          <span className="text-slate-500">{t("registrationModal.bankNameLabel")}</span>
                          <span className="font-medium text-slate-800">{paymentSettings.bankName}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-500">{t("registrationModal.accountNumberLabel")}</span>
                          <span className="font-medium text-slate-800">{paymentSettings.accountNumber}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-500">{t("registrationModal.accountHolderLabel")}</span>
                          <span className="font-medium text-slate-800">{paymentSettings.accountHolder}</span>
                        </p>
                        {paymentSettings.notes && (
                          <p className="text-xs text-slate-500 pt-1">{paymentSettings.notes}</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-proof" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900">
                        {t("registrationModal.proofLabel")} <span className="text-red-500">*</span>
                      </Label>
                      <input
                        id="reg-proof"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        onChange={handleProofUpload}
                        className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-sm file:font-medium hover:file:bg-blue-100"
                      />
                      {uploadingProof && (
                        <p className="text-xs text-slate-400">{t("registrationModal.proofUploading")}</p>
                      )}
                      {paymentProofPath && !uploadingProof && (
                        <p className="text-xs text-green-600">✓ {paymentProofPath.split("/").pop()}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="border-t border-slate-100 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting || uploadingProof}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("registrationModal.submittingBtn")}
                      </>
                    ) : (
                      <>
                        {t("registrationModal.submitBtn")}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <GoogleTranslateWidget />
    </Section>
  );
}
