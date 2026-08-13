import nodemailer from "nodemailer";

interface SendNotificationParams {
  trainingTitle: string;
  name: string;
  email: string;
  phone: string;
  institution?: string | null;
}

interface PaymentVerdictParams {
  to: string;
  name: string;
  trainingTitle: string;
}

interface PaymentRejectedParams extends PaymentVerdictParams {
  rejectionReason: string;
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

function getMailer(): { transporter: nodemailer.Transporter; from: string } | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || isPlaceholder(user) || isPlaceholder(pass)) {
    console.warn("SMTP email skipped: environment variables are missing or set to placeholder values.");
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    from: from!,
  };
}

export async function sendAdminNotification({
  trainingTitle,
  name,
  email,
  phone,
  institution,
}: SendNotificationParams): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const mailer = getMailer();
  if (!mailer || !to) {
    console.warn("SMTP email notification skipped: environment variables are missing or set to placeholder values.");
    return;
  }

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
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: `[Pendaftaran Baru] ${name} - ${trainingTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}

export async function notifyRegistrantPaymentApproved({
  to,
  name,
  trainingTitle,
}: PaymentVerdictParams): Promise<void> {
  const mailer = getMailer();
  if (!mailer) return;

  const html = `
    <h2>Pembayaran Terverifikasi</h2>
    <p>Halo ${name},</p>
    <p>Bukti pembayaran Anda untuk pelatihan <strong>${trainingTitle}</strong> sudah kami verifikasi dan disetujui. Pendaftaran Anda terkonfirmasi.</p>
    <p>Sampai jumpa di pelatihan!</p>
  `;

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: `[Pembayaran Disetujui] ${trainingTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send payment-approved email:", error);
  }
}

export async function notifyRegistrantPaymentRejected({
  to,
  name,
  trainingTitle,
  rejectionReason,
}: PaymentRejectedParams): Promise<void> {
  const mailer = getMailer();
  if (!mailer) return;

  const html = `
    <h2>Bukti Pembayaran Belum Bisa Diverifikasi</h2>
    <p>Halo ${name},</p>
    <p>Bukti pembayaran Anda untuk pelatihan <strong>${trainingTitle}</strong> belum bisa kami verifikasi, dengan alasan:</p>
    <p><em>${rejectionReason}</em></p>
    <p>Silakan daftar ulang dengan bukti pembayaran yang sesuai melalui halaman pelatihan.</p>
  `;

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to,
      subject: `[Pembayaran Perlu Diperbaiki] ${trainingTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send payment-rejected email:", error);
  }
}
