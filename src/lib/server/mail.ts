import nodemailer from "nodemailer";

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/** Gmail shows App Passwords as "abcd efgh ijkl mnop"; the spaces aren't part of it. */
export const smtpPass = () => (process.env.SMTP_PASS || "").replace(/\s+/g, "");

export async function sendMail(to: string, subject: string, text: string, html: string) {
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: smtpPass() },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transport.sendMail({ from: process.env.SMTP_FROM || `DSA in Java <${process.env.SMTP_USER}>`, to, subject, text, html });
}
