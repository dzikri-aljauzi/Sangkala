"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Loader2, Maximize2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Band, Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";
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

  // Banner preview state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
      <Band>
        <p role="status" className="notranslate text-stone-700">Memuat…</p>
      </Band>
    );
  }

  if (error || !training) {
    return (
      <Band>
        <div className="max-w-xl">
          <p className="type-h2 mb-6">{t("trainingDetail.notFound")}</p>
          <Link href="/info-pelatihan">
            <Button variant="secondary" size="lg">
              <ArrowLeft aria-hidden className="size-4" />
              {t("trainingDetail.back")}
            </Button>
          </Link>
        </div>
      </Band>
    );
  }

  const date = new Date(training.startDate);
  const day = date.toLocaleDateString(locale, { day: "2-digit" });
  const month = date.toLocaleDateString(locale, { month: "short" });
  const year = date.getFullYear();

  const slotsLeft = training.capacity !== null ? training.capacity - training.activeRegistrantsCount : null;
  const isFull = slotsLeft !== null && slotsLeft <= 0;
  const poster = getImageUrl(training.imagePath);
  const dateRange = formatTrainingDateRange(training.startDate, training.endDate, locale);
  const reqText = language === "en" ? "(required)" : "(wajib)";

  return (
    <>
      <Container className="pb-[72px] pt-10 md:pb-[112px] md:pt-14">
        <Link
          href="/info-pelatihan"
          className="notranslate mb-10 inline-flex items-center gap-2 text-[0.9375rem] text-stone-700 transition-colors hover:text-petrol-600"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("trainingDetail.back")}
        </Link>

        <p className="notranslate type-meta mb-5 text-petrol-600">{t("trainingDetail.program")}</p>
        <h1 className="type-h1 max-w-[28ch]">{training.title}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="min-w-0">
            {poster && (
              <div className="relative mb-12 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={poster} alt={training.title} className="block h-auto w-full" />
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(poster)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-ink/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink sm:hidden"
                >
                  <Maximize2 aria-hidden className="size-3.5" />
                  Preview
                </button>
              </div>
            )}
            <h2 className="notranslate type-meta mb-4 text-stone-700">{t("trainingDetail.about")}</h2>
            <div className="max-w-[68ch] whitespace-pre-line border-t border-ink pt-6 text-lg leading-8 text-ink">
              {training.description}
            </div>
          </div>

          {/* Kolom samping menempel: jadwal, tempat, biaya, dan satu tombol daftar */}
          <aside className="notranslate lg:sticky lg:top-24 lg:self-start">
            <dl className="border-t border-ink">
              {[
                [t("trainingDetail.scheduleLabel"), dateRange],
                [t("trainingDetail.locationLabel"), training.location],
                [t("trainingDetail.priceLabel"), training.price ? formatRupiah(training.price) : t("trainingDetail.contactUs")],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-stone-200 py-4">
                  <dt className="type-meta mb-1 text-stone-700">{k}</dt>
                  <dd className="text-[1.0625rem] font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {slotsLeft !== null && (
              <p className="type-meta mt-5 !tracking-normal text-stone-700">
                {isFull ? t("trainingDetail.quotaFull") : `${t("trainingDetail.quotaLeft")}: ${slotsLeft}`}
              </p>
            )}
            <Button
              size="xl"
              className="mt-5 w-full"
              disabled={isFull}
              onClick={() => {
                resetModalState();
                setIsModalOpen(true);
              }}
            >
              {isFull ? t("trainingDetail.quotaFull") : t("trainingDetail.register")}
              {!isFull && <ArrowRight aria-hidden className="size-5" />}
            </Button>
          </aside>
        </div>
      </Container>

      {/* Registration Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="notranslate max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {submitSuccess ? (
            <div role="status" className="space-y-5 px-2 py-8">
              <CheckCircle aria-hidden className="size-10 text-petrol-600" />
              <div className="space-y-2">
                <h3 className="type-card">{t("registrationModal.successTitle")}</h3>
                <p className="max-w-sm text-[0.9375rem] leading-relaxed text-stone-700">
                  {training.requiresPayment
                    ? t("registrationModal.successDescPending")
                    : t("registrationModal.successDesc")}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                {t("registrationModal.closeBtn")}
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader className="pr-6 pt-2">
                <p className="type-meta text-petrol-600">{t("registrationModal.eyebrow")}</p>
                <DialogTitle className="type-card mt-1">{t("registrationModal.title")}</DialogTitle>
              </DialogHeader>

              <div className="flex items-stretch overflow-hidden rounded-lg border border-stone-200">
                <div className="flex w-16 shrink-0 flex-col items-center justify-center bg-petrol-900 py-3 text-paper">
                  <span className="font-mono text-lg font-medium leading-none">{day}</span>
                  <span className="type-meta mt-1 !text-[0.5625rem] !tracking-widest">{month}</span>
                  <span className="mt-0.5 font-mono text-[0.5625rem] opacity-80">{year}</span>
                </div>
                <div className="min-w-0 px-4 py-3">
                  <p className="type-meta text-stone-700">{t("trainingDetail.scheduleLabel")}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink">{training.title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-700">{training.location}</p>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {submitError && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg border border-status-danger-border bg-status-danger-bg p-3 text-sm text-status-danger">
                    <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Field label={t("registrationModal.nameLabel")} htmlFor="reg-name" required requiredText={reqText}>
                  <input id="reg-name" name="name" type="text" required autoComplete="name" placeholder={t("registrationModal.namePlaceholder")} value={formData.name} onChange={handleInputChange} className={controlClass} />
                </Field>
                <Field label={t("registrationModal.emailLabel")} htmlFor="reg-email" required requiredText={reqText}>
                  <input id="reg-email" name="email" type="email" required autoComplete="email" placeholder={t("registrationModal.emailPlaceholder")} value={formData.email} onChange={handleInputChange} className={controlClass} />
                </Field>
                <Field label={t("registrationModal.phoneLabel")} htmlFor="reg-phone" required requiredText={reqText}>
                  <input id="reg-phone" name="phone" type="tel" required autoComplete="tel" placeholder={t("registrationModal.phonePlaceholder")} value={formData.phone} onChange={handleInputChange} className={controlClass} />
                </Field>
                <Field label={t("registrationModal.institutionLabel")} htmlFor="reg-institution">
                  <input id="reg-institution" name="institution" type="text" autoComplete="organization" placeholder={t("registrationModal.institutionPlaceholder")} value={formData.institution} onChange={handleInputChange} className={controlClass} />
                </Field>

                {training.requiresPayment && (
                  <div className="space-y-4 border-t border-stone-200 pt-5">
                    <p className="type-meta text-ink">{t("registrationModal.paymentTitle")}</p>
                    {paymentSettings && (
                      <dl className="space-y-1 rounded-lg border border-stone-200 bg-stone-100 p-4 text-sm">
                        {[
                          [t("registrationModal.bankNameLabel"), paymentSettings.bankName],
                          [t("registrationModal.accountNumberLabel"), paymentSettings.accountNumber],
                          [t("registrationModal.accountHolderLabel"), paymentSettings.accountHolder],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4">
                            <dt className="text-stone-700">{k}</dt>
                            <dd className="font-mono font-medium text-ink">{v}</dd>
                          </div>
                        ))}
                        {paymentSettings.notes && <p className="pt-2 text-xs text-stone-700">{paymentSettings.notes}</p>}
                      </dl>
                    )}
                    <Field label={t("registrationModal.proofLabel")} htmlFor="reg-proof" required requiredText={reqText}>
                      <input
                        id="reg-proof"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        onChange={handleProofUpload}
                        className="w-full text-sm text-stone-700 file:mr-3 file:rounded-lg file:border file:border-stone-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-stone-100"
                      />
                      {uploadingProof && <p role="status" className="mt-2 text-xs text-stone-700">{t("registrationModal.proofUploading")}</p>}
                      {paymentProofPath && !uploadingProof && (
                        <p className="mt-2 text-xs text-petrol-600">✓ {paymentProofPath.split("/").pop()}</p>
                      )}
                    </Field>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-5">
                  <Button type="submit" size="lg" disabled={submitting || uploadingProof} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 aria-hidden className="size-4 animate-spin" />
                        {t("registrationModal.submittingBtn")}
                      </>
                    ) : (
                      <>
                        {t("registrationModal.submitBtn")}
                        <ArrowRight aria-hidden className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Banner Full Preview Dialog */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{training.title}</DialogTitle>
          </DialogHeader>
          {previewImageUrl && (
            <div className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImageUrl} alt="Banner Preview" className="h-auto max-h-[75vh] w-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <GoogleTranslateWidget />
    </>
  );
}
