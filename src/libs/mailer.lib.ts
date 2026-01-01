import nodamailer from 'nodemailer';

export const transporter = nodamailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  return await transporter.sendMail({
    from: '"Mailing System" <no-reply@flagare.cl>',
    to,
    subject,
    html,
  });
};
