import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1027,
  secure: false,
});

export async function sendMagicLinkEmail(to: string, magicLink: string) {
  await transporter.sendMail({
    from: '"Magik Link" <noreply@magiklink.dev>',
    to,
    subject: "Tu enlace para iniciar sesion",
    text: `Inicia sesion haciendo clic en este enlace: ${magicLink}\n\nEste enlace expira en 15 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #171717; margin-bottom: 24px;">Iniciar sesion en Magik Link</h2>
        <p style="color: #666; line-height: 1.6;">
          Haz clic en el boton de abajo para iniciar sesion. Este enlace expira en 15 minutos.
        </p>
        <a href="${magicLink}"
           style="display: inline-block; background: #7c3aed; color: #fff;
                  padding: 14px 36px; border-radius: 8px; text-decoration: none;
                  margin: 24px 0; font-weight: 600;">
          Iniciar Sesion
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 32px;">
          Si no solicitaste este enlace, puedes ignorar este correo.
        </p>
      </div>
    `,
  });
}
