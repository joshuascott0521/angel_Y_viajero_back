import nodemailer from "nodemailer";

export const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_USER || "";

export function getTransporter() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    throw new Error("Faltan variables MAIL_USER / MAIL_PASS");
  }

  // Gmail SMTP via Nodemailer (app password)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}
