import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface SendMailParams {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

export async function sendMail(params: SendMailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: params.to,
      cc: params.cc,
      subject: params.subject,
      html: params.html,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}
