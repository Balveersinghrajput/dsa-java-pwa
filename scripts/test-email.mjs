// Sends a test email with the SMTP settings in .env.local, to check forgot-password will work.
// Usage: node scripts/test-email.mjs [to-address]   (defaults to SMTP_USER)
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS = "", SMTP_FROM } = process.env;
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env.local first.");
  process.exit(1);
}
const port = Number(SMTP_PORT);
const t = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") } });
try {
  await t.verify();
  const to = process.argv[2] || SMTP_USER;
  await t.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject: "DSA in Java: test email", text: "SMTP works. Forgot-password emails will be delivered." });
  console.log(`✔ Sent a test email to ${to}`);
} catch (e) {
  console.error("✘ SMTP failed:", e.message);
  if (/Invalid login|535|BadCredentials/i.test(e.message)) console.error("  Gmail needs an App Password (not your normal password): https://myaccount.google.com/apppasswords");
  process.exit(1);
}
