import nodemailer from 'nodemailer';

export async function enviarEmail({ para, assunto, html, linkDesenvolvimento }) {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== 'production') console.log(`[E-mail de desenvolvimento] ${assunto}: ${linkDesenvolvimento || ''}`);
    return false;
  }
  const transporte = nodemailer.createTransport({
    host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT || 587), secure:Number(process.env.SMTP_PORT) === 465,
    auth:{ user:process.env.SMTP_USER, pass:process.env.SMTP_PASS }
  });
  await transporte.sendMail({ from:process.env.SMTP_FROM, to:para, subject:assunto, html });
  return true;
}
