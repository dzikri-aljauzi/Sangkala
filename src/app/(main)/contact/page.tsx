"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Band, PageHeader } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Field, controlClass, textareaClass } from "@/components/ui/field";
import { Mail, Phone, MapPin, Calendar, MessageSquare, FileText, CheckCircle } from "lucide-react";

const contactOptions = [
  {
    icon: Calendar,
    title: { id: "Konsultasi Gratis (30 menit)", en: "Free Consultation (30 minutes)" },
    desc: { id: "Jadwalkan sesi diskusi untuk membahas kebutuhan Anda", en: "Schedule a discussion session to discuss your needs" },
    value: "consultation",
  },
  {
    icon: FileText,
    title: { id: "Request Proposal", en: "Request Proposal" },
    desc: { id: "Dapatkan proposal detail untuk program atau layanan", en: "Get a detailed proposal for programs or services" },
    value: "proposal",
  },
  {
    icon: MessageSquare,
    title: { id: "Inquiry Umum", en: "General Inquiry" },
    desc: { id: "Pertanyaan umum tentang layanan kami", en: "General questions about our services" },
    value: "inquiry",
  },
];

const industryOptions = [
  { id: "Perbankan", en: "Banking" },
  { id: "BUMN", en: "SOE" },
  { id: "Fintech", en: "Fintech" },
  { id: "Asuransi", en: "Insurance" },
  { id: "Multifinance", en: "Multifinance" },
  { id: "Lainnya", en: "Other" },
];

const serviceOptions = [
  { id: "People Excellence", en: "People Excellence" },
  { id: "Process Optimization", en: "Process Optimization" },
  { id: "Technology Enablement", en: "Technology Enablement" },
  { id: "GRC Leadership Academy", en: "GRC Leadership Academy" },
  { id: "IPT Consulting", en: "IPT Consulting" },
  { id: "Digital Readiness Bootcamp", en: "Digital Readiness Bootcamp" },
  { id: "IT GRC Certification", en: "IT GRC Certification" },
  { id: "Custom Program", en: "Custom Program" },
];

