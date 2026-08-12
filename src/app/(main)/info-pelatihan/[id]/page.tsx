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

interface Training {
  id: string;
  title: string;
  location: string;
  startDate: string;
  price: string | null;
  description: string;
  imagePath: string | null;
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/trainings/${id}/registrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setFormData({ name: "", email: "", phone: "", institution: "" });
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

  return (
    <Section variant="gradient" padding="xl" className="pt-32 sm:pt-36">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/info-pelatihan"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t("trainingDetail.back")}
        </Link>

        {/* Centered title */}
        <div className="mt-6 mb-8 sm:mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-3">
            {t("trainingDetail.program")}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            {training.title}
          </h1>
          <div className="mt-5 flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {training.location}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formatDate(training.startDate)}
            </span>
          </div>
        </div>

        {/* Grid: Image + Info Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden relative min-h-75 sm:min-h-95 flex items-center justify-center">
            {training.imagePath ? (
              <Image
                src={getImageUrl(training.imagePath) ?? ""}
                alt={training.title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex flex-col items-center text-slate-300 py-20">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span className="text-sm">{t("trainingDetail.noImage")}</span>
              </div>
            )}
          </div>

          {/* Info sheet */}
          <Card className="md:col-span-1 border border-slate-200 flex flex-col bg-white overflow-hidden">
            <div className="flex items-stretch border-b border-slate-100">
              <div className="flex flex-col items-center justify-center w-24 bg-primary text-white py-4 shrink-0">
                <span className="text-2xl font-bold leading-none">{day}</span>
                <span className="text-[10px] uppercase tracking-widest mt-1 text-slate-100">
                  {month}
                </span>
                <span className="text-[10px] mt-0.5 text-slate-100">{year}</span>
              </div>
              <div className="flex flex-col justify-center px-4">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">
                  {t("trainingDetail.scheduleLabel")}
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {formatDate(training.startDate)}
                </p>
              </div>
            </div>

            {/* Fact rows */}
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-900 font-medium">
                    {t("trainingDetail.locationLabel")}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {training.location}
                  </p>
                </div>
              </div>
              <div className="px-4 py-4 flex items-start gap-3">
                <Tag className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-900 font-medium">
                    {t("trainingDetail.priceLabel")}
                  </p>
                  <p className="text-lg font-semibold text-slate-700 mt-0.5">
                    {training.price ?? t("trainingDetail.contactUs")}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 mt-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  resetModalState();
                  setIsModalOpen(true);
                }}
              >
                {t("trainingDetail.register")}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Description */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 mb-3">
            {t("trainingDetail.about")}
          </p>
          <p className="text-slate-700 whitespace-pre-line leading-relaxed max-w-3xl">
            {training.description}
          </p>
        </div>
      </div>

      {/* Registration Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg overflow-hidden">
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
                  {t("registrationModal.successDesc")}
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

                {/* Submit Button */}
                <div className="border-t border-slate-100 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting}
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
    </Section>
  );
}
