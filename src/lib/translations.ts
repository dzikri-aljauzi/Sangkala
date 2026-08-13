export type Language = "id" | "en";

export const translations = {
  // Navigation
  nav: {
    home: { id: "Beranda", en: "Home" },
    about: { id: "Tentang Kami", en: "About Us" },
    services: { id: "Layanan", en: "Services" },
    industries: { id: "Industri", en: "Industries" },
    programs: { id: "Program", en: "Programs" },
    infoPelatihan: { id: "Info Pelatihan", en: "Training Info" },
    methodology: { id: "Metodologi", en: "Methodology" },
    insights: { id: "Insight", en: "Insights" },
    assessmentCenter: { id: "Risk Leadership Assessment Center", en: "Risk Leadership Assessment Center" },
    newsArticle: { id: "News & Article", en: "News & Article" },
    contact: { id: "Kontak", en: "Contact" },
    cta: { id: "Daftar Sekarang", en: "Register Now" },
  },

  // Hero Section
  hero: {
    headline: {
      id: "Build Resilient Organizations Through People, Process & Technology Integration",
      en: "Build Resilient Organizations Through People, Process & Technology Integration",
    },
    subheadline: {
      id: "Konsultan dan pelatihan spesialis untuk lembaga keuangan, perbankan, dan BUMN yang ingin mencapai kinerja berkelanjutan, compliance excellence, dan digital readiness.",
      en: "Specialist consulting and training for financial institutions, banking, and state-owned enterprises aiming for sustainable performance, compliance excellence, and digital readiness.",
    },
    ctaPrimary: { id: "Konsultasi Gratis", en: "Free Consultation" },
    ctaSecondary: { id: "Lihat Program Kami", en: "View Our Programs" },
    globeTitle: { id: "Jangkauan Global", en: "Global Reach" },
  },

  // Value Metrics
  metrics: {
    institutions: { id: "Institusi Keuangan & BUMN", en: "Financial Institutions & SOEs" },
    professionals: { id: "Profesional Terlatih", en: "Trained Professionals" },
    satisfaction: { id: "Client Satisfaction Rate", en: "Client Satisfaction Rate" },
    certified: { id: "ISO 9001 & Certified Instructors", en: "ISO 9001 & Certified Instructors" },
  },

  // About Section
  about: {
    title: { id: "Tentang Kami", en: "About Us" },
    subtitle: { id: "Filosofi Kami", en: "Our Philosophy" },
    narrative: {
      id: "Di era dinamika regulasi, Lifestyle customer, era sosial finance dan transformasi digital (AI, open banking, fintech disruption), organisasi membutuhkan lebih dari sekadar training ad-hoc atau konsultan yang hanya fokus satu dimensi.",
      en: "In an era of regulatory dynamics, Lifestyle customers, the era of social finance and digital transformation (AI, open banking, fintech disruption), organizations need more than just ad-hoc training or one-dimensional consultants.",
    },
    intro: {
      id: "Leadership Nasional Asia hadir sebagai integrator ekosistem kinerja yang menyatukan:",
      en: "Leadership Nasional Asia serves as a performance ecosystem integrator that unifies:",
    },
    pillars: {
      people: {
        title: { id: "People", en: "People" },
        desc: { id: "Leadership, risk culture, compliance mindset, agile workforce", en: "Leadership, risk culture, compliance mindset, agile workforce" },
      },
      process: {
        title: { id: "Process", en: "Process" },
        desc: { id: "GRC framework, business process reengineering, operational efficiency", en: "GRC framework, business process reengineering, operational efficiency" },
      },
      technology: {
        title: { id: "Technology", en: "Technology" },
        desc: { id: "Digital transformation roadmap, data governance, IT risk management", en: "Digital transformation roadmap, data governance, IT risk management" },
      },
    },
    belief: {
      id: "Kami percaya kinerja berkelanjutan hanya tercapai bila ketiga pilar ini didesain, diimplementasikan, dan dimonitor sebagai satu sistem terintegrasi.",
      en: "We believe sustainable performance is only achieved when these three pillars are designed, implemented, and monitored as one integrated system.",
    },
    differentiator: {
      id: "Bukan sekadar pelatihan—kami membangun performance DNA organisasi Anda.",
      en: "Not just training—we build your organization's performance DNA.",
    },
  },

  // Services
  services: {
    title: { id: "Layanan Kami", en: "Our Services" },
    subtitle: { id: "The Integrated People, Process, Technology Framework", en: "The Integrated People, Process, Technology Framework" },
    description: {
      id: "Arsitektur layanan berbasis matriks People, Process, Technology untuk transformasi organisasi yang holistik",
      en: "People, Process, Technology matrix-based service architecture for holistic organizational transformation",
    },
    people: {
      title: { id: "People Excellence", en: "People Excellence" },
      items: [
        {
          title: { id: "Program Kepemimpinan Eksekutif & Board", en: "Executive & Board Leadership Program" },
          desc: { id: "GRC for Directors, Strategic Decision-Making, Crisis Leadership", en: "GRC for Directors, Strategic Decision-Making, Crisis Leadership" },
        },
        {
          title: { id: "Pengembangan Budaya Compliance & Risiko", en: "Compliance & Risk Culture Development" },
          desc: { id: "Embedding Risk Awareness, Anti-Fraud Training, Whistleblowing System", en: "Embedding Risk Awareness, Anti-Fraud Training, Whistleblowing System" },
        },
        {
          title: { id: "Talent Development & Change Management", en: "Talent Development & Change Management" },
          desc: { id: "Agile Leadership, Coaching & Mentoring, Change Management", en: "Agile Leadership, Coaching & Mentoring, Change Management" },
        },
        {
          title: { id: "Risk Leadership Assessment Center", en: "Risk Leadership Assessment Center" },
          desc: { id: "Assessment terstruktur untuk memetakan kapasitas Risk Leadership", en: "Structured assessment to map Risk Leadership capacity" },
        },
      ],
    },
    process: {
      title: { id: "Process Optimization", en: "Process Optimization" },
      items: [
        {
          title: { id: "Desain & Implementasi GRC Framework", en: "GRC Framework Design & Implementation" },
          desc: { id: "Integrated GRC Architecture, Business Judgment Rule Operationalization", en: "Integrated GRC Architecture, Business Judgment Rule Operationalization" },
        },
        {
          title: { id: "Business Process Reengineering", en: "Business Process Reengineering" },
          desc: { id: "Lean Six Sigma, Process Mapping & Automation Readiness, SOP Development", en: "Lean Six Sigma, Process Mapping & Automation Readiness, SOP Development" },
        },
        {
          title: { id: "Regulatory Compliance Advisory", en: "Regulatory Compliance Advisory" },
          desc: { id: "POJK Implementation, Business Risk Strategy, AML & Fraud Awareness, KYC Process Design", en: "POJK Implementation, Business Risk Strategy, AML & Fraud Awareness, KYC Process Design" },
        },
      ],
    },
    technology: {
      title: { id: "Technology Enablement", en: "Technology Enablement" },
      items: [
        {
          title: { id: "Digital Transformation Roadmap", en: "Digital Transformation Roadmap" },
          desc: { id: "Digital Maturity Assessment, Technology Strategy, Open Banking & API", en: "Digital Maturity Assessment, Technology Strategy, Open Banking & API" },
        },
        {
          title: { id: "IT Governance & Risk Management", en: "IT Governance & Risk Management" },
          desc: { id: "IT GRC Framework (COBIT, ISO 27001, NIST), Cybersecurity, Data Governance", en: "IT GRC Framework (COBIT, ISO 27001, NIST), Cybersecurity, Data Governance" },
        },
        {
          title: { id: "Technology-Enabled Training & Analytics", en: "Technology-Enabled Training & Analytics" },
          desc: { id: "LMS Implementation, Performance Dashboard, AI/ML for Risk Prediction", en: "LMS Implementation, Performance Dashboard, AI/ML for Risk Prediction" },
        },
      ],
    },
  },

  // Industries
  industries: {
    title: { id: "Industri yang Kami Layani", en: "Industries We Serve" },
    subtitle: { id: "Fokus vertikal dengan messaging khusus", en: "Vertical focus with specialized messaging" },
    banking: {
      title: { id: "Perbankan & Lembaga Keuangan", en: "Banking & Financial Institutions" },
      desc: {
        id: "Navigasi kompleksitas regulasi OJK, transformasi digital, dan risk culture dalam satu integrated approach.",
        en: "Navigate OJK regulatory complexity, digital transformation, and risk culture in one integrated approach.",
      },
      programs: { id: "GRC for Banking Leadership, Credit Risk Analytics, Digital Banking Readiness", en: "GRC for Banking Leadership, Credit Risk Analytics, Digital Banking Readiness" },
    },
    soe: {
      title: { id: "BUMN Strategis", en: "Strategic State-Owned Enterprises" },
      desc: {
        id: "Dari mandat kedaulatan hingga efisiensi operasional—kami memahami dual mandate BUMN dan risiko hukum yang menyertainya.",
        en: "From sovereignty mandate to operational efficiency—we understand SOE dual mandate and accompanying legal risks.",
      },
      programs: { id: "Business Judgment Rule for SOE Directors, Performance Management System, Public Procurement Compliance", en: "Business Judgment Rule for SOE Directors, Performance Management System, Public Procurement Compliance" },
    },
    fintech: {
      title: { id: "Fintech & Insurtech", en: "Fintech & Insurtech" },
      desc: {
        id: "Agile, compliant, dan scalable—bangun fondasi GRC sejak awal tanpa menghambat inovasi.",
        en: "Agile, compliant, and scalable—build GRC foundation from the start without hindering innovation.",
      },
      programs: { id: "Agile GRC, Embedded Compliance, Tech Risk Assessment", en: "Agile GRC, Embedded Compliance, Tech Risk Assessment" },
    },
  },

  // Programs
  programs: {
    title: { id: "Program Unggulan", en: "Flagship Programs" },
    subtitle: { id: "Program signature dengan dampak terukur", en: "Signature programs with measurable impact" },
    items: [
      {
        title: { id: "GRC Leadership Academy for Financial Institutions", en: "GRC Leadership Academy for Financial Institutions" },
        duration: { id: "6 bulan cohort program", en: "6-month cohort program" },
        desc: {
          id: "Modul: Governance, Risk, Compliance, Business Judgment Rule, Crisis Management. Blended learning dengan workshop, coaching, dan simulasi.",
          en: "Modules: Governance, Risk, Compliance, Business Judgment Rule, Crisis Management. Blended learning with workshop, coaching, and simulation.",
        },
        highlights: { id: "Certification + Alumni Network", en: "Certification + Alumni Network" },
      },
      {
        title: { id: "Integrated Performance Transformation (IPT) Consulting", en: "Integrated Performance Transformation (IPT) Consulting" },
        duration: { id: "9-12 bulan engagement", en: "9-12 month engagement" },
        desc: {
          id: "End-to-end engagement: diagnostic → design → implementation → monitoring. Deliverable: Integrated People, Process, Technology roadmap, KPI dashboard, change management plan.",
          en: "End-to-end engagement: diagnostic → design → implementation → monitoring. Deliverable: Integrated People, Process, Technology roadmap, KPI dashboard, change management plan.",
        },
        highlights: { id: "Full Transformation Support", en: "Full Transformation Support" },
      },
      {
        title: { id: "Digital Readiness Bootcamp for BUMN", en: "Digital Readiness Bootcamp for SOEs" },
        duration: { id: "3 bulan intensive program", en: "3-month intensive program" },
        desc: {
          id: "Coverage: Digital strategy, IT governance, data analytics, cybersecurity. Outcome: Digital transformation roadmap + quick wins implementation.",
          en: "Coverage: Digital strategy, IT governance, data analytics, cybersecurity. Outcome: Digital transformation roadmap + quick wins implementation.",
        },
        highlights: { id: "Quick Wins + Roadmap", en: "Quick Wins + Roadmap" },
      },
      {
        title: { id: "Certified IT GRC Professional Program", en: "Certified IT GRC Professional Program" },
        duration: { id: "Preparation program", en: "Preparation program" },
        desc: {
          id: "Persiapan untuk CGRC (ISC²), CRISC (ISACA), atau GRCP (OCEG). Instruktur certified + study materials + exam simulation.",
          en: "Preparation for CGRC (ISC²), CRISC (ISACA), or GRCP (OCEG). Certified instructors + study materials + exam simulation.",
        },
        highlights: { id: "Post-program Mentoring", en: "Post-program Mentoring" },
      },
    ],
  },

  // Methodology
  methodology: {
    title: { id: "Metodologi", en: "Methodology" },
    subtitle: { id: "Our Approach", en: "Our Approach" },
    description: {
      id: "Setiap engagement kami terukur dengan Performance Sustainability Index (PSI) yang melacak progress di 3 dimensi secara real-time.",
      en: "Every engagement is measured with Performance Sustainability Index (PSI) tracking progress across 3 dimensions in real-time.",
    },
    steps: [
      {
        title: { id: "Assess", en: "Assess" },
        desc: { id: "Diagnostic & Gap Analysis (People, Process, Tech)", en: "Diagnostic & Gap Analysis (People, Process, Tech)" },
      },
      {
        title: { id: "Design", en: "Design" },
        desc: { id: "Integrated People, Process, Technology Framework & Roadmap", en: "Integrated People, Process, Technology Framework & Roadmap" },
      },
      {
        title: { id: "Build", en: "Build" },
        desc: { id: "Capability Development (Training) + Process/Tech Implementation", en: "Capability Development (Training) + Process/Tech Implementation" },
      },
      {
        title: { id: "Embed", en: "Embed" },
        desc: { id: "Change Management & Institutionalization", en: "Change Management & Institutionalization" },
      },
      {
        title: { id: "Sustain", en: "Sustain" },
        desc: { id: "Continuous Monitoring, Audit, & Improvement", en: "Continuous Monitoring, Audit, & Improvement" },
      },
    ],
  },

  // Insights
  insights: {
    title: { id: "Insight & Resources", en: "Insights & Resources" },
    subtitle: { id: "Content Hub untuk Thought Leadership", en: "Content Hub for Thought Leadership" },
    categories: {
      articles: { id: "Artikel", en: "Articles" },
      whitepapers: { id: "Whitepapers", en: "Whitepapers" },
      webinars: { id: "Webinar & Events", en: "Webinars & Events" },
      caseStudies: { id: "Case Studies", en: "Case Studies" },
      tools: { id: "Tools & Templates", en: "Tools & Templates" },
    },
  },

  // News & Article
  newsArticle: {
    title: { id: "News & Article", en: "News & Article" },
    subtitle: { id: "Berita dan Artikel Terbaru", en: "Latest News and Articles" },
    description: {
      id: "Temukan berita terbaru dan artikel mendalam seputar GRC, compliance, dan transformasi digital.",
      en: "Discover the latest news and in-depth articles about GRC, compliance, and digital transformation.",
    },
    featured: { id: "Artikel Unggulan", en: "Featured Articles" },
    all: { id: "Semua Artikel", en: "All Articles" },
    readMore: { id: "Baca Selengkapnya", en: "Read More" },
    noArticles: { id: "Belum ada artikel", en: "No articles yet" },
  },

  // Testimonials
  testimonials: {
    title: { id: "Klien & Testimoni", en: "Clients & Testimonials" },
    subtitle: { id: "Apa kata mereka tentang kami", en: "What they say about us" },
    items: [
      {
        quote: {
          id: "Leadership Nasional Asia membantu kami membangun integrated risk culture dari level board sampai front-line. Framework People, Process, Technology mereka membuat GRC tidak lagi silo.",
          en: "Leadership Nasional Asia helped us build an integrated risk culture from board level to front-line. Their People, Process, Technology framework eliminated GRC silos.",
        },
        author: { id: "Direktur Risiko, Bank Umum Nasional", en: "Risk Director, National Commercial Bank" },
      },
      {
        quote: {
          id: "Program GRC Leadership Academy mengubah cara kami memandang keputusan bisnis—dari takut salah menjadi berani terukur dengan dokumentasi kuat.",
          en: "The GRC Leadership Academy program changed how we view business decisions—from fear of mistakes to measured courage with strong documentation.",
        },
        author: { id: "VP Compliance, BUMN Strategis", en: "VP Compliance, Strategic SOE" },
      },
    ],
  },

  // Contact
  contact: {
    title: { id: "Hubungi Kami", en: "Contact Us" },
    subtitle: { id: "Siap membangun kinerja berkelanjutan?", en: "Ready to build sustainable performance?" },
    form: {
      name: { id: "Nama Lengkap", en: "Full Name" },
      email: { id: "Email", en: "Email" },
      company: { id: "Perusahaan", en: "Company" },
      industry: { id: "Industri", en: "Industry" },
      service: { id: "Layanan yang Diminati", en: "Service of Interest" },
      message: { id: "Pesan", en: "Message" },
      submit: { id: "Kirim Pesan", en: "Send Message" },
    },
    options: {
      consultation: { id: "Konsultasi Gratis (30 menit)", en: "Free Consultation (30 minutes)" },
      proposal: { id: "Request Proposal", en: "Request Proposal" },
      inquiry: { id: "Inquiry Umum", en: "General Inquiry" },
    },
  },

  // Assessment Center
  assessmentCenter: {
    title: { id: "Risk Leadership Assessment Center", en: "Risk Leadership Assessment Center" },
    subtitle: { id: "Portal Assessment LNA", en: "LNA Assessment Portal" },
    pageDescription: { id: "Akses assessment yang sedang berlangsung", en: "Access ongoing assessments" },
    listTitle: { id: "Daftar Assessment", en: "Assessment List" },
    noAssessments: { id: "Belum ada assessment tersedia", en: "No assessments available" },
    selectAssessment: { id: "Pilih assessment untuk login", en: "Select assessment to login" },
    login: { id: "Login", en: "Login" },
    email: { id: "Email", en: "Email" },
    password: { id: "Password", en: "Password" },
    loginButton: { id: "Masuk", en: "Login" },
    logout: { id: "Keluar", en: "Logout" },
    dashboard: { id: "Dashboard", en: "Dashboard" },
    welcome: { id: "Selamat Datang", en: "Welcome" },
    // Admin
    adminDashboard: { id: "Dashboard Admin", en: "Admin Dashboard" },
    createAssessment: { id: "Buat Assessment Baru", en: "Create New Assessment" },
    manageUsers: { id: "Kelola Pengguna", en: "Manage Users" },
    assessmentName: { id: "Nama Assessment", en: "Assessment Name" },
    clientName: { id: "Nama Klien", en: "Client Name" },
    descriptionLabel: { id: "Deskripsi", en: "Description" },
    clientLogo: { id: "Logo Klien", en: "Client Logo" },
    create: { id: "Buat", en: "Create" },
    edit: { id: "Edit", en: "Edit" },
    delete: { id: "Hapus", en: "Delete" },
    cancel: { id: "Batal", en: "Cancel" },
    save: { id: "Simpan", en: "Save" },
    // Users
    createUser: { id: "Buat Pengguna Baru", en: "Create New User" },
    userName: { id: "Nama", en: "Name" },
    userEmail: { id: "Email", en: "Email" },
    userPassword: { id: "Password", en: "Password" },
    userRole: { id: "Role", en: "Role" },
    selectRole: { id: "Pilih Role", en: "Select Role" },
    selectAssessmentOption: { id: "Pilih Assessment", en: "Select Assessment" },
    admin: { id: "Admin", en: "Admin" },
    asesor: { id: "Asesor", en: "Asesor" },
    klien: { id: "Klien", en: "Client" },
    // Documents
    uploadDocument: { id: "Upload Laporan", en: "Upload Document" },
    myDocuments: { id: "Laporan Saya", en: "My Documents" },
    allDocuments: { id: "Semua Laporan", en: "All Documents" },
    documentTitle: { id: "Judul Dokumen", en: "Document Title" },
    fileName: { id: "Nama File", en: "File Name" },
    uploadedBy: { id: "Diupload Oleh", en: "Uploaded By" },
    uploadedAt: { id: "Tanggal Upload", en: "Upload Date" },
    upload: { id: "Upload", en: "Upload" },
    download: { id: "Download", en: "Download" },
    // Resumes
    uploadResume: { id: "Upload Resume", en: "Upload Resume" },
    resumes: { id: "Resume", en: "Resumes" },
    resumeTitle: { id: "Judul Resume", en: "Resume Title" },
    // Documentations
    uploadDocumentation: { id: "Upload Dokumentasi", en: "Upload Documentation" },
    documentations: { id: "Dokumentasi", en: "Documentations" },
    documentationTitle: { id: "Judul Dokumentasi", en: "Documentation Title" },
    viewFiles: { id: "Lihat File", en: "View Files" },
    // Messages
    loginSuccess: { id: "Login berhasil", en: "Login successful" },
    loginError: { id: "Login gagal. Periksa email dan password Anda.", en: "Login failed. Check your email and password." },
    uploadSuccess: { id: "File berhasil diupload", en: "File uploaded successfully" },
    uploadError: { id: "Upload gagal", en: "Upload failed" },
    deleteSuccess: { id: "Berhasil dihapus", en: "Deleted successfully" },
    deleteError: { id: "Gagal menghapus", en: "Delete failed" },
    createSuccess: { id: "Berhasil dibuat", en: "Created successfully" },
    createError: { id: "Gagal membuat", en: "Create failed" },
    updateSuccess: { id: "Berhasil diupdate", en: "Updated successfully" },
    updateError: { id: "Gagal mengupdate", en: "Update failed" },
    noAccess: { id: "Anda tidak memiliki akses ke halaman ini", en: "You don't have access to this page" },
  },

  // Footer
  footer: {
    tagline: { id: "People · Process · Technology – Engineered for Resilient Growth", en: "People · Process · Technology – Engineered for Resilient Growth" },
    links: {
      quickLinks: { id: "Link Cepat", en: "Quick Links" },
      services: { id: "Layanan", en: "Services" },
      contact: { id: "Kontak", en: "Contact" },
    },
    cta: { id: "Siap membangun kinerja berkelanjutan? Hubungi kami hari ini.", en: "Ready to build sustainable performance? Contact us today." },
    copyright: { id: "Hak Cipta", en: "Copyright" },
    rights: { id: "Seluruh hak dilindungi.", en: "All rights reserved." },
  },

  // Training Detail
  trainingDetail: {
    back: { id: "Kembali ke Info Pelatihan", en: "Back to Training Info" },
    program: { id: "Program Pelatihan", en: "Training Program" },
    scheduleLabel: { id: "Jadwal Pelaksanaan", en: "Execution Schedule" },
    locationLabel: { id: "Tempat", en: "Location" },
    priceLabel: { id: "Biaya", en: "Fee" },
    contactUs: { id: "Hubungi Kami", en: "Contact Us" },
    register: { id: "Daftar Sekarang", en: "Register Now" },
    about: { id: "Tentang Program", en: "About Program" },
    notFound: { id: "Pelatihan tidak ditemukan.", en: "Training not found." },
    noImage: { id: "Tidak ada gambar", en: "No image" },
    quotaLeft: { id: "Sisa kuota", en: "Slots remaining" },
    quotaFull: { id: "Kuota Penuh", en: "Fully Booked" },
  },

  // Registration Modal
  registrationModal: {
    eyebrow: { id: "Pendaftaran Peserta", en: "Participant Registration" },
    title: { id: "Form Pendaftaran Pelatihan", en: "Training Registration Form" },
    nameLabel: { id: "Nama Lengkap", en: "Full Name" },
    namePlaceholder: { id: "Masukkan nama lengkap Anda", en: "Enter your full name" },
    emailLabel: { id: "Alamat Email", en: "Email Address" },
    emailPlaceholder: { id: "contoh@email.com", en: "example@email.com" },
    phoneLabel: { id: "Nomor WhatsApp / HP", en: "WhatsApp / Phone Number" },
    phonePlaceholder: { id: "08123456789", en: "08123456789" },
    institutionLabel: { id: "Instansi / Perusahaan (Opsional)", en: "Institution / Company (Optional)" },
    institutionPlaceholder: { id: "Nama instansi atau perusahaan", en: "Institution or company name" },
    submitBtn: { id: "Kirim Pendaftaran", en: "Submit Registration" },
    submittingBtn: { id: "Mengirim...", en: "Submitting..." },
    successTitle: { id: "Pendaftaran Berhasil!", en: "Registration Successful!" },
    successDesc: { id: "Terima kasih telah mendaftar. Tim kami akan menghubungi Anda segera.", en: "Thank you for registering. Our team will contact you soon." },
    successDescPending: { id: "Terima kasih telah mendaftar. Bukti pembayaran Anda sedang kami verifikasi, mohon tunggu konfirmasi selanjutnya.", en: "Thank you for registering. Your payment proof is being verified, please wait for further confirmation." },
    errorMsg: { id: "Gagal mengirim pendaftaran. Silakan coba lagi.", en: "Failed to submit registration. Please try again." },
    closeBtn: { id: "Tutup", en: "Close" },
    paymentTitle: { id: "Informasi Pembayaran", en: "Payment Information" },
    bankNameLabel: { id: "Bank", en: "Bank" },
    accountNumberLabel: { id: "Nomor Rekening", en: "Account Number" },
    accountHolderLabel: { id: "Atas Nama", en: "Account Holder" },
    proofLabel: { id: "Unggah Bukti Transfer", en: "Upload Payment Proof" },
    proofUploading: { id: "Mengunggah bukti transfer...", en: "Uploading payment proof..." },
    proofRequiredError: { id: "Bukti pembayaran wajib diunggah", en: "Payment proof is required" },
  },
};

export function t(key: string, lang: Language): string {
  const keys = key.split(".");
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  if (value && typeof value === "object" && lang in value) {
    return (value as Record<Language, string>)[lang];
  }

  return key;
}
