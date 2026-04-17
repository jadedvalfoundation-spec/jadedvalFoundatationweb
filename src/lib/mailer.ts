import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,   // jadedvalfoundation@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not account password)
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions) {
  await transporter.sendMail({
    from: `"Jade D'Val Foundation" <${process.env.GMAIL_USER}>`,
    replyTo: "noreply@jadedvalfoundation.org",
    to,
    subject,
    html,
  });
}
