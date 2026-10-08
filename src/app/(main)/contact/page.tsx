"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Calendar,
  MessageSquare,
  FileText,
  CheckCircle,
} from "lucide-react";

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

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-petrol-600 mb-3 sm:mb-4">
              {language === "id" ? "Hubungi Kami" : "Contact Us"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-stone-800">
              {language === "id"
                ? "Siap Membangun Kinerja Berkelanjutan?"
                : "Ready to Build Sustainable Performance?"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-3xl">
              {language === "id"
                ? "Hubungi kami untuk konsultasi gratis dan diskusikan bagaimana kami dapat membantu transformasi organisasi Anda."
                : "Contact us for a free consultation and discuss how we can help your organization's transformation."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <Section variant="default" padding="xl">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Options & Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-4 sm:mb-6">
                {language === "id" ? "Pilih Jenis Inquiry" : "Choose Inquiry Type"}
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {contactOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value)}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all ${
                      selectedType === option.value
                        ? "bg-petrol-600 text-white"
                        : "bg-[#f2f3f1] hover:bg-petrol-600/10"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <option.icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 ${
                          selectedType === option.value
                            ? "text-white"
                            : "text-petrol-600"
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">{option.title[language]}</h3>
                        <p
                          className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${
                            selectedType === option.value
                              ? "text-white/80"
                              : "text-stone-500"
                          }`}
                        >
                          {option.desc[language]}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-sm sm:text-base text-stone-800">
                  {language === "id" ? "Kontak Langsung" : "Direct Contact"}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <a
                    href="mailto:hello@sangkala.example"
                    className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-stone-500 hover:text-petrol-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span className="break-all sm:break-normal">hello@sangkala.example</span>
                  </a>
                  <a
                    href="tel:+620000000000"
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-500 hover:text-petrol-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>+62 000 0000 0000</span>
                  </a>
                  <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-stone-500">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Jakarta, Indonesia<br />
                      (alamat fiktif untuk portofolio)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-stone-100"
            >
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-800 mb-4">
                    {language === "id" ? "Email Siap Dikirim!" : "Email Ready to Send!"}
                  </h2>
                  <p className="text-stone-500 mb-6">
                    {language === "id"
                      ? "Aplikasi email Anda telah terbuka dengan pesan yang sudah diisi. Silakan klik 'Kirim' di aplikasi email Anda untuk menyelesaikan pengiriman."
                      : "Your email application has opened with the message pre-filled. Please click 'Send' in your email app to complete the submission."}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        jobTitle: "",
                        industry: "",
                        service: "",
                        message: "",
                      });
                    }}
                  >
                    {language === "id" ? "Kirim Pesan Lain" : "Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        {language === "id" ? "Nama Lengkap" : "Full Name"} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                        placeholder={language === "id" ? "Masukkan nama Anda" : "Enter your name"}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                        placeholder={language === "id" ? "email@perusahaan.com" : "email@company.com"}
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        {language === "id" ? "Perusahaan" : "Company"} *
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                        placeholder={language === "id" ? "Nama perusahaan" : "Company name"}
                      />
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        {language === "id" ? "Jabatan" : "Job Title"}
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                        placeholder={language === "id" ? "Jabatan Anda" : "Your job title"}
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        {language === "id" ? "Industri" : "Industry"} *
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                      >
                        <option value="">
                          {language === "id" ? "Pilih industri" : "Select industry"}
                        </option>
                        {industryOptions.map((opt) => (
                          <option key={opt.en} value={opt[language]}>
                            {opt[language]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Service Interest */}
                    <div>
                      <label className="block text-sm font-medium text-stone-800 mb-2">
                        {language === "id" ? "Layanan yang Diminati" : "Service of Interest"}
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all"
                      >
                        <option value="">
                          {language === "id" ? "Pilih layanan" : "Select service"}
                        </option>
                        {serviceOptions.map((opt) => (
                          <option key={opt.en} value={opt[language]}>
                            {opt[language]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      {language === "id" ? "Pesan" : "Message"} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 outline-none transition-all resize-none"
                      placeholder={
                        language === "id"
                          ? "Ceritakan kebutuhan atau tantangan yang ingin Anda diskusikan..."
                          : "Tell us about the needs or challenges you'd like to discuss..."
                      }
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-500">
                      * {language === "id" ? "Wajib diisi" : "Required"}
                    </p>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? (language === "id" ? "Mengirim..." : "Sending...")
                        : (language === "id" ? "Kirim Pesan" : "Send Message")
                      }
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Map Section */}
      <Section variant="light" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Location Card */}
            <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 border border-stone-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-petrol-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-petrol-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-800">
                  {language === "id" ? "Lokasi Kantor" : "Office Location"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-stone-800 text-sm sm:text-base">
                    Kantor Sangkala
                  </p>
                  <p className="text-stone-600 text-sm sm:text-base mt-1">
                    Jakarta, Indonesia
                  </p>
                  <p className="text-stone-600 text-sm sm:text-base">
                    Alamat fiktif untuk keperluan portofolio
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs sm:text-sm text-stone-500 mb-2">
                    {language === "id" ? "Jam Operasional:" : "Operating Hours:"}
                  </p>
                  <p className="text-sm sm:text-base text-stone-700">
                    {language === "id" ? "Senin - Jumat" : "Monday - Friday"}
                  </p>
                  <p className="text-sm sm:text-base font-medium text-stone-800">
                    09:00 - 17:00 WIB
                  </p>
                </div>

                <a
                  href="https://maps.google.com/?q=Jakarta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-petrol-600 hover:text-petrol-700 text-sm sm:text-base font-medium mt-2"
                >
                  <span>{language === "id" ? "Buka di Google Maps" : "Open in Google Maps"}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="lg:col-span-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-[300px] sm:h-[350px] lg:h-full min-h-[350px]">
              <iframe
                src="https://www.google.com/maps?q=Jakarta&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sangkala Office Location"
              />
            </div>
          </div>
        </motion.div>
      </Section>
    </>
  );
}