export default function ContactPage() {
  const { language } = useLanguage();
  const id = language === "id";
  const [selectedType, setSelectedType] = useState("consultation");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    industry: "",
    service: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get inquiry type label
    const inquiryType = contactOptions.find((opt) => opt.value === selectedType)?.title[language] || selectedType;

    // Construct email body
    const emailBody = `
Jenis Inquiry: ${inquiryType}

Nama: ${formData.name}
Email: ${formData.email}
Perusahaan: ${formData.company}
Jabatan: ${formData.jobTitle || "-"}
Industri: ${formData.industry}
Layanan yang Diminati: ${formData.service || "-"}

Pesan:
${formData.message}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:hello@sangkala.example?subject=${encodeURIComponent(
      `[${inquiryType}] Inquiry dari ${formData.name} - ${formData.company}`
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success after a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const reqText = id ? "(wajib)" : "(required)";

  return (
    <>
      <PageHeader
        eyebrow={id ? "Hubungi Kami" : "Contact Us"}
        title={id ? "Siap Membangun Kinerja Berkelanjutan?" : "Ready to Build Sustainable Performance?"}
        lead={
          id
            ? "Hubungi kami untuk konsultasi gratis dan diskusikan bagaimana kami dapat membantu transformasi organisasi Anda."
            : "Contact us for a free consultation and discuss how we can help your organization's transformation."
        }
      />

      <Band>
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <fieldset>
              <legend className="type-meta mb-4 text-stone-700">{id ? "Jenis inquiry" : "Inquiry type"}</legend>
              <div role="radiogroup" className="border-t border-ink">
                {contactOptions.map((option) => {
                  const active = selectedType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedType(option.value)}
                      className={`flex w-full items-start gap-4 border-b border-stone-200 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-600 ${
                        active ? "" : "hover:bg-stone-100"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border ${
                          active ? "border-petrol-600" : "border-stone-400"
                        }`}
                      >
                        {active && <span className="size-2.5 rounded-full bg-petrol-600" />}
                      </span>
                      <span>
                        <span className={`block text-base ${active ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                          {option.title[language]}
                        </span>
                        <span className="mt-1 block text-sm text-stone-700">{option.desc[language]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-12">
              <h2 className="type-meta mb-4 text-stone-700">{id ? "Kontak langsung" : "Direct contact"}</h2>
              <ul className="space-y-4 border-t border-ink pt-5 text-[0.9375rem] text-ink">
                <li className="flex gap-3">
                  <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-stone-700" />
                  <a href="mailto:hello@sangkala.example" className="break-all underline-offset-4 hover:text-petrol-600 hover:underline">
                    hello@sangkala.example
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-stone-700" />
                  <a href="tel:+620000000000" className="underline-offset-4 hover:text-petrol-600 hover:underline">
                    +62 000 0000 0000
                  </a>
                </li>
                <li className="flex gap-3">
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-stone-700" />
                  <span>
                    Kantor Sangkala, Jakarta, Indonesia
                    <br />
                    <span className="text-stone-700">
                      {id ? "(alamat fiktif untuk portofolio)" : "(fictional address, for portfolio)"}
                    </span>
                  </span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-stone-700">
                {id ? "Jam operasional: Senin - Jumat, 09:00 - 17:00 WIB" : "Operating hours: Monday - Friday, 09:00 - 17:00 WIB"}
              </p>
            </div>
          </div>

          <div>
            {isSubmitted ? (
              <div role="status" className="border-t border-ink pt-8">
                <CheckCircle aria-hidden className="mb-5 size-10 text-petrol-600" />
                <h2 className="type-h2 mb-4">{id ? "Email siap dikirim" : "Email ready to send"}</h2>
                <p className="prose-width mb-8 text-lg text-stone-700">
                  {id
                    ? "Aplikasi email Anda telah terbuka dengan pesan yang sudah diisi. Silakan klik 'Kirim' di aplikasi email Anda untuk menyelesaikan pengiriman."
                    : "Your email application has opened with the message pre-filled. Please click 'Send' in your email app to complete the submission."}
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", company: "", jobTitle: "", industry: "", service: "", message: "" });
                  }}
                >
                  {id ? "Kirim Pesan Lain" : "Send Another Message"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 border-t border-ink pt-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label={id ? "Nama Lengkap" : "Full Name"} htmlFor="name" required requiredText={reqText}>
                    <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} required autoComplete="name" className={controlClass} placeholder={id ? "Masukkan nama Anda" : "Enter your name"} />
                  </Field>
                  <Field label="Email" htmlFor="email" required requiredText={reqText}>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} required autoComplete="email" className={controlClass} placeholder={id ? "email@perusahaan.com" : "email@company.com"} />
                  </Field>
                  <Field label={id ? "Perusahaan" : "Company"} htmlFor="company" required requiredText={reqText}>
                    <input id="company" type="text" name="company" value={formData.company} onChange={handleInputChange} required autoComplete="organization" className={controlClass} placeholder={id ? "Nama perusahaan" : "Company name"} />
                  </Field>
                  <Field label={id ? "Jabatan" : "Job Title"} htmlFor="jobTitle">
                    <input id="jobTitle" type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} autoComplete="organization-title" className={controlClass} placeholder={id ? "Jabatan Anda" : "Your job title"} />
                  </Field>
                  <Field label={id ? "Industri" : "Industry"} htmlFor="industry" required requiredText={reqText}>
                    <select id="industry" name="industry" value={formData.industry} onChange={handleInputChange} required className={controlClass}>
                      <option value="">{id ? "Pilih industri" : "Select industry"}</option>
                      {industryOptions.map((opt) => (
                        <option key={opt.en} value={opt[language]}>{opt[language]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={id ? "Layanan yang Diminati" : "Service of Interest"} htmlFor="service">
                    <select id="service" name="service" value={formData.service} onChange={handleInputChange} className={controlClass}>
                      <option value="">{id ? "Pilih layanan" : "Select service"}</option>
                      {serviceOptions.map((opt) => (
                        <option key={opt.en} value={opt[language]}>{opt[language]}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label={id ? "Pesan" : "Message"} htmlFor="message" required requiredText={reqText}>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={textareaClass}
                    placeholder={
                      id
                        ? "Ceritakan kebutuhan atau tantangan yang ingin Anda diskusikan..."
                        : "Tell us about the needs or challenges you'd like to discuss..."
                    }
                  />
                </Field>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (id ? "Mengirim..." : "Sending...") : id ? "Kirim Pesan" : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Band>
    </>
  );
}
