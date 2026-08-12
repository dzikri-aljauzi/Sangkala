import nodemailer from "nodemailer";

interface SendNotificationParams {
  trainingTitle: string;
  name: string;
  email: string;
  phone: string;
  institution?: string | null;
}

const isPlaceholder = (value: string | undefined): boolean => {
  if (!value) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("your-email") ||
    lower.includes("your-app-password") ||
    lower.includes("example.com")
  );
};

export async function sendAdminNotification({
  trainingTitle,
  name,
  email,
  phone,
  institution,
}: SendNotificationParams): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || user;

  if (!host || !user || !pass || !to || isPlaceholder(user) || isPlaceholder(pass)) {
    console.warn("SMTP email notification skipped: environment variables are missing or set to placeholder values.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const html = `
    <h2>Pendaftaran Pelatihan Baru</h2>
    <p>Ada pendaftar baru untuk pelatihan <strong>${trainingTitle}</strong>.</p>
    <h3>Data Peserta:</h3>
    <ul>
      <li><strong>Nama:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>No. Telepon / WA:</strong> ${phone}</li>
      <li><strong>Instansi / Perusahaan:</strong> ${institution || "-"}</li>
    </ul>
    <p>Waktu Pendaftaran: ${new Date().toLocaleString("id-ID")}</p>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `[Pendaftaran Baru] ${name} - ${trainingTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}
